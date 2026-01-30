package com.anselumjuju.utils;

import java.util.List;

public class AllowedValueResolver {

    public static String resolveFromAllowed(String input, List<String> allowedValues, double threshold) {
        String inputNorm = normalize(input);

        String best = null;
        double bestScore = 0.0;

        for (String value : allowedValues) {
            double score = similarity(inputNorm, normalize(value));
            if (score > bestScore) {
                bestScore = score;
                best = value;
            }
        }

        return bestScore >= threshold ? best : allowedValues.size() > 1 ? allowedValues.getFirst() : null;
    }

    public static String resolveFromAllowed(String input, List<String> allowedValues) {
        return resolveFromAllowed(input, allowedValues, 0.8);
    }

    private static String normalize(String str) {
        return str.toLowerCase()
                .replaceAll("[\\s_-]", "")
                .replaceAll("[^\\w]", "")
                .trim();
    }

    private static int levenshtein(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];

        for (int i = 0; i <= a.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= b.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = (a.charAt(i - 1) == b.charAt(j - 1)) ? 0 : 1;

                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
            }
        }

        return dp[a.length()][b.length()];
    }

    private static double similarity(String a, String b) {
        if (a.isEmpty() && b.isEmpty()) return 1.0;
        int distance = levenshtein(a, b);
        return 1.0 - (double) distance / Math.max(a.length(), b.length());
    }
}
