package com.anselumjuju.services;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.lib.AccessToken;
import com.anselumjuju.lib.Utils;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import jakarta.servlet.http.Part;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.CompletableFuture;

public class EmbedUrls {

    public static List<String> createEmbedUrls(List<String> viewIds, String workspaceId) {
        String accessCode = AccessToken.getAccessToken();
        String orgId = EnvConfig.ZOHO_ANALYTICS_ORG_ID;
        String analyticsUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;

        try (HttpClient client = HttpClient.newHttpClient()) {
            List<CompletableFuture<String>> futures = new ArrayList<>();

            for (String viewId : viewIds)
                if (viewId != null)
                    futures.add(createEmbedUrl(client, accessCode, orgId, analyticsUrl, workspaceId, viewId));

            List<String> embedUrls = new ArrayList<>();
            for (CompletableFuture<String> future : futures)
                if (future.join() != null)
                    embedUrls.add(future.join());

            System.out.println(embedUrls);

            return embedUrls;
        } catch (Exception e) {
            System.out.println("Failed to create Embed Urls " + e.getMessage());
            return null;
        }
    }

    private static CompletableFuture<String> createEmbedUrl(HttpClient client, String accessCode, String orgId, String analyticsUrl, String workspaceId, String viewId) {
        try {
            String url = analyticsUrl + "/restapi/v2/workspaces/" + workspaceId + "/views/" + viewId + "/publish/privatelink";
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Zoho-oauthtoken " + accessCode)
                    .header("ZANALYTICS-ORGID", orgId)
                    .POST(HttpRequest.BodyPublishers.ofString("{}"))
                    .build();

            return client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                    .thenApply(res -> {
                        System.out.println(res.body());
                        Map<String, Object> body = new Gson().fromJson(res.body(), new TypeToken<Map<String, Object>>() {
                        }.getType());
                        Map<String, Object> data = (Map<String, Object>) body.get("data");
                        return data.get("privateUrl").toString();
                    })
                    .exceptionally(ex -> null);
        } catch (Exception e) {
            System.out.println("Failed to create an Embed Url " + e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }

    public static List<String> getEmbedUrls(List<String> viewIds, String workspaceId) {
        String accessCode = AccessToken.getAccessToken();
        String orgId = EnvConfig.ZOHO_ANALYTICS_ORG_ID;
        String analyticsUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;

        try (HttpClient client = HttpClient.newHttpClient()) {
            List<CompletableFuture<String>> futures = new ArrayList<>();

            for (String viewId : viewIds)
                if (viewId != null)
                    futures.add(getEmbedUrl(client, accessCode, orgId, analyticsUrl, workspaceId, viewId));

            List<String> embedUrls = new ArrayList<>();
            for (CompletableFuture<String> future : futures)
                if (future.join() != null)
                    embedUrls.add(future.join());

            System.out.println(embedUrls);

            return embedUrls;
        } catch (Exception e) {
            System.out.println("Failed to create Embed Urls " + e.getMessage());
            return null;
        }
    }

    private static CompletableFuture<String> getEmbedUrl(HttpClient client, String accessCode, String orgId, String analyticsUrl, String workspaceId, String viewId) {
        try {
            String url = analyticsUrl + "/restapi/v2/workspaces/" + workspaceId + "/views/" + viewId + "/publish/privatelink";
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Zoho-oauthtoken " + accessCode)
                    .header("ZANALYTICS-ORGID", orgId)
                    .GET()
                    .build();

            return client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                    .thenApply(res -> {
                        if (res.statusCode() != 200) return null;
                        Map<String, Object> body = new Gson().fromJson(res.body(), new TypeToken<Map<String, Object>>() {
                        }.getType());
                        Map<String, Object> data = (Map<String, Object>) body.get("data");
                        return data.get("privateUrl").toString();
                    })
                    .exceptionally(ex -> null);
        } catch (Exception e) {
            System.out.println("Failed to get an Embed Url " + e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }

}
