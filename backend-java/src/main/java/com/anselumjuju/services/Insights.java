package com.anselumjuju.services;

import com.anselumjuju.lib.AccessToken;
import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.lib.Utils;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public class Insights {
    public static List<String> createInsights(List<String> viewIds, String workspaceId) {
        String accessCode = AccessToken.getAccessToken();
        String orgId = EnvConfig.ZOHO_ANALYTICS_ORG_ID;
        String analyticsUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;

        String url = analyticsUrl + "/restapi/v2/workspaces/" + workspaceId + "/views/<view_id>/zia/insights";

        try (HttpClient client = HttpClient.newHttpClient()) {
            List<CompletableFuture<String>> futures = new ArrayList<>();

            for (String viewId : viewIds)
                futures.add(createInsight(client, accessCode, orgId, url, viewId));

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[futures.size()])).join();

            List<String> insights = new ArrayList<>();
            for (CompletableFuture<String> future : futures)
                insights.add(future.join());

            return insights;
        } catch (Exception e) {
            System.out.println("Failed to create insights: " + e.getMessage());
            return null;
        }
    }

    private static CompletableFuture<String> createInsight(HttpClient client, String accessCode, String orgId, String baseUrl, String viewId) {
        String params = Utils.encode(new Gson().toJson(Map.of(
                "responseType", "string",
                "insightLang", "en",
                "verbosity", "high"
        )));
        String url = (baseUrl + "?CONFIG=" + params).replace("<view_id>", viewId);
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Zoho-oauthtoken " + accessCode)
                    .header("ZANALYTICS-ORGID", orgId)
                    .GET()
                    .build();

            return client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                    .thenApply(res -> {
                        Map<String, Object> body = new Gson().fromJson(res.body(), new TypeToken<Map<String, Object>>() {
                        }.getType());
                        Map<String, Object> data = (Map<String, Object>) body.get("data");

                        if (!body.get("status").equals("success")) {
                            System.out.println("Failed to create insight: " + data.get("errorMessage"));
                            return null;
                        }
                        Map<String, String> insights = (Map<String, String>) data.get("insights");

                        return insights.get("Insight");
                    })
                    .exceptionally(ex -> null);

        } catch (Exception e) {
            System.out.println("Failed to create insight: " + e.getMessage());
            return CompletableFuture.completedFuture(null);
        }
    }
}
