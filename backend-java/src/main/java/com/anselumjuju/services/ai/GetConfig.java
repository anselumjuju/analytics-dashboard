package com.anselumjuju.services.ai;

import java.util.*;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.lib.ReportConfigSchema;
import com.anselumjuju.services.ProgressSocket;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class GetConfig {
    public static List<Map<String, Object>> getConfig(Map<String, Object> uploadResponse, String jobId) {
        String tableName = uploadResponse.get("tableName").toString();
        Map<String, Object> tableSchema = (Map<String, Object>) uploadResponse.get("tableSchema");

        String prompt = getPrompt(tableName, tableSchema);

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

    public static String getPrompt(String tableName, Map<String, Object> tableSchema) {
        String reportConfigSchema = ReportConfigSchema.reportConfigSchema();
        String tableSchemaString = tableSchema.toString();

        String prompt = String.format(
                """
                          ROLE:
                          You are a Senior Data Analyst, Business Intelligence Architect, and Insight Strategist.
                        
                          MISSION:
                          Analyze a dataset schema like a real analytics professional.
                          Infer meaning, prioritize business value, build an insight narrative,
                          and generate decision-ready analytics configurations.
                        
                          You are NOT generating random charts.
                          You must think critically, prioritize impact, and build story-driven reports.
                        
                          ====================================================================
                        
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
                        
                          ====================================================================
                        
                          INPUTS:
                          TABLE SCHEMA:
                          %s
                        
                          CONFIG CONTRACT (STRICT):
                          %s
                        
                          TABLE NAME (IMMUTABLE):
                          %s
                        
                          RULES:
                          - Treat createReportSchema as a STRICT CONTRACT
                          - Do NOT add, remove, or rename fields
                          - Use ONLY allowed schema values
                          - Use ONLY real table + column names
                          - Use tableName EXACTLY as "baseTableName" in ALL configs
                          - Prefer "userFilters" where interactive filtering makes sense
                          - Use "filters" only when required
                          - NEVER modify tableName
                        
                          ====================================================================
                        
                          CORE EXPECTATION:
                          You are designing reports like a senior BI consultant.
                          Each config must:
                          - Deliver meaningful business insight
                          - Support decision-making
                          - Answer a UNIQUE business question
                          - Contribute to a coherent analytics story
                        
                          This is NOT a random dashboard generator.
                          This IS a structured analytics storytelling engine.
                        
                          ====================================================================
                        
                          STEP 1 — ANALYZE SCHEMA:
                          - Classify columns: dimension, metric, time, identifier
                          - Infer semantic meaning (revenue, cost, performance, risk, growth)
                          - Identify primary vs supporting columns
                          - Rank columns by analytical importance
                        
                          STEP 2 — DETECT DATASET DOMAIN:
                          Infer domain (Sales, Marketing, Finance, HR, Ops, Healthcare, etc.)
                          Identify stakeholders, key metrics, and high-value insight patterns.
                        
                          STEP 3 — MODEL USER INTENT:
                          Predict decision-maker questions about:
                          - Performance
                          - Trends
                          - Rankings
                          - Profit vs loss
                          - Growth vs decline
                          - Efficiency
                          - Risk
                          - Opportunities
                        
                          STEP 4 — BUILD STORY FLOW:
                          Create a connected narrative:
                          1. Overview
                          2. Performance summary
                          3. Trends
                          4. Top contributors
                          5. Bottom performers
                          6. Success drivers
                          7. Loss drivers
                          8. Risk signals
                          9. Optimization opportunities
                          10. Growth opportunities
                        
                          STEP 5 — GENERATE 7-10 INSIGHT QUESTIONS:
                          Questions must:
                          - Be answerable using schema
                          - Provide real business value
                          - Avoid trivial or redundant insights
                        
                          STEP 6 — MAP QUESTIONS TO COMPARISONS:
                          - Use 2+ meaningful columns per insight
                          - Choose comparison type: trend, ranking, correlation, contribution, breakdown, distribution, cause
                          - Reject weak or low-signal comparisons
                        
                          STEP 7 — PRIORITIZE INSIGHTS:
                          Rank insights by:
                          - Business relevance
                          - Actionability
                          - Signal strength
                          - Stakeholder value
                          - Narrative importance
                          Order insights by priority and story flow.
                        
                          STEP 8 — SELECT BEST VISUALIZATION:
                          - Trends → Line / Area
                          - Rankings → Bar
                          - Comparisons → Grouped Bar
                          - Correlation → Scatter
                          - Contribution → Pie / Ring
                          - Breakdown → Pivot / Table
                          - Distribution → Histogram
                          Rules:
                          - Avoid repeating similar visuals
                          - Prefer clarity over decoration
                        
                          STEP 9 — FILTERS STRATEGY:
                          - Add filters only when they improve decisions
                          - Prefer Region, Category, Segment, Team
                          - Prefer "userFilters" for exploration
                          - Avoid adding userFilters for column Type "Date"
                          - Add more userFilters for user explorations
                        
                          STEP 10 — BUILD FINAL CONFIGS:
                          - Follow createReportSchema STRICTLY
                          - Use ONLY valid fields and columns
                          - Avoid duplicate insights
                          - Maintain narrative order
                          - Put the MOST IMPORTANT insight as the FIRST config
                          - Minimum 10 configs required
                          - Validate schema correctness before output
                        
                          ====================================================================
                        
                          STRICT OUTPUT RULES:
                          - Do NOT explain reasoning
                          - Do NOT output intermediate steps
                          - Do NOT invent columns or tables
                          - Do NOT repeat similar insights
                          - Output ONLY the final JSON config array
                          - Sort configs by priority and story flow
                          - Don't use "userFilters" with column Type "Date"
                        
                          ====================================================================
                        
                          EXAMPLE OUTPUT STYLE (FORMAT ONLY — DO NOT COPY):
                        
                          [
                            {
                              "baseTableName": %s,
                              "title": "Top 10 Most Profitable Products",
                              "description": "Identifies the leading products contributing to the bottom line.",
                              "reportType": "chart",
                              "chartType": "horizontal bar",
                              "axisColumns": [
                                {"type": "xAxis", "columnName": "Product Name", "operation": "actual"},
                                {"type": "yAxis", "columnName": "Profit", "operation": "sum"}
                              ],
                              "filters": [
                                {
                                  "tableName": %s,
                                  "columnName": "Profit",
                                  "operation": "sum",
                                  "filterType": "ranking",
                                  "values": ["Top 10"],
                                  "exclude": "false"
                                }
                              ],
                              "isAxisMerge": "false"
                            },
                            {
                              "baseTableName": %s,
                              "title": "Shipping Mode and Region Efficiency",
                              "description": "Pivot table analyzing order volume across different shipping modes and regions.",
                              "reportType": "pivot",
                              "axisColumns": [
                                {"type": "row", "columnName": "Region", "operation": "actual"},
                                {"type": "column", "columnName": "Ship Mode", "operation": "actual"},
                                {"type": "data", "columnName": "Order ID", "operation": "distinctCount"}
                              ],
                              "userFilters": [
                                {
                                  "tableName": %s,
                                  "columnName": "Category",
                                  "operation": "actual"
                                }
                              ],
                              "isAxisMerge": "false"
                            }
                          ]
                        
                          ====================================================================
                        
                          FINAL EXPECTATION:
                          Your output must feel like a senior BI consultant's analytics story.
                          Guide users from:
                          Overview → Performance → Trends → Drivers → Risks → Opportunities
                        
                          OUTPUT ONLY THE FINAL JSON CONFIG ARRAY.
                          NO EXTRA TEXT.
                        """,
                tableSchemaString, reportConfigSchema, tableName, tableName, tableName, tableName, tableName
        );

        return prompt;
    }
}
