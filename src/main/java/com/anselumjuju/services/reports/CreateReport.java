package com.anselumjuju.services.reports;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.stores.TokenStore;
import com.anselumjuju.utils.AccessToken;
import com.anselumjuju.utils.Utils;
import com.google.gson.Gson;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.CompletableFuture;

public class CreateReport {
    private static String baseUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;
    private static String workspaceId = TokenStore.getWorkspaceId();
    private static String accessCode = AccessToken.getAccessToken();
    private static String orgId = EnvConfig.ZOHO_ANALYTICS_ORG_ID;

    public static List<String> createReports(List<Map<String, Object>> configs) {
        Gson gson = new Gson();
        List<String> params = new ArrayList<>();
        for (Map<String, Object> config : configs)
            params.add(Utils.encode(gson.toJson(config)));

        String url = baseUrl + "/restapi/v2/workspaces/" + workspaceId + "/reports?CONFIG=";

        try (HttpClient client = HttpClient.newHttpClient()) {
            List<CompletableFuture<String>> futures = new ArrayList<>();
            for (String param : params)
                futures.add(createReport(client, url, param));

            List<String> viewIds = new ArrayList<>();
            for (CompletableFuture<String> future : futures)
                viewIds.add(future.join());

            return viewIds;
        } catch (Exception e) {
            System.out.println("Failed to create reports " + e.getMessage());
            return null;
        }
    }

    private static CompletableFuture<String> createReport(HttpClient client, String url, String config) throws Exception {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(new URI(url + config))
                .header("Authorization", "Zoho-oauthtoken " + accessCode)
                .header("ZANALYTICS-ORGID", orgId)
                .POST(HttpRequest.BodyPublishers.ofString(config))
                .build();

        return client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                .thenApply(res -> {
                    Map<String, Object> body = new Gson().fromJson(res.body(), Map.class);
                    Map<String, Object> data = (Map<String, Object>) body.get("data");
                    return data.get("viewId").toString();
                })
                .exceptionally(ex -> null);
    }
}
