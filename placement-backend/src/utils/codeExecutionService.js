import vm from 'vm';

/**
 * Normalizes test output for robust comparison across JSON arrays, objects, numbers, and strings
 */
export const normalizeOutput = (val) => {
  if (val === undefined || val === null) return '';
  if (typeof val === 'string') {
    // If it's a JSON string, try to parse and re-stringify to normalize spacing
    try {
      const parsed = JSON.parse(val.trim());
      return JSON.stringify(parsed);
    } catch {
      return val.trim().replace(/\r\n/g, '\n');
    }
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return val.toString();
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val).trim();
};

/**
 * Securely executes candidate JavaScript code in an isolated VM sandbox with timeouts and restricted globals
 */
export const executeJavaScriptCode = (code = '', testCases = [], options = {}) => {
  const { timeoutMs = 1500, maxOutputLength = 5000 } = options;
  const userCode = (code || '').trim();

  if (!userCode) {
    return {
      success: false,
      status: "NO_CODE",
      error: "No code submitted.",
      passedTests: 0,
      totalTests: testCases.length,
      percentage: 0,
      testCaseResults: []
    };
  }

  // Security check: block dangerous operations immediately
  const dangerousPatterns = [
    /\bprocess\b/,
    /\brequire\s*\(/,
    /\bimport\s*\(/,
    /\bchild_process\b/,
    /\bfs\b/,
    /\bnet\b/,
    /\bhttp\b/,
    /\bhttps\b/,
    /\beval\s*\(/,
    /\bFunction\s*\(/
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(userCode)) {
      return {
        success: false,
        status: "SECURITY_VIOLATION",
        error: "Security violation: Access to restricted runtime primitives is disallowed.",
        passedTests: 0,
        totalTests: testCases.length,
        percentage: 0,
        testCaseResults: testCases.map(tc => ({
          input: tc.input,
          expected: tc.expectedOutput,
          actual: "",
          passed: false,
          isHidden: Boolean(tc.isHidden),
          error: "Execution blocked by security policy"
        }))
      };
    }
  }

  // Extract function name from code (e.g. function sortedSquares(nums) or const sortedSquares = ...)
  const funcMatch = userCode.match(/function\s+([a-zA-Z0-9_$]+)\s*\(/) ||
                    userCode.match(/(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:function|\([^)]*\)\s*=>)/);
  const functionName = funcMatch ? funcMatch[1] : null;

  if (!functionName) {
    return {
      success: false,
      status: "SYNTAX_ERROR",
      error: "Could not identify a main function entrypoint. Please define a named function matching the problem signature.",
      passedTests: 0,
      totalTests: testCases.length,
      percentage: 0,
      testCaseResults: []
    };
  }

  if (testCases.length === 0) {
    const sandbox = {
      Math, Array, Object, String, Number, Boolean, Date, Set, Map, parseInt, parseFloat, isNaN, isFinite
    };
    const context = vm.createContext(sandbox);
    try {
      const script = new vm.Script(`
        ${userCode}
        ;typeof ${functionName} === 'function' ? ${functionName}() : null;
      `);
      const raw = script.runInContext(context, { timeout: timeoutMs });
      return {
        success: true,
        status: "PASSED",
        result: raw,
        hasRuntimeError: false,
        passedTests: 0,
        totalTests: 0,
        percentage: 100,
        testCaseResults: []
      };
    } catch (err) {
      return {
        success: false,
        status: "RUNTIME_ERROR",
        error: err.message,
        hasRuntimeError: true,
        passedTests: 0,
        totalTests: 0,
        percentage: 0,
        testCaseResults: []
      };
    }
  }

  const testCaseResults = [];
  let passedWeight = 0;
  let totalWeight = 0;
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const weight = tc.weight != null ? tc.weight : 1;
    totalWeight += weight;

    // Create safe sandbox context
    const sandbox = {
      console: {
        log: () => {},
        warn: () => {},
        error: () => {}
      },
      Math,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Date,
      Set,
      Map,
      parseInt,
      parseFloat,
      isNaN,
      isFinite
    };

    const context = vm.createContext(sandbox);

    let script;
    try {
      const serializedInput = JSON.stringify(tc.input);
      script = new vm.Script(`
        ${userCode}
        ;(() => {
          const fn = ${functionName};
          const inputArg = ${serializedInput};
          let result;
          if (Array.isArray(inputArg) && fn.length > 1) {
            result = fn(...inputArg);
          } else {
            result = fn(inputArg);
          }
          return result;
        })();
      `);
    } catch (compileErr) {
      return {
        success: false,
        status: "COMPILATION_ERROR",
        error: `Syntax/Compilation Error: ${compileErr.message}`,
        passedTests: 0,
        totalTests: testCases.length,
        percentage: 0,
        testCaseResults: testCases.map(t => ({
          input: t.input,
          expected: t.expectedOutput,
          actual: "",
          passed: false,
          isHidden: Boolean(t.isHidden),
          error: compileErr.message
        }))
      };
    }

    try {
      const startTime = Date.now();
      const actualRaw = script.runInContext(context, { timeout: timeoutMs });
      const durationMs = Date.now() - startTime;

      const actualNormalized = normalizeOutput(actualRaw);
      const expectedNormalized = normalizeOutput(tc.expectedOutput);

      const isPass = actualNormalized === expectedNormalized;
      if (isPass) {
        passedCount++;
        passedWeight += weight;
      }

      testCaseResults.push({
        testCaseIndex: i + 1,
        input: tc.isHidden ? "[Hidden Test Case]" : tc.input,
        expected: tc.isHidden ? "[Hidden]" : tc.expectedOutput,
        actual: tc.isHidden ? (isPass ? "[Passed]" : "[Failed Output]") : actualNormalized.slice(0, maxOutputLength),
        passed: isPass,
        isHidden: Boolean(tc.isHidden),
        durationMs,
        error: null
      });
    } catch (runErr) {
      const isTimeout = runErr.message.includes('timed out');
      testCaseResults.push({
        testCaseIndex: i + 1,
        input: tc.isHidden ? "[Hidden Test Case]" : tc.input,
        expected: tc.isHidden ? "[Hidden]" : tc.expectedOutput,
        actual: isTimeout ? "Time Limit Exceeded (>1500ms)" : "Runtime Error",
        passed: false,
        isHidden: Boolean(tc.isHidden),
        error: isTimeout ? "Time Limit Exceeded" : runErr.message
      });
    }
  }

  const percentage = totalWeight > 0 ? Math.round((passedWeight / totalWeight) * 100) : 0;
  let status = "PASSED";
  if (passedCount === 0) status = "FAILED";
  else if (passedCount < testCases.length) status = "PARTIALLY_PASSED";

  return {
    success: passedCount === testCases.length,
    status,
    passedTests: passedCount,
    totalTests: testCases.length,
    passedWeight,
    totalWeight,
    percentage,
    testCaseResults
  };
};

/**
 * Main coding question evaluation adapter
 */
export const evaluateCodingQuestion = (question = {}, submittedCode = '') => {
  const maxMarks = question.maxMarks || 10;
  const testCases = question.testCases || [];

  if (testCases.length === 0) {
    return {
      marksAwarded: 0,
      maxMarks,
      percentage: 0,
      feedback: "No test cases configured for this question.",
      details: null
    };
  }

  const execResult = executeJavaScriptCode(submittedCode, testCases);
  const marksAwarded = Math.round((execResult.percentage / 100) * maxMarks * 10) / 10;

  let feedback = "";
  if (execResult.success) {
    feedback = `✓ All ${execResult.totalTests} test cases passed! Full marks awarded.`;
  } else if (execResult.passedTests > 0) {
    feedback = `⚠️ Passed ${execResult.passedTests} of ${execResult.totalTests} test cases (${execResult.percentage}%). Edge cases failed.`;
  } else {
    feedback = `✕ Failed all test cases. ${execResult.error || "Review your algorithm logic and edge conditions."}`;
  }

  return {
    marksAwarded,
    maxMarks,
    percentage: execResult.percentage,
    status: execResult.status,
    passedTests: execResult.passedTests,
    totalTests: execResult.totalTests,
    testCaseResults: execResult.testCaseResults,
    feedback,
    modelAnswer: question.modelAnswer
  };
};

export const runCodeEvaluation = (question = {}, submittedCode = '', language = 'javascript') => {
  const res = evaluateCodingQuestion(question, submittedCode);
  return {
    ...res,
    isCorrect: res.status === 'PASSED',
    scoreAwarded: res.marksAwarded,
    passedTestsCount: res.passedTests,
    totalTestsCount: res.totalTests
  };
};

