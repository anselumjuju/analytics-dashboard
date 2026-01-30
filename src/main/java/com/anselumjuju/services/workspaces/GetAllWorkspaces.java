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
    static final String ANALYTICS_URL = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;
    static final String URL = ANALYTICS_URL + "/restapi/v2/workspaces";

    //    Returns workspaceIds after filtering out auto generated workspaces
    public static List<String> getAllOwnedWorkspaces() {

        try (HttpClient client = HttpClient.newHttpClient()) {
            String accessCode = AccessToken.getAccessToken();
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(new URI(URL))
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
            System.out.println("Error getting all owned workspaces " + e.getMessage());
            return null;
        }
    }
}
