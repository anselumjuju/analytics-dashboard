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

            Content promptContent = Content.fromParts(
                    Part.fromText(getInput(tableSchema, insights).replaceAll("%", "%%")),
                    Part.fromText(getRules()),
                    Part.fromText(getExample())
            );

            GenerateContentResponse response = client.models.generateContent("gemini-2.5-flash-lite", promptContent, config);
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

    private static String getInput(Map<String, Object> tableSchema, List<String> insights) {
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
                """;
    }

    private static String getRules() {
        return """
                    CONTEXT:
                    The attached file is the sole and authoritative source of truth.
                    You must fully analyze the entire dataset before generating output.
                    OBJECTIVE:
                    Produce a structured, executive-level analytical report that:
                    - Automatically identifies the dataset domain
                    - Extracts and computes domain-relevant key metrics
                    - Prioritizes the most important performance indicators
                    - Clearly separates high-impact KPIs from supporting analysis
                    - Provides immediate answers to critical user questions about the dataset
                    DOMAIN DETECTION:
                    First infer the dataset type based on column names, structure, relationships, and value patterns.
                    Examples:
                    - Sales/Business Data → revenue, profit, margin, growth rate, top product, region contribution
                    - Finance Data → expense breakdown, net position, variance, cash flow trends
                    - Cricket/Sports Data → total runs, run rate, strike rate, wickets, averages
                    - Inventory → turnover rate, stock concentration, shortages, top-moving items
                    - User/Analytics → engagement rate, retention rate, conversion metrics
                    Adapt metrics dynamically based on detected columns.
                    COLUMN-DRIVEN ANALYSIS REQUIREMENT:
                    - Identify measurable numeric columns and relevant categorical fields
                    - Analyze relationships between fields (e.g., product vs revenue, player vs runs)
                    - Compute totals, averages, ratios, rankings, concentration %, and growth signals only when mathematically supported
                    - Validate every calculation against dataset values before including it
                    - Do NOT fabricate missing columns or values
                    - Do NOT assume industry standards or external benchmarks
                    - Preserve all metric names and numeric values exactly as derived
                    PRIORITY LOGIC:
                    - Highlight 3–6 PRIMARY KPIs most relevant to the inferred domain
                    - Present them clearly and separately before deeper analysis
                    - Rank insights by impact or contribution
                    - Emphasize material differences and dominant contributors
                    REPORT STRUCTURE (STRICT INSIDE MARKDOWN):
                    ## Executive Overview
                    High-level explanation of dataset type, scope, and dominant performance signals.
                    ## Primary Key Metrics
                    Clearly separated high-impact KPIs:
                    - Metric Name: **Value** — one-line interpretation
                    - Metric Name: **Value** — one-line interpretation
                    Prioritize what a user would immediately want to know.
                    ### Quick Insights
                    Generate 5–8 key questions a user would naturally ask after uploading this dataset.
                    Immediately answer each question using precise data-derived values.
                    Present in bullet format:
                    - **Subheading for the question** Answer with computed metric and brief interpretation.
                    - **Subheading for the question** Answer with computed metric and brief interpretation.
                    Questions must adapt to dataset type.
                    Instead of writing the complete question, write the subheading of the question.
                    Examples:
                    - What is total sales and total profit? [Total Sales & Profit]
                    - Which product contributes the most revenue? [Product with most revenue]
                    - What is the overall run rate? [Overall run rate]
                    - Who has the highest strike rate? [Highest strike rate]
                    - Which segment drives the largest share? [Segment with largest share]
                    ## Performance Highlights
                    - Strength indicators
                    - Growth or decline patterns
                    - Category or segment comparisons
                    - Use Bullet Points for better readability
                    ## Risk & Pattern Analysis
                    - Concentration risks
                    - Volatility signals
                    - Structural imbalances
                    - Outliers or anomalies
                    - Use Bullet Points for better readability
                    ## Strategic Implications
                    Decision-level insights strictly derived from computed data.
                    Use Bullet Points for better readability
                    OUTPUT FORMAT (STRICT):
                    {
                      "insight": "Markdown-formatted string"
                    }
                    MARKDOWN REQUIREMENTS:
                    - 350–450 words
                    - Use only ## and ### headings (no H1)
                    - Use bullet points where appropriate
                    - Bold all key numeric metrics using ** **\s
                    - Maintain clean spacing and executive clarity
                    STRICT RULES:
                    - Return strictly valid JSON
                    - Only one key: "insight"
                    - No additional keys
                    - No commentary outside JSON
                    - All metrics must be mathematically correct and traceable to file data
                    - If a metric cannot be confidently computed, do not include it
                """;
    }

    private static String getExample() {
        return """
                    EXAMPLE FORMAT (STRUCTURE ONLY — DO NOT COPY CONTENT):
                    {
                        "insight": "## Executive Overview\\n\\nSummary paragraph...\\n\\n### Key Drivers\\n- Insight one\\n- Insight two\\n\\n### Strategic Implications\\nConsolidated executive narrative..."
                    }
                """;
    }
}
