/**
 * Deterministic Objective Question Evaluator
 * Evaluates Multiple-Choice (MCQ) and Numerical-Answer questions server-side.
 * Never exposes server answer keys to the client before grading.
 */

export const evaluateObjectiveQuestion = (question = {}, studentAnswer = '', options = {}) => {
  const { negativeMarking = false, negativeMarkWeight = 0.25 } = options;
  const maxMarks = question.maxMarks || 2;
  const answer = (studentAnswer || '').toString().trim();

  // If question was not answered
  if (!answer) {
    return {
      isAnswered: false,
      isCorrect: false,
      marksAwarded: 0,
      percentageScore: 0,
      feedback: "Unanswered question (0 marks awarded).",
      explanation: question.explanation || "No explanation provided."
    };
  }

  // 1. EVALUATE MULTIPLE-CHOICE QUESTIONS (MCQs)
  if (question.questionType === 'mcq') {
    const rawExpected = (question.correctAnswer || '').toString().trim();
    const candidateAnswer = answer.toLowerCase();
    const expectedLower = rawExpected.toLowerCase();

    const letters = ['a', 'b', 'c', 'd', 'e'];
    let expectedIdx = -1;
    if (letters.includes(expectedLower)) {
      expectedIdx = letters.indexOf(expectedLower);
    } else if (question.options && Array.isArray(question.options)) {
      expectedIdx = question.options.findIndex(opt => opt.toLowerCase().trim() === expectedLower);
    }

    const expectedText = (expectedIdx !== -1 && question.options?.[expectedIdx])
      ? question.options[expectedIdx].toLowerCase().trim()
      : expectedLower;
    const expectedLetter = expectedIdx !== -1 ? letters[expectedIdx] : expectedLower;

    let studentIdx = -1;
    if (letters.includes(candidateAnswer)) {
      studentIdx = letters.indexOf(candidateAnswer);
    } else if (question.options && Array.isArray(question.options)) {
      studentIdx = question.options.findIndex(opt => opt.toLowerCase().trim() === candidateAnswer);
    }

    let isCorrect = false;
    if (studentIdx !== -1 && expectedIdx !== -1) {
      isCorrect = studentIdx === expectedIdx;
    } else {
      isCorrect = (
        candidateAnswer === expectedLower ||
        candidateAnswer === expectedText ||
        candidateAnswer === expectedLetter
      );
    }

    if (isCorrect) {
      return {
        isAnswered: true,
        isCorrect: true,
        marksAwarded: maxMarks,
        scoreAwarded: maxMarks,
        percentageScore: 100,
        feedback: "✓ Correct answer! Full marks awarded.",
        explanation: question.explanation
      };
    } else {
      const penalty = negativeMarking ? Math.round(maxMarks * negativeMarkWeight * 100) / 100 : 0;
      const finalPenalty = penalty === 0 ? 0 : -penalty;
      return {
        isAnswered: true,
        isCorrect: false,
        marksAwarded: finalPenalty,
        scoreAwarded: finalPenalty,
        percentageScore: 0,
        feedback: negativeMarking && penalty > 0
          ? `✕ Incorrect. Negative marking applied (-${penalty} marks).`
          : "✕ Incorrect answer (0 marks awarded).",
        explanation: question.explanation
      };
    }
  }

  // 2. EVALUATE NUMERICAL-ANSWER QUESTIONS
  if (question.questionType === 'numerical') {
    const studentNum = parseFloat(answer);
    const expectedNum = parseFloat(question.correctAnswer);
    const tolerance = question.numericalTolerance != null ? question.numericalTolerance : 0.01;

    if (isNaN(studentNum) || isNaN(expectedNum)) {
      return {
        isAnswered: true,
        isCorrect: false,
        marksAwarded: 0,
        percentageScore: 0,
        feedback: "✕ Invalid numerical format provided.",
        explanation: question.explanation
      };
    }

    const diff = Math.abs(studentNum - expectedNum);
    const isCorrect = diff <= tolerance;

    if (isCorrect) {
      return {
        isAnswered: true,
        isCorrect: true,
        marksAwarded: maxMarks,
        percentageScore: 100,
        feedback: `✓ Correct! Your answer ${studentNum} is within the required tolerance range.`,
        explanation: question.explanation
      };
    } else {
      // Check if it was close (likely minor rounding/calculation error vs conceptual mistake)
      const isCalculationMistake = diff <= tolerance * 5;
      const feedbackNote = isCalculationMistake
        ? `✕ Incorrect value (${studentNum}). It appears close to the expected value (${expectedNum}), indicating a potential calculation or rounding error.`
        : `✕ Incorrect value (${studentNum}). Expected value is ${expectedNum}.`;

      return {
        isAnswered: true,
        isCorrect: false,
        marksAwarded: 0,
        scoreAwarded: 0,
        percentageScore: 0,
        feedback: feedbackNote,
        explanation: question.explanation
      };
    }
  }

  // Default fallback for unrecognized objective question types
  const isMatch = answer.toLowerCase() === (question.correctAnswer || '').toLowerCase().trim();
  return {
    isAnswered: true,
    isCorrect: isMatch,
    marksAwarded: isMatch ? maxMarks : 0,
    scoreAwarded: isMatch ? maxMarks : 0,
    percentageScore: isMatch ? 100 : 0,
    feedback: isMatch ? "✓ Correct answer." : "✕ Incorrect answer.",
    explanation: question.explanation
  };
};

export const evaluateMCQAnswer = (question = {}, answer = '', options = {}) => {
  const q = { ...question, questionType: 'mcq' };
  const res = evaluateObjectiveQuestion(q, answer, {
    negativeMarking: question.negativeMarking > 0 || !!options.negativeMarking,
    negativeMarkWeight: question.negativeMarking ? (question.negativeMarking / (question.maxMarks || 1)) : (options.negativeMarkWeight || 0.25)
  });
  return {
    ...res,
    scoreAwarded: res.marksAwarded
  };
};

export const evaluateNumericalAnswer = (question = {}, answer = '', options = {}) => {
  const q = { ...question, questionType: 'numerical' };
  const res = evaluateObjectiveQuestion(q, answer, options);
  const studentNum = parseFloat(answer);
  const expectedNum = parseFloat(question.correctAnswer);
  const diff = Math.abs(studentNum - expectedNum);
  const tol = question.numericalTolerance != null ? question.numericalTolerance : 0.01;
  const isCalc = !res.isCorrect && !isNaN(diff) && diff <= tol * 5;
  const score = res.isCorrect
    ? (q.maxMarks || 2)
    : (isCalc ? Math.round((q.maxMarks || 2) * 0.4 * 10) / 10 : 0);

  return {
    ...res,
    scoreAwarded: score,
    isCalculationMistake: isCalc
  };
};

