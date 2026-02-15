package com.anselumjuju.controllers;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.lib.SendError;
import com.google.genai.Client;
import com.google.genai.types.*;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@WebServlet("/api/insights/gemini")
@MultipartConfig
public class GeminiInsights extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
        Part filePart = req.getPart("file");
        if (filePart == null) {
            SendError.sendError(res, 400, "No file uploaded");
            return;
        }

        // Convert Part to File
        if (filePart.getSize() == 0) {
            SendError.sendError(res, 400, "Empty file");
            return;
        }
        File inputFile = File.createTempFile("upload_", ".tmp");

        try (InputStream ips = filePart.getInputStream()) {
            Files.copy(ips, inputFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            SendError.sendError(res, 500, "Failed to convert file");
            return;
        }

        // Upload file to Gemini and get insights
        try (Client genaiClient = Client.builder().apiKey(EnvConfig.GEMINI_API_KEY).build()) {
            UploadFileConfig uploadFileConfig = UploadFileConfig
                    .builder()
                    .mimeType(filePart.getContentType())
                    .displayName(inputFile.getName())
                    .build();
            com.google.genai.types.File uploadResponse = genaiClient.files.upload(inputFile, uploadFileConfig);

            String prompt = getPrompt();
            String systemInstruction = getSystemInstruction();


            Content userContent = Content.fromParts(
                    com.google.genai.types.Part.fromText(prompt),
                    com.google.genai.types.Part.fromUri(uploadResponse.uri().orElseThrow(), uploadResponse.mimeType().orElseThrow())
            );

            GenerateContentConfig config = GenerateContentConfig
                    .builder()
                    .systemInstruction(Content.fromParts(com.google.genai.types.Part.fromText(systemInstruction)))
                    .responseMimeType("application/json")
                    .build();

            GenerateContentResponse response = genaiClient.models.generateContent("gemini-3-flash-preview", userContent, config);

            String text = response.text() + " ";
            String cleanedJson = text
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            Map<String, Object> responseBody = new Gson().fromJson(cleanedJson, new TypeToken<Map<String, Object>>() {
            }.getType());

            String insight = (String) responseBody.get("insight");

            if (inputFile.exists()) inputFile.delete();

            res.setStatus(200);
            res.getWriter().write(new Gson().toJson(Map.of(
                    "success", true,
                    "status", 200,
                    "data", Map.of(
                            "message", "Insight generated successfully",
                            "insight", insight
                    )
            )));
        } catch (Exception e) {
            System.out.println("Error getting gemini insights " + e.getMessage());
            SendError.sendError(res, 500, "Failed to get gemini insights");
        }
    }

    private static String getPrompt() {
        return """
            CONTEXT:
            The attached file is the sole and authoritative source of truth.
            You must fully analyze the entire dataset before generating output.

            OBJECTIVE:
            Produce a structured, executive-level analytical report that:
            - Identifies the dataset domain automatically
            - Extracts and computes domain-relevant key metrics
            - Prioritizes the most important performance indicators
            - Clearly separates high-impact KPIs from supporting analysis

            DOMAIN DETECTION:
            First infer the dataset type based on column names, structure, and value patterns.
            Examples:
            - Sales/Business Data → revenue, profit, margin, growth, regional performance
            - Finance Data → cash flow, expenses, ratios, variance
            - Cricket/Sports Data → run rate, strike rate, averages, totals, wickets
            - Inventory → turnover, stock levels, shortages
            - User/Analytics → engagement rate, retention, conversion
            Adapt metrics accordingly.

            ANALYSIS REQUIREMENTS:
            - Identify all measurable metrics directly present in the dataset
            - Compute derived metrics ONLY when mathematically supported
            - Show totals, averages, growth rates, ratios, concentration percentages, and variability where valid
            - Verify every calculation against raw data before including it
            - Do NOT invent missing columns or fabricate values
            - Do NOT assume industry benchmarks or external standards
            - Preserve metric names and numeric values exactly as derived

            PRIORITY LOGIC:
            - Highlight 3–6 PRIMARY KPIs most relevant to the inferred domain
            - Present them clearly and separately before deeper analysis
            - Rank insights by business or performance impact
            - Emphasize material differences, imbalances, or dominant contributors

            REPORT STRUCTURE (STRICT INSIDE MARKDOWN):
            
            ## Executive Overview
            High-level summary of dataset type and dominant signals.

            ## Primary Key Metrics
            Clearly separated, high-priority KPIs:
            - Metric Name: **Value**
            - Metric Name: **Value**
            Include brief one-line interpretation per metric.
            
            ## Quick Insights
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
            - Growth or decline signals
            - Segment or category performance comparisons

            ## Risk & Pattern Analysis
            - Concentration risk
            - Volatility
            - Structural imbalance
            - Outliers or anomalies
            - Use Bullet Points for better readability

            ## Strategic Implications
            Decision-level interpretation derived strictly from the data.
            Use Bullet Points for better readability

            OUTPUT FORMAT (STRICT):
            {
              "insight": "Markdown-formatted string"
            }

            MARKDOWN REQUIREMENTS:
            - 350–450 words
            - Use only ## and ### headings (no H1)
            - Use bullet points where appropriate
            - Bold all key numeric metrics using ** **
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

    private static String getSystemInstruction() {
        return """
                ROLE:
                You are a Senior Business Intelligence Analyst specializing in structured data analysis and executive reporting.
                
                OBJECTIVE:
                Analyze the provided dataset thoroughly and produce high-impact, decision-ready insights.
                
                ANALYTICAL STANDARDS:
                - Base all conclusions strictly on the file contents
                - Derive calculations only when mathematically supported
                - Highlight measurable performance drivers and risk indicators
                - Prioritize material findings over descriptive summaries
                
                CONSTRAINTS:
                - Output strictly valid JSON
                - Do not fabricate data or assume missing values
                - Preserve all numerical values exactly as provided
                - No commentary outside the required JSON structure
                """;
    }

}
