package com.anselumjuju.utils;

import com.anselumjuju.services.accessToken.GenerateAccessToken;
import com.anselumjuju.stores.TokenStore;

public class AccessToken {
    public static synchronized String getAccessToken() {
        String accessToken = TokenStore.getAccessToken();
        String expiryTime = TokenStore.getExpiryTime();

        if (accessToken == null || TokenStore.isTokenExpired(expiryTime))
            accessToken = GenerateAccessToken.generateAccessToken();

        return accessToken;
    }
}
