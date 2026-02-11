package com.anselumjuju.services.ai;

import java.util.*;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.lib.ReportConfigSchema;
import com.anselumjuju.services.ProgressSocket;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class GetConfig {
    public static Map<String, Object> getConfig(Map<String, Object> uploadResponse, String jobId) {
        String tableName = uploadResponse.get("tableName").toString();
        Map<String, Object> tableSchema = (Map<String, Object>) uploadResponse.get("tableSchema");

        String prompt = getPrompt(tableName, tableSchema);

        try (Client client = Client.builder().apiKey(EnvConfig.GEMINI_API_KEY).build()) {

            GenerateContentConfig config = GenerateContentConfig
                    .builder()
                    .systemInstruction(Content.fromParts(Part.fromText(getSystemInstruction())))
                    .responseMimeType("application/json")
                    .build();

            GenerateContentResponse response = client.models.generateContent("gemini-2.5-flash-lite", prompt, config);
            String text = response.text() + " ";
            String cleanedJson = text
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            Map<String, Object> responseBody = new Gson().fromJson(cleanedJson, new TypeToken<Map<String, Object>>() {
            }.getType());

            List<Map<String, Object>> configs = (List<Map<String, Object>>) responseBody.get("configs");

            ProgressSocket.send(jobId, 45, "Building smart Insights");
            List<Map<String, Object>> validatedConfigs = ValidateConfigs.validateConfigs(tableName, tableSchema, configs);

            Map<String, Object> resMap = new HashMap<>();
            resMap.put("reportHeading", responseBody.get("reportHeading"));
            resMap.put("configs", validatedConfigs);

            return resMap;
        } catch (Exception e) {
            System.out.println("Error getting configs " + e.getMessage());
            return null;
        }
    }

    private static String getPrompt(String tableName, Map<String, Object> tableSchema) {
        String reportConfigSchema = ReportConfigSchema.reportConfigSchema();

        return String.format(
                """
                        INPUT DATA (AUTHORITATIVE):
                        TABLE SCHEMA (SOURCE OF TRUTH):
                        %s
                        
                        CONFIG CONTRACT (STRICT & IMMUTABLE):
                        %s
                        
                        BASE TABLE NAME (IMMUTABLE):
                        %s
                        
                        GLOBAL RULES — NON-NEGOTIABLE:
                        - createReportSchema is a STRICT contract
                        - Do NOT add, remove, rename, or reorder any fields
                        - Use ONLY columns explicitly present in TABLE SCHEMA
                        - Use baseTableName EXACTLY as provided
                        - NEVER modify, alias, or infer alternative table names
                        - Output MUST be valid JSON
                        - Do NOT include explanations, reasoning steps, or markdown
                        
                        OBJECTIVE:
                        Design a production-grade Business Intelligence analytics report that delivers
                        high-impact, decision-oriented insights derived strictly from the given table schema.
                        The output must resemble work produced by a senior BI professional.
                        
                        PHASE 1 — SCHEMA & DOMAIN UNDERSTANDING:
                        - Classify each column as: metric, dimension, time, or identifier
                        - Infer the real-world business domain (Sales, Finance, Operations, HR, etc.)
                        - Identify decision-driving metrics and operational signals
                        
                        PHASE 2 — ANALYTICS STORY FLOW (STRICT ORDER):
                        Construct insights in the following narrative sequence:
                        1. Executive overview
                        2. Core performance indicators
                        3. Temporal trends
                        4. Top contributors
                        5. Bottom performers
                        6. Key drivers
                        7. Risk indicators
                        8. Optimization opportunities
                        9. Growth signals
                        
                        PHASE 3 — BUSINESS QUESTIONS:
                        - Generate 7–10 UNIQUE, non-trivial business questions
                        - Each question MUST:
                          - Be answerable using the provided schema
                          - Combine at least two meaningful columns
                          - Be directly useful for decision-making
                        
                        PHASE 4 — ANALYSIS & VISUAL SELECTION:
                        For each business question:
                        - Select the strongest analytical comparison:
                          trend, ranking, contribution, breakdown, or correlation
                        - Choose the optimal visualization:
                          - Trend → line / area
                          - Ranking → bar
                          - Comparison → grouped bar
                          - Correlation → scatter
                          - Contribution → pie / ring
                          - Breakdown → pivot / table
                        - Avoid redundant, weak, or decorative visuals
                        
                        PHASE 5 — FINAL CONFIG GENERATION:
                        - Generate a MINIMUM of 10 report configurations
                        - First configuration MUST represent the highest-value insight
                        - Rank all configs by business priority and narrative flow
                        - Avoid overlapping or duplicated insights
                        - Follow createReportSchema EXACTLY
                        
                        FILTER STRATEGY:
                        - Add filters ONLY when they improve decision-making
                        - Prefer userFilters for interactive exploration
                        - Avoid userFilters on Date-type columns
                        - Use multiple userFilters when it improves usability
                        
                        OUTPUT REQUIREMENTS (ABSOLUTE):
                        - Use key name: reportHeading (NOT title)
                        - reportHeading MUST be a concise string of MAXIMUM 5 words
                        - Output ONLY the final JSON configuration object
                        - Match createReportSchema EXACTLY
                        - No invented columns, tables, or metrics
                        - No duplicate insights
                        - No extra text
                        
                        FORMAT REFERENCE (STRUCTURE ONLY — DO NOT COPY VALUES):
                        {
                          reportHeading: "Concise BI Summary",
                          configs: [
                            {
                              "baseTableName": %s,
                              "title": "Top Revenue Contributors",
                              "description": "Highlights entities driving the highest revenue impact.",
                              "reportType": "chart",
                              "chartType": "horizontal bar",
                              "axisColumns": [
                                {"type": "xAxis", "columnName": "Entity", "operation": "actual"},
                                {"type": "yAxis", "columnName": "Revenue", "operation": "sum"}
                              ],
                              "filters": [
                                {
                                  "tableName": %s,
                                  "columnName": "Revenue",
                                  "operation": "sum",
                                  "filterType": "ranking",
                                  "values": ["Top 10"],
                                  "exclude": "false"
                                }
                              ],
                              "isAxisMerge": "false"
                            }
                          ]
                        }
                        """,
                tableSchema.toString(), reportConfigSchema, tableName, tableName, tableName
        );
    }

    private static String getSystemInstruction() {
        return """
                ROLE:
                You are a Senior Data Analyst and Business Intelligence Architect.
                MISSION:
                Analyze a dataset schema like a BI professional.
                Infer what the dataset represents,\s
                Identify its business domain, and design high-impact, decision-ready analytics\s
                Strictly based on the schema provided.
                You generate charts intentionally and based on clear requirements.
                You are NOT being creative or speculative.
                You operate strictly within provided facts and instructions.
                INPUTS:
                - A table schema (table name, column names, data types)
                - A strict analytics configuration schema that defines the required JSON output
                ANALYTICAL RESPONSIBILITIES:
                - Infer the dataset’s real-world domain from table and column semantics
                - Understand the underlying business or operational process
                - Prioritize insights based on business impact
                - Select appropriate report or chart types
                - Build a coherent analytics story
                DESIGN RULES:
                - Treat the dataset as production business data
                - Focus on trends, distributions, comparisons
                - Avoid redundant, low-value, or decorative analytics
                - Ensure every chart or report answers a clear business question
                OUTPUT CONSTRAINTS (STRICT):
                - Output ONLY valid JSON
                - Follow the provided schema EXACTLY
                - Do NOT add, remove, rename, or reorder fields
                - Do NOT include explanations, markdown, or extra text
                - Do NOT invent columns or metrics not inferable from the schema
                """;
    }
}
