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
    public static List<Map<String, Object>> getConfig(Map<String, Object> uploadResponse, String jobId) {
        String tableName = uploadResponse.get("tableName").toString();
        Map<String, Object> tableSchema = (Map<String, Object>) uploadResponse.get("tableSchema");

        String prompt = getPrompt(tableName, tableSchema);

        try (Client client = Client.builder().apiKey(EnvConfig.GEMINI_API_KEY).build()) {

            GenerateContentConfig config = GenerateContentConfig
                    .builder()
                    .systemInstruction(
                            Content.fromParts(Part.fromText("""
                                          ROLE:
                                          You are a Senior Data Analyst, Business Intelligence Architect, and Insight Strategist.
                                    
                                          MISSION:
                                          Analyze a dataset schema like a real analytics professional.
                                          Infer meaning, prioritize business value, build an insight narrative,
                                          and generate decision-ready analytics configurations.
                                    
                                          You are NOT generating random charts.
                                          You must think critically, prioritize impact, and build story-driven reports.
                                    
                                          OBJECTIVE:
                                          Given:
                                          - A table schema (table name + columns + data types)
                                          - An analytics configuration schema
                                    
                                          You must:
                                          - Understand what the dataset represents
                                          - Infer the dataset domain
                                          - Predict stakeholder insight needs
                                          - Generate high-value analytical questions
                                          - Map questions to meaningful column comparisons
                                          - Select optimal chart/report types
                                          - Build a narrative analytics flow
                                          - Output ONLY the final JSON config array
                                    """))
                    )
                    .responseMimeType("application/json")
                    .build();

            GenerateContentResponse response = client.models.generateContent("gemini-3-flash-preview", prompt, config);
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

    public static String getPrompt(String tableName, Map<String, Object> tableSchema) {
        String reportConfigSchema = ReportConfigSchema.reportConfigSchema();
        String tableSchemaString = tableSchema.toString();

        String prompt = String.format(
                """
                        INPUTS:
                        TABLE SCHEMA:
                        ${tableSchema}
                        
                        CONFIG CONTRACT (STRICT):
                        ${createReportSchema}
                        
                        BASE TABLE NAME (IMMUTABLE):
                        ${baseTableName}
                        
                        GLOBAL RULES (MANDATORY):
                        - createReportSchema is a STRICT contract
                        - Do NOT add, remove, or rename fields
                        - Use ONLY columns from TABLE SCHEMA
                        - Use baseTableName EXACTLY as provided
                        - NEVER modify tableName
                        - Output valid JSON only
                        - No explanations or intermediate steps
                        
                        OBJECTIVE:
                        Design a coherent BI analytics story that delivers high-value,
                        decision-oriented insights using the given table schema.
                        
                        PHASE 1 — SCHEMA & DOMAIN ANALYSIS
                        - Classify columns: metric, dimension, time, identifier
                        - Infer dataset domain (Sales, Finance, Ops, HR, etc.)
                        - Identify high-value metrics and decision drivers
                        
                        PHASE 2 — STORY FLOW (ORDERED)
                        Build insights in this narrative order:
                        1. Overview
                        2. Performance
                        3. Trends
                        4. Top contributors
                        5. Bottom performers
                        6. Drivers
                        7. Risks
                        8. Optimization
                        9. Growth opportunities
                        
                        PHASE 3 — INSIGHT QUESTIONS
                        - Generate 7–10 UNIQUE business questions
                        - Each must:
                          - Be answerable using schema
                          - Use 2+ meaningful columns
                          - Be non-trivial and decision-relevant
                        
                        PHASE 4 — ANSWERS & VISUALIZATION
                        For each question:
                        - Choose the strongest comparison type
                          (trend, ranking, contribution, breakdown, correlation)
                        - Select best visualization:
                          - Trend → line / area
                          - Ranking → bar
                          - Comparison → grouped bar
                          - Correlation → scatter
                          - Contribution → pie / ring
                          - Breakdown → pivot / table
                        - Avoid weak or redundant visuals
                        
                        PHASE 5 — FINAL CONFIG GENERATION
                        - Minimum 10 configs required
                        - First config = MOST important insight
                        - Rank configs by priority and story flow
                        - Avoid duplicate insights
                        - Follow createReportSchema EXACTLY
                        
                        FILTER STRATEGY:
                        - Add filters only when decision-relevant
                        - Prefer userFilters for exploration
                        - Avoid userFilters for Date-type columns
                        - Add more userFilters for user convenience
                        
                        OUTPUT REQUIREMENTS (STRICT):
                        - Output ONLY the final JSON config array
                        - Match createReportSchema EXACTLY
                        - No invented columns or tables
                        - No duplicate insights
                        - No extra text
                        
                        EXAMPLE OUTPUT STYLE (FORMAT ONLY — DO NOT COPY):
                        [
                         {
                            "baseTableName": %s,
                            "title": "Top 10 Most Profitable Products",
                            "description": "Identifies the leading products contributing to the bottom line.",
                            "reportType": "chart",
                            "chartType": "horizontal bar",
                            "axisColumns": [
                              {"type": "xAxis", "columnName": "Product Name", "operation": "actual"},{"type": "yAxis", "columnName": "Profit", "operation": "sum"}
                            ],
                            "filters": [
                              {"tableName": %s,"columnName": "Profit","operation": "sum","filterType": "ranking","values": ["Top 10"],"exclude": "false"}
                            ],
                            "isAxisMerge": "false"
                          },...
                        ]
                        """,
                tableSchemaString, reportConfigSchema
        );

        return prompt;
    }
}
