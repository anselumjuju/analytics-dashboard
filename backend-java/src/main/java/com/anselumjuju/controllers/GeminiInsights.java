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

            if (inputFile.exists()) {
                boolean isFileDeleted = inputFile.delete();
                System.out.println("File deleted: " + isFileDeleted);
            }

            System.out.println("Gemini insights generated successfully");
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
                The attached file is the sole source of truth. Analyze the entire dataset before producing output.
                
                OBJECTIVE:
                Generate a structured, executive-level analytical insight report derived strictly from the data.
                
                ANALYSIS REQUIREMENTS:
                - Infer the dataset domain from structure and column relationships
                - Identify measurable performance metrics present in the data
                - Compute valid derived metrics where mathematically supported (totals, averages, growth rates, ratios, distributions, volatility indicators)
                - Highlight performance strengths, weaknesses, trends, concentration risks, and anomalies
                - Base all conclusions exclusively on values contained in the file
                - Do not fabricate missing data or assume unstated fields
                
                REPORT GUIDELINES:
                - Preserve all metric names and numerical values exactly
                - Emphasize material contrasts and impact drivers
                - Prioritize strategic relevance over descriptive summaries
                
                OUTPUT FORMAT (STRICT):
                {
                  "insight": "Markdown-formatted string"
                }
                
                MARKDOWN REQUIREMENTS (inside "insight"):
                - 350–450 words
                - Use only ## and ### headings
                - Use bullet points where appropriate
                - Bold key metrics using ** **
                - Maintain executive clarity and structured spacing
                
                REQUIRED SECTIONS:
                - Executive Overview
                - Key Metrics & Performance Highlights
                - Risk & Pattern Analysis
                - Strategic Implications
                
                STRICT RULES:
                - Return strictly valid JSON
                - Only one key: "insight"
                - No additional keys
                - No commentary outside JSON
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
