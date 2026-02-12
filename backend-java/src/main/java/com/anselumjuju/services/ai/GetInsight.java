package com.anselumjuju.services.ai;

import com.anselumjuju.lib.EnvConfig;
import com.google.genai.Client;
import com.google.genai.types.*;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.util.List;
import java.util.Map;

public class GetInsight {
    public static String getInsight(Map<String, Object> tableSchema, List<String> insights) {
        try (Client client = Client.builder().apiKey(EnvConfig.GEMINI_API_KEY).build()) {
            GenerateContentConfig config = GenerateContentConfig
                    .builder()
                    .systemInstruction(Content.fromParts(Part.fromText(getSystemInstruction())))
                    .responseMimeType("application/json")
                    .build();

            String prompt = getPrompt(tableSchema, insights).replaceAll("%", "%%");
            GenerateContentResponse response = client.models.generateContent("gemini-2.5-flash-lite", prompt, config);
            String text = response.text() + " ";
            String cleanedJson = text
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            Map<String, Object> responseBody = new Gson().fromJson(cleanedJson, new TypeToken<Map<String, Object>>() {
            }.getType());

            return (String) responseBody.get("insight");
        } catch (Exception e) {
            System.out.println("Error getting insights " + e.getMessage());
            return null;
        }
    }

    private static String getPrompt(Map<String, Object> tableSchema, List<String> insights) {
        return """
                INPUT DATA:
                TABLE SCHEMA (SOURCE OF TRUTH):
                """ + tableSchema.toString() + """                
                INSIGHTS (use these insights to create summary):
                """ + insights.toString() + """                
                OUTPUT SCHEMA (output should strictly follow this schema):
                {
                    "insight" : "[Overall insight as Markdown String][450–500 words]"
                }
                RULES (NON-NEGOTIABLE):
                DATA USAGE:
                - Use ONLY the provided insights as the analytical source
                - Do NOT introduce new metrics, calculations, assumptions, projections, or interpretations beyond what is explicitly stated
                - Preserve all metric names, numerical values, percentages, time periods, and directional trends exactly as written
                - If a value appears, it must remain unchanged
                ANALYTICAL EXPECTATIONS:
                - Infer the dataset domain using the TABLE SCHEMA
                - Understand the logical flow and sequencing of the provided insights
                - Identify key patterns, concentration effects, volatility, growth signals, risk indicators, and performance drivers
                - Consolidate all findings into ONE cohesive executive-level narrative
                - Focus on business implications rather than repeating individual statements
                - Avoid copying insight sentences verbatim; synthesize instead
                STRUCTURE REQUIREMENTS:
                - Output must be 200–300 words
                - Maintain executive tone and analytical clarity
                - Format the insight using clean Markdown suitable for rendering with markdown-it
                - Make the output more readable and clean for users
                - You MAY use:
                  - Headings (##, ###)
                  - Bullet lists or numbered lists
                  - **Bold text** for emphasis
                  - Paragraph spacing for structure
                  - Also add line breaks, and use lists.
                  - Don't use h1 tags
                JSON ENFORCEMENT:
                - Output MUST be strictly valid JSON
                - The JSON object must contain ONLY one key: "insight"
                - The value must be a single Markdown-formatted string
                - Do NOT include any additional keys
                - Do NOT include any text outside the JSON object
                EXAMPLE FORMAT (STRUCTURE ONLY — DO NOT COPY CONTENT):
                {
                    "insight": "## Executive Overview\\n\\nSummary paragraph...\\n\\n### Key Drivers\\n- Insight one\\n- Insight two\\n\\n### Strategic Implications\\nConsolidated executive narrative..."
                }
                """;
    }

    private static String getSystemInstruction() {
        return """
                ROLE:
                You are a Business Intelligence Synthesis Agent responsible for consolidating analytical insights into a single executive-level conclusion.
                MISSION:
                - Analyze the provided table schema to infer the dataset domain
                - Review the given report insights and understand their analytical flow
                - Determine what each insight represents in business terms
                - Synthesize them into one coherent, high-impact overall insight
                RULES:
                - Output must be strictly valid JSON
                - Derive conclusions only from the provided insights
                - Do not introduce new metrics, assumptions, or data
                - Preserve numerical values exactly as stated
                - Avoid generic summaries; focus on decision-level implications
                """;
    }
}
