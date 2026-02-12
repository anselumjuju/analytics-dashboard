package com.anselumjuju.controllers;

import com.anselumjuju.lib.Utils;
import com.anselumjuju.services.*;
import com.anselumjuju.services.ai.GetConfig;
import com.anselumjuju.lib.SendError;
import com.anselumjuju.services.ai.GetInsight;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/analyze")
@MultipartConfig
public class AnalyzeServlet extends HttpServlet {

    private static final Gson gson = new Gson();

    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
        System.out.println("\n\n\n\n\nAnalyzing...");

        String jobId = req.getParameter("jobId");
        if (jobId == null || jobId.isBlank()) {
            SendError.sendError(res, 400, "Insufficient Parameters passed");
            return;
        }

        Part filePart = req.getPart("file");
        if (filePart == null) {
            SendError.sendError(res, 400, "No file uploaded");
            return;
        }

        // 1. Creating Workspace
        System.out.println("Creating workspace");
        ProgressSocket.send(jobId, 10, "Getting things ready...");
        String workspaceId = Workspaces.createWorkspace();
        if (workspaceId == null) {
            SendError.sendError(res, 500, "Failed to create workspace");
            return;
        }

        // 2. Uploading File to Workspace
        System.out.println("Uploading file to workspace");
        Map<String, Object> uploadResponse = DataUpload.uploadFile(filePart, workspaceId);
        if (uploadResponse == null) {
            SendError.sendError(res, 400, "Failed to upload file");
            return;
        }

        // 3. Generate Configs from Gemini
        System.out.println("Generating configs from Gemini");
        ProgressSocket.send(jobId, 20, "Analyzing your report...");
        Map<String, Object> geminiResponse = GetConfig.getConfig(uploadResponse, jobId);
        String reportHeading = (String) geminiResponse.get("reportHeading");
        List<Map<String, Object>> configs = (List<Map<String, Object>>) geminiResponse.get("configs");
        if (configs == null) {
            SendError.sendError(res, 400, "Failed to load configs");
            return;
        }
        System.out.println(configs.size() + " Configs Generated");

        // 4. Creating Reports
        System.out.println("Creating Reports");
        ProgressSocket.send(jobId, 55, "Designing your dashboard");
        List<String> viewIds = Reports.createReports(configs, workspaceId);
        int viewIdsSize = viewIds == null ? 0 : viewIds.size();
        for (int i = viewIdsSize - 1; i >= 0; i--) {
            if (viewIds.get(i) == null) {
                configs.remove(i);
                viewIds.remove(i);
            }
        }
        if (viewIds == null || viewIds.isEmpty()) {
            SendError.sendError(res, 400, "Failed to create Reports");
            return;
        }
        System.out.println(viewIds.size() + " Reports Created");

        // 5. Creating Embed URLs
        System.out.println("Creating Embed URLs for " + viewIds.size() + " Reports");
        ProgressSocket.send(jobId, 75, "Finalizing your dashboard");
        List<String> embedUrls = EmbedUrls.createEmbedUrls(viewIds, workspaceId);
        int embedUrlsSize = embedUrls == null ? 0 : embedUrls.size();
        for (int i = embedUrlsSize - 1; i >= 0; i--) {
            if (embedUrls.get(i) == null) {
                configs.remove(i);
                viewIds.remove(i);
                embedUrls.remove(i);
            }
        }
        if (embedUrls == null || embedUrls.isEmpty()) {
            SendError.sendError(res, 400, "Failed to create Embed URLs");
            return;
        }
        for (int i = 0; i < embedUrls.size(); i++)
            configs.get(i).put("embedUrl", embedUrls.get(i));
        System.out.println(embedUrls.size() + " Urls Created");

        // 6. Creating insights
        System.out.println("Creating insights for reports");
        ProgressSocket.send(jobId, 85, "Getting insights...");
        List<String> insights = Insights.createInsights(viewIds, workspaceId);
        System.out.println("insights: " + (insights == null ? 0 : insights.size()));

        // 7. Generating overall insights
        System.out.println("Generating overall insight");
        Map<String, Object> tableSchema = (Map<String, Object>) uploadResponse.get("tableSchema");
        String reportInsight = GetInsight.getInsight(tableSchema, insights);

        // 8. Success Response
        ProgressSocket.send(jobId, 95, "Your dashboard is ready!");
        System.out.println("Analysis completed");
        res.setStatus(200);
        res.getWriter().write(gson.toJson(Map.of(
                "success", true,
                "status", 200,
                "data", Map.of(
                        "message", "Analysis completed",
                        "key", Utils.encodeLinks(viewIds, workspaceId),
                        "reportHeading", reportHeading,
                        "urls", embedUrls,
                        "configs", configs,
                        "insights", Map.of(
                                "reportInsights", insights,
                                "reportInsight", reportInsight
                        )
                )
        )));
    }
}
