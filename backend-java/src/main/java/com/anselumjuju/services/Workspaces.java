package com.anselumjuju.services;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.lib.AccessToken;
import com.anselumjuju.lib.Utils;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public class Workspaces {
    static final String ORG_ID = EnvConfig.ZOHO_ANALYTICS_ORG_ID;
    static final String ANALYTICS_URL = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;
    static final String accessCode = AccessToken.getAccessToken();

    public static String createWorkspace() {
        String uniqueId = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10);
        String workspaceName = "workspace_" + uniqueId;

        JsonObject params = new JsonObject();
        params.addProperty("workspaceName", workspaceName);

        String url = ANALYTICS_URL + "/restapi/v2/workspaces?CONFIG=" + Utils.encode(params.toString());

        try (HttpClient client = HttpClient.newHttpClient()) {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Zoho-oauthtoken " + accessCode)
                    .header("ZANALYTICS-ORGID", ORG_ID)
                    .POST(HttpRequest.BodyPublishers.noBody())
                    .build();

            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

            Gson gson = new Gson();
            Map<String, Object> body = gson.fromJson(res.body(), new TypeToken<Map<String, Object>>() {
            }.getType());

            Map<String, Object> data = (Map<String, Object>) body.get("data");

            if (!body.get("status").equals("success")) {
                System.out.println("Error creating workspace: " + data.get("errorMessage"));
                return null;
            }

            return (String) data.get("workspaceId");
        } catch (Exception e) {
            System.out.println("Error creating workspace: " + e.getMessage());
            return null;
        }
    }

    public static List<String> getAllOwnedWorkspaces() {
        String url = ANALYTICS_URL + "/restapi/v2/workspaces";

        try (HttpClient client = HttpClient.newHttpClient()) {
            String accessCode = AccessToken.getAccessToken();
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Zoho-oauthtoken " + accessCode)
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.out.println("Failed to fetch workspaces");
                return null;
            }

            Gson gson = new Gson();
            Map<String, Object> body = gson.fromJson(response.body(), new TypeToken<Map<String, Object>>() {
                    }.getType()
            );

            Map<String, Object> data = (Map<String, Object>) body.get("data");

            if (!body.get("status").equals("success")) {
                System.out.println("Error fetching workspaces: " + data.get("errorMessage"));
                return null;
            }

            List<Map<String, Object>> ownedWorkspaces = (List<Map<String, Object>>) data.get("ownedWorkspaces");

            List<String> workspaceIds = new ArrayList<>();
            for (Map<String, Object> workspace : ownedWorkspaces) {
                String name = (String) workspace.get("workspaceName");
                String id = (String) workspace.get("workspaceId");
                if (name != null && id != null && name.startsWith("workspace_"))
                    workspaceIds.add(id);
            }

            return workspaceIds;
        } catch (Exception e) {
            System.out.println("Error fetching workspaces: " + e.getMessage());
            return null;
        }
    }

    public static int deleteWorkspaces() {
        List<String> workspaces = getAllOwnedWorkspaces();
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
            System.out.println("Error deleting workspaces: " + e.getMessage());
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
                .thenApply(res -> res.statusCode() == 200)
                .exceptionally(ex -> {
                    System.err.println("Failed to delete workspace " + workspaceId + ": " + ex.getMessage());
                    return false;
                });
    }
}
