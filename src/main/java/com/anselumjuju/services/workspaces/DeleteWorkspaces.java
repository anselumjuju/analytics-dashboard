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
    static final String ORG_ID = EnvConfig.ZOHO_ANALYTICS_ORG_ID;
    static final String ANALYTICS_URL = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;

    public static int deleteWorkspaces(List<String> workspaces) {
        if (workspaces == null || workspaces.isEmpty()) return 0;

        try (HttpClient client = HttpClient.newHttpClient()) {
            String accessCode = AccessToken.getAccessToken();
            List<CompletableFuture<Boolean>> futures = new ArrayList<>();

            for (String workspaceId : workspaces)
                futures.add(deleteWorkspaceById(client, accessCode, workspaceId));

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            int deletedCount = 0;
            for (CompletableFuture<Boolean> future : futures)
                if (future.join()) deletedCount++;

            return deletedCount;
        } catch (Exception e) {
            System.out.println("Error deleting workspaces " + e.getMessage());
            return 0;
        }
    }

    public static CompletableFuture<Boolean> deleteWorkspaceById(HttpClient client, String accessCode, String workspaceId) throws Exception {
        String url = ANALYTICS_URL + "/restapi/v2/workspaces/" + workspaceId;

        HttpRequest req = HttpRequest.newBuilder()
                .uri(new URI(url))
                .header("Authorization", "Zoho-oauthtoken " + accessCode)
                .header("ZANALYTICS-ORGID", ORG_ID)
                .DELETE()
                .build();

        return client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                .thenApply(res -> res.statusCode() >= 200 && res.statusCode() < 300)
                .exceptionally(ex -> {
                    System.err.println("Failed to delete workspace " + workspaceId + ": " + ex.getMessage());
                    return false;
                });
    }
}
