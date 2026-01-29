package com.anselumjuju.stores;

public class TokenStore {
    private static String accessToken;
    private static String expiryTime;
    private static String workspaceId;

    public static String getAccessToken() {
        return accessToken;
    }

    public static void setAccessToken(String accessToken) {
        TokenStore.accessToken = accessToken;
    }

    public static String getExpiryTime() {
        return expiryTime;
    }

    public static void setExpiryTime(String expiryTime) {
        TokenStore.expiryTime = expiryTime;
    }

    public static String getWorkspaceId() {
        return workspaceId;
    }

    public static void setWorkspaceId(String workspaceId) {
        TokenStore.workspaceId = workspaceId;
    }

    public static boolean isTokenExpired(String expiryTime) {
        if (expiryTime == null || expiryTime.trim().isEmpty())
            return true;

        long expiryTimeLong = (long) Double.parseDouble(expiryTime);
        return System.currentTimeMillis() >= expiryTimeLong;
    }

}
