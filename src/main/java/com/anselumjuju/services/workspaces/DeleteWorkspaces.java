package com.anselumjuju.services.workspaces;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.utils.AccessToken;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class DeleteWorkspaces {
    static String accessCode = AccessToken.getAccessToken();
    static String orgId = EnvConfig.ZOHO_ANALYTICS_ORG_ID;
    static String analyticsUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;

    public static int deleteWorkspaces(List<String> workspaces) {
        int deletedWorkspaces = 0;

        try (HttpClient client = HttpClient.newHttpClient()) {
            List<CompletableFuture<Boolean>> futures = new ArrayList<>();

            for (String workspaceId : workspaces)
                futures.add(deleteWorkspaceById(client, workspaceId));

            List<Boolean> results = new ArrayList<>();
            for (CompletableFuture<Boolean> future : futures)
                results.add(future.join());

            for (Boolean result : results)
                if (result) deletedWorkspaces++;

        } catch (Exception e) {
            System.out.println("Error deleting workspaces " + e.getMessage());
        }

        return deletedWorkspaces;
    }

    public static CompletableFuture<Boolean> deleteWorkspaceById(HttpClient client, String workspaceId) throws Exception {
        String url = analyticsUrl + "/restapi/v2/workspaces/" + workspaceId;
        HttpRequest req = HttpRequest.newBuilder()
                .uri(new URI(url))
                .header("Authorization", "Zoho-oauthtoken " + accessCode)
                .header("ZANALYTICS-ORGID", orgId)
                .DELETE()
                .build();

        return client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                .thenApply(res -> res.statusCode() >= 200 && res.statusCode() < 300)
                .exceptionally(ex -> false);
    }
}
