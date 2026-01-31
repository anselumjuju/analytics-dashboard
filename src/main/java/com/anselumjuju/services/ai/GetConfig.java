package com.anselumjuju.services.ai;

import java.util.*;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.services.ProgressSocket;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class GetConfig {
    public static List<Map<String, Object>> getConfig(Map<String, Object> uploadResponse, String jobId) {
        String tableName = uploadResponse.get("tableName").toString();
        Map<String, Object> tableSchema = (Map<String, Object>) uploadResponse.get("tableSchema");

        String prompt = GetPrompt.getPrompt(tableName, tableSchema);

        try (Client client = Client.builder().apiKey(EnvConfig.GEMINI_API_KEY).build()) {

            GenerateContentResponse response = client.models.generateContent("gemini-3-flash-preview", prompt, null);

            String text = response.text() + " ";
            String cleanedJson = text
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();
            Gson gson = new Gson();

            List<Map<String, Object>> configs = gson.fromJson(cleanedJson, new TypeToken<List<Map<String, Object>>>() {
            }.getType());


            ProgressSocket.send(jobId, 45, "Building smart Insights");
            return ValidateConfigs.validateConfigs(tableName, tableSchema, configs);
        } catch (Exception e) {
            System.out.println("Error getting configs " + e.getMessage());
            return null;
        }
    }
}
