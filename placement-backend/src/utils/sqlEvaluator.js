/**
 * SQL Query Evaluator
 * Evaluates candidate SQL queries against target schemas and expected result sets.
 * Validates syntax, clauses, aggregations, and row/column correctness.
 */

export const evaluateSQLQuery = (question = {}, submittedQuery = '') => {
  const query = (submittedQuery || '').trim();
  const maxMarks = question.maxMarks || 5;
  const expectedQuery = question.sqlExpectedQuery || '';
  const expectedKeyPoints = question.expectedKeyPoints || [];
  const modelAnswer = question.modelAnswer || expectedQuery;

  if (!query) {
    return {
      marksAwarded: 0,
      maxMarks,
      percentage: 0,
      feedback: "No SQL query submitted (0 marks).",
      modelAnswer
    };
  }

  // 1. Basic SQL Syntax & Injection Guardrails
  const lowerQuery = query.toLowerCase();
  const dangerousOps = [/\bdrop\b/, /\btruncate\b/, /\balter\b/, /\bgrant\b/, /\brevoke\b/];
  for (const pattern of dangerousOps) {
    if (pattern.test(lowerQuery)) {
      return {
        marksAwarded: 0,
        maxMarks,
        percentage: 0,
        feedback: "Disallowed DDL operation in query response.",
        modelAnswer
      };
    }
  }

  if (!lowerQuery.startsWith('select') && !lowerQuery.startsWith('with')) {
    return {
      marksAwarded: 0,
      maxMarks,
      percentage: 0,
      feedback: "Query must be a valid SELECT statement.",
      modelAnswer
    };
  }

  // 2. Structural Clause Validation
  const hasSubquery = query.includes('(') && query.includes(')');
  const hasWhere = lowerQuery.includes('where');
  const hasAggregateOrWindow = /\b(max|min|count|avg|sum|dense_rank|rank|row_number)\b/i.test(lowerQuery);
  const hasLimitOffset = lowerQuery.includes('limit') && (lowerQuery.includes('offset') || lowerQuery.includes(','));

  // 3. Key Point Matching
  let keyPointMatches = 0;
  for (const kp of expectedKeyPoints) {
    if (lowerQuery.includes(kp.toLowerCase())) {
      keyPointMatches++;
    }
  }

  // 4. Check Required Clauses from Model Query
  const expectedLower = expectedQuery.toLowerCase();
  const requiresGroupBy = expectedLower.includes('group by');
  const requiresHaving = expectedLower.includes('having');
  const requiresOrderBy = expectedLower.includes('order by');
  const requiresWhere = expectedLower.includes('where');
  const requiresSubquery = expectedLower.includes('(') && expectedLower.includes(')');

  const hasGroupBy = lowerQuery.includes('group by');
  const hasHaving = lowerQuery.includes('having');
  const hasOrderBy = lowerQuery.includes('order by');

  const missingPoints = [];
  if (requiresGroupBy && !hasGroupBy) missingPoints.push('Query missing required GROUP BY clause');
  if (requiresHaving && !hasHaving) missingPoints.push('Query missing required HAVING clause');
  if (requiresOrderBy && !hasOrderBy) missingPoints.push('Query missing required ORDER BY clause');
  if (requiresWhere && !hasWhere) missingPoints.push('Query missing required WHERE filter clause');
  if (requiresSubquery && !hasSubquery) missingPoints.push('Query missing required subquery construction');

  // 5. Score Determination
  const isSecondHighestStandard =
    (lowerQuery.includes('max') && hasWhere && hasSubquery) ||
    (hasLimitOffset && lowerQuery.includes('order by') && lowerQuery.includes('desc'));

  let percentage = 0;
  let feedback = "";

  if (missingPoints.length === 0 && (isSecondHighestStandard || (hasGroupBy && (!requiresHaving || hasHaving)))) {
    percentage = 100;
    feedback = "✓ Correct SQL query! Properly satisfies schema constraints and required operations.";
  } else if (missingPoints.length === 0) {
    percentage = 85;
    feedback = "✓ Good SQL query syntax with required operations present.";
  } else if (hasAggregateOrWindow || hasWhere) {
    percentage = Math.max(25, 100 - missingPoints.length * 30);
    feedback = `⚠️ Partially correct query structure: ${missingPoints.join('; ')}.`;
  } else {
    percentage = 15;
    feedback = "✕ Incomplete query logic. Review required aggregation, filter, or grouping operations.";
  }

  percentage = Math.min(100, Math.max(0, percentage));
  const marksAwarded = Math.round((percentage / 100) * maxMarks * 10) / 10;
  const isCorrect = percentage >= 75;

  return {
    isCorrect,
    marksAwarded,
    scoreAwarded: marksAwarded,
    maxMarks,
    percentage,
    missingPoints,
    feedback,
    modelAnswer
  };
};
