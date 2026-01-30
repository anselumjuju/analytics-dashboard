package com.anselumjuju.services.reports;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.stores.TokenStore;
import com.anselumjuju.utils.AccessToken;
import com.anselumjuju.utils.Utils;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.CompletableFuture;

public class CreateReport {

    public static List<String> createReports(List<Map<String, Object>> configs) {

        String baseUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;
        String workspaceId = TokenStore.getWorkspaceId();
        String accessCode = AccessToken.getAccessToken();
        String orgId = EnvConfig.ZOHO_ANALYTICS_ORG_ID;

        Gson gson = new Gson();

        List<String> viewIds = new ArrayList<>();
        List<CompletableFuture<String>> futures = new ArrayList<>();

        String url = baseUrl + "/restapi/v2/workspaces/" + workspaceId + "/reports?CONFIG=";

        try (HttpClient client = HttpClient.newHttpClient()) {
            List<String> params = new ArrayList<>();
            for (Map<String, Object> config : configs)
                params.add(Utils.encode(gson.toJson(config)));

            for (String param : params)
                futures.add(createReport(client, accessCode, orgId, url, param));

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            for (CompletableFuture<String> future : futures)
                if (future.join() != null) viewIds.add(future.join());

            return viewIds;
        } catch (Exception e) {
            System.out.println("Failed to create reports " + e.getMessage());
            return null;
        }
    }

    private static CompletableFuture<String> createReport(HttpClient client, String accessCode, String orgId, String url, String config) {
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(new URI(url + config))
                    .header("Authorization", "Zoho-oauthtoken " + accessCode)
                    .header("ZANALYTICS-ORGID", orgId)
                    .POST(HttpRequest.BodyPublishers.ofString(config))
                    .build();

            return client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                    .thenApply(res -> {
                        if (res.statusCode() != 200) return null;

                        Map<String, Object> body = new Gson().fromJson(res.body(), new TypeToken<Map<String, Object>>() {
                        }.getType());
                        Map<String, Object> data = (Map<String, Object>) body.get("data");

                        return data.get("viewId").toString();
                    })
                    .exceptionally(ex -> null);
        } catch (Exception e) {
            return CompletableFuture.completedFuture(null);
        }
    }
}
