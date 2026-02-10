package com.anselumjuju.controllers;

import com.anselumjuju.lib.Utils;
import com.anselumjuju.services.*;
import com.anselumjuju.services.ai.GetConfig;
import com.anselumjuju.lib.SendError;
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
        Part filePart = req.getPart("file");

        String jobId = req.getParameter("jobId");
        if (jobId == null || jobId.isBlank()) {
            SendError.sendError(res, 400, "Insufficient Parameters passed");
            return;
        }

        if (filePart == null) {
            SendError.sendError(res, 400, "No file uploaded");
            return;
        }

        ProgressSocket.send(jobId, 10, "Getting things ready...");
        // 1. Creating Workspace
        System.out.println("Creating workspace");
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

        ProgressSocket.send(jobId, 20, "Analyzing your report...");
        // 3. Generate Configs from Gemini
        System.out.println("Generating configs from Gemini");
        List<Map<String, Object>> configs = GetConfig.getConfig(uploadResponse, jobId);
        if (configs == null) {
            SendError.sendError(res, 400, "Failed to load configs");
            return;
        }
        System.out.println(configs.size() + " Configs Generated");

        ProgressSocket.send(jobId, 65, "Designing your dashboard");
        // 4. Creating Reports
        System.out.println("Creating Reports");
        List<String> viewIds = Reports.createReports(configs, workspaceId);
        if (viewIds == null) {
            SendError.sendError(res, 400, "Failed to create Reports");
            return;
        }

        ProgressSocket.send(jobId, 80, "Finalizing your dashboard");
        // 5. Creating Embed URLs
        System.out.println("Creating Embed URLs for " + viewIds.size() + " Reports");
        List<String> embedUrls = EmbedUrls.createEmbedUrls(viewIds, workspaceId);
        if (embedUrls == null || embedUrls.isEmpty()) {
            SendError.sendError(res, 400, "Failed to create Embed URLs");
            return;
        }

        if (embedUrls.size() == configs.size()) {
            for (int i = 0; i < embedUrls.size(); i++)
                configs.get(i).put("embedUrl", embedUrls.get(i));
            for(int i = 0; i < embedUrls.size(); i++){
                if(embedUrls.get(i) == null) {
                    configs.remove(i);
                    embedUrls.remove(i);
                }
            }
        }

        System.out.println(embedUrls.size() + " Reports Created");

        ProgressSocket.send(jobId, 95, "Your dashboard is ready!");
        // 6. Success Response
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Analysis completed");
        result.put("key", Utils.encodeLinks(viewIds, workspaceId));
        result.put("urls", embedUrls);
        if(embedUrls.size() == configs.size())
            result.put("configs", configs);

        res.setStatus(200);
        res.getWriter().write(gson.toJson(result));
    }
}
