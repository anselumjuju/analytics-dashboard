package com.anselumjuju.services.accessToken;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.stores.TokenStore;
import com.anselumjuju.utils.Utils;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

public class GenerateAccessToken {
    public static String generateAccessToken() {
        String refreshToken = EnvConfig.ZOHO_ANALYTICS_REFRESH_TOKEN;
        String clientId = EnvConfig.ZOHO_ANALYTICS_CLIENT_ID;
        String clientSecret = EnvConfig.ZOHO_ANALYTICS_CLIENT_SECRET;
        String authUrl = EnvConfig.ZOHO_ACCOUNT_BASE_URL;

        String params = String.format(
                "refresh_token=%s&client_id=%s&client_secret=%s&grant_type=refresh_token",
                Utils.encode(refreshToken),
                Utils.encode(clientId),
                Utils.encode(clientSecret)
        );

        String url = authUrl + "/oauth/v2/token?" + params;

        try (HttpClient client = HttpClient.newHttpClient()) {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .POST(HttpRequest.BodyPublishers.ofString(params))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            Gson gson = new Gson();
            Map<String, Object> body = gson.fromJson(
                    response.body(),
                    new TypeToken<Map<String, Object>>() {
                    }.getType()
            );

            String accessToken = String.valueOf(body.get("access_token"));

            String expiryIn = String.valueOf(body.get("expires_in"));
            String expiryTime = String.valueOf(System.currentTimeMillis() + ((long) Double.parseDouble(expiryIn) * 1000));

            TokenStore.setAccessToken(accessToken);
            TokenStore.setExpiryTime(expiryTime);

            return accessToken;
        } catch (Exception e) {
            System.out.println("Error generating access token " + e.getMessage());
            return "";
        }
    }
}
