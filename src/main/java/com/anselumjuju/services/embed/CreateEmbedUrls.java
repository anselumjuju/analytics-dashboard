package com.anselumjuju.services.embed;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.stores.TokenStore;
import com.anselumjuju.utils.AccessToken;
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

public class CreateEmbedUrls {

    public static List<String> createEmbedUrls(List<String> viewIds) {
        String accessCode = AccessToken.getAccessToken();
        String orgId = EnvConfig.ZOHO_ANALYTICS_ORG_ID;
        String analyticsUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;
        String workspaceId = TokenStore.getWorkspaceId();

        try (HttpClient client = HttpClient.newHttpClient()) {
            List<CompletableFuture<String>> futures = new ArrayList<>();

            for (String viewId : viewIds)
                if (viewId != null)
                    futures.add(getEmbedUrl(client, accessCode, orgId, analyticsUrl, workspaceId, viewId));

            List<String> embedUrls = new ArrayList<>();
            for (CompletableFuture<String> future : futures)
                if (future.join() != null)
                    embedUrls.add(future.join());

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
                    .POST(HttpRequest.BodyPublishers.ofString("{}"))
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
            return CompletableFuture.completedFuture(null);
        }
    }
}
