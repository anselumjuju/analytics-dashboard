package com.anselumjuju.services.workspaces;

import com.anselumjuju.lib.EnvConfig;
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

public class GetAllWorkspaces {
    static String accessCode = AccessToken.getAccessToken();
    static String analyticsUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;

    //    Returns workspaceIds after filtering out auto generated workspaces
    public static List<String> getAllOwnedWorkspaces() {
        String url = analyticsUrl + "/restapi/v2/workspaces";

        try (HttpClient client = HttpClient.newHttpClient()) {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Zoho-oauthtoken " + accessCode)
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());

            Gson gson = new Gson();
            Map<String, Object> body = gson.fromJson(
                    response.body(),
                    new TypeToken<Map<String, Object>>() {
                    }.getType()
            );

            Map<String, Object> data = (Map<String, Object>) body.get("data");
            List<Map<String, Object>> ownedWorkspaces = (List<Map<String, Object>>) data.get("ownedWorkspaces");

            List<String> workspaceIds = new ArrayList<>();
            for (Map<String, Object> workspace : ownedWorkspaces) {
                String workspaceName = (String) workspace.get("workspaceName");
                if (workspaceName.startsWith("workspace_"))
                    workspaceIds.add((String) workspace.get("workspaceId"));
            }

            return workspaceIds;
        } catch (Exception e) {
            System.out.println("Error getting all owned workspaces " + e.getMessage());
        }

        return null;
    }
}
