package com.anselumjuju.services.ai;

import java.util.*;

import com.anselumjuju.lib.EnvConfig;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.google.gson.Gson;

public class GetConfig {
    public static List<Map<String, Object>> getConfig(Map<String, Object> uploadResponse) {
        String tableName = uploadResponse.get("tableName").toString();
        Map<String, Object> tableSchema = (Map<String, Object>) uploadResponse.get("tableSchema");

        String prompt = GetPrompt.getPrompt(tableName, tableSchema);

        try (Client client = Client.builder().apiKey(EnvConfig.GEMINI_API_KEY).build()) {
            GenerateContentResponse response = client.models.generateContent("gemini-3-flash-preview", prompt, null);
            String text = response.text() + " ";
            String jsonContent = text.replaceAll("```json", "").replaceAll("```", "");
            Gson gson = new Gson();

            List<Map<String, Object>> configs = gson.fromJson(jsonContent, List.class);
            List<Map<String, Object>> validatedConfigs = ValidateConfigs.validateConfigs(tableName, tableSchema, configs);
            return validatedConfigs;
        } catch (Exception e) {
            return null;
        }
    }
}
