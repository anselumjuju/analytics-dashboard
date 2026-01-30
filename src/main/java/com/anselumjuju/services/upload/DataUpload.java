package com.anselumjuju.services.upload;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.stores.TokenStore;
import com.anselumjuju.utils.AccessToken;
import com.anselumjuju.utils.Utils;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import jakarta.servlet.http.Part;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

public class DataUpload {
    public static Map<String, Object> uploadFile(Part filePart) {
        String baseUrl = EnvConfig.ZOHO_AUTH_ANALYTICS_URL;
        String orgId = EnvConfig.ZOHO_ANALYTICS_ORG_ID;
        String accessCode = AccessToken.getAccessToken();
        String workspaceId = TokenStore.getWorkspaceId();

        String uniqueId = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10);
        String tableName = "table_" + uniqueId;

        JsonObject params = new JsonObject();
        params.addProperty("tableName", tableName);
        params.addProperty("fileType", "csv");
        params.addProperty("autoIdentify", "true");
        params.addProperty("onError", "skiprow");

        String url = String.format(
                "%s/restapi/v2/workspaces/%s/data?CONFIG=%s",
                baseUrl,
                workspaceId,
                Utils.encode(params.toString())
        );

        try (HttpClient client = HttpClient.newHttpClient()) {
            String boundary = "Boundary-" + System.currentTimeMillis();
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(new URI(url))
                    .header("Authorization", "Zoho-oauthtoken " + accessCode)
                    .header("ZANALYTICS-ORGID", orgId)
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(buildMultipartBody(filePart, boundary))
                    .build();

            HttpResponse<String> response = client.send(req, HttpResponse.BodyHandlers.ofString());

            Gson gson = new Gson();
            Map<String, Object> body = gson.fromJson(
                    response.body(),
                    new TypeToken<Map<String, Object>>() {
                    }.getType()
            );

            if (!"success".equals(body.get("status")))
                throw new Exception("Failed to Upload data");

            Map<String, Object> data = (Map<String, Object>) body.get("data");

            Map<String, Object> result = new HashMap<>();
            result.put("status", "success");
            result.put("tableName", tableName);
            result.put("tableSchema", data.get("columnDetails"));

            return result;
        } catch (Exception e) {
            System.out.println("Error uploading file " + e.getMessage());
            return null;
        }
    }

    private static HttpRequest.BodyPublisher buildMultipartBody(Part filePart, String boundary) throws Exception {
        List<byte[]> body = new ArrayList<>();
        String filename = filePart.getSubmittedFileName();

        body.add(("--" + boundary + "\r\n").getBytes());
        body.add(("Content-Disposition: form-data; name=\"FILE\"; filename=\"" + filename + "\"\r\n").getBytes());
        body.add(("Content-Type: application/octet-stream\r\n\r\n").getBytes());
        body.add(filePart.getInputStream().readAllBytes());
        body.add("\r\n".getBytes());
        body.add(("--" + boundary + "--\r\n").getBytes());

        return HttpRequest.BodyPublishers.ofByteArrays(body);
    }


}
