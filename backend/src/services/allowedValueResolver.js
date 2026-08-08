export function resolveFromAllowed(input, allowedValues) {
  const threshold = 0.8;
  const inputNorm = normalize(input);

  let best = null;
  let bestScore = 0;

  for (const value of allowedValues) {
    const score = similarity(inputNorm, normalize(value));
    if (score > bestScore) {
      bestScore = score;
      best = value;
    }
  }

  return (
    bestScore >= threshold ? best
    : allowedValues.length > 1 ? allowedValues[0]
    : null
  );
}

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[\s_-]/g, '')
    .replace(/[^\w]/g, '')
    .trim();
}

function levenshtein(a, b) {
  const dp = Array.from({length: a.length + 1}, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[a.length][b.length];
}

function similarity(a, b) {
  if (!a && !b) return 1;
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}
