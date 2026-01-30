package com.anselumjuju.services.workspaces;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.stores.TokenStore;
import com.anselumjuju.utils.AccessToken;
import com.anselumjuju.utils.Utils;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.UUID;

public class CreateWorkSpace {
    public static Boolean createWorkspace() {
        String accessCode = AccessToken.getAccessToken();
        String orgId = EnvConfig.ZOHO_ANALYTICS_ORG_ID;
        String baseUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;

        String uniqueId = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10);
        String workspaceName = "workspace_" + uniqueId;

        JsonObject params = new JsonObject();
        params.addProperty("workspaceName", workspaceName);
        String paramsString = params.toString();

        String url = baseUrl + "/restapi/v2/workspaces?CONFIG=" + Utils.encode(paramsString);

        try (HttpClient client = HttpClient.newHttpClient()) {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Zoho-oauthtoken " + accessCode)
                    .header("ZANALYTICS-ORGID", orgId)
                    .POST(HttpRequest.BodyPublishers.ofString(paramsString))
                    .build();

            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());

            Gson gson = new Gson();
            Map<String, Object> body = gson.fromJson(
                    res.body(),
                    new TypeToken<Map<String, Object>>() {
                    }.getType()
            );

            Map<String, Object> data = (Map<String, Object>) body.get("data");
            String workspaceId = (String) data.get("workspaceId");

            TokenStore.setWorkspaceId(workspaceId);
        } catch (Exception e) {
            System.out.println("Error creating workspace " + e.getMessage());
            return false;
        }

        return true;
    }
}
