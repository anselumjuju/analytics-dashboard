package com.anselumjuju.services.embed;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.stores.TokenStore;
import com.anselumjuju.utils.AccessToken;
import com.google.gson.Gson;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public class CreateEmbedUrls {
    static String accessCode = AccessToken.getAccessToken();
    static String orgId = EnvConfig.ZOHO_ANALYTICS_ORG_ID;
    static String analyticsUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;
    static String workspaceId = TokenStore.getWorkspaceId();

    public static List<String> createEmbedUrls(List<String> viewIds){
        viewIds.removeIf(viewId -> viewId == null);

        try(HttpClient client = HttpClient.newHttpClient()){
            List<CompletableFuture<String>> futures = new ArrayList<>();

            for(String viewId: viewIds)
                futures.add(getEmbedUrl(client, viewId));

            List<String> embedUrls = new ArrayList<>();
            for(CompletableFuture<String> future: futures)
                embedUrls.add(future.join());

            return embedUrls;
        } catch (Exception e) {
            System.out.println("Failed to create Embed Urls " + e.getMessage());
            return null;
        }
    }

    private static CompletableFuture<String> getEmbedUrl(HttpClient client, String viewId) throws Exception{
        String url = analyticsUrl + "/restapi/v2/workspaces/" + workspaceId + "/views/" + viewId + "/publish/privatelink";
        HttpRequest req = HttpRequest.newBuilder()
                .uri(new URI(url))
                .header("Authorization", "Zoho-oauthtoken " + accessCode)
                .header("ZANALYTICS-ORGID", orgId)
                .POST(HttpRequest.BodyPublishers.ofString("{}"))
                .build();

        return client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                .thenApply(res -> {
                    Map<String, Object> body = new Gson().fromJson(res.body(), Map.class);
                    Map<String, Object> data = (Map<String, Object>) body.get("data");
                    return data.get("privateUrl").toString();
                })
                .exceptionally(ex -> null);
    }
}
