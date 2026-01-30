package com.anselumjuju.controllers;

import com.anselumjuju.services.ai.GetConfig;
import com.anselumjuju.services.embed.CreateEmbedUrls;
import com.anselumjuju.services.reports.CreateReport;
import com.anselumjuju.services.upload.DataUpload;
import com.anselumjuju.services.workspaces.CreateWorkSpace;
import com.anselumjuju.utils.SendError;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

import java.io.IOException;
import java.util.ArrayList;
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

        if (filePart == null) {
            SendError.sendError(res, 400, "No file uploaded");
            return;
        }

        // 1. Creating Workspace
        System.out.println("Creating workspace");
        Boolean workspaceCreated = CreateWorkSpace.createWorkspace();
        if (!workspaceCreated) {
            SendError.sendError(res, 500, "Failed to create workspace");
            return;
        }

        // 2. Uploading File to Workspace
        System.out.println("Uploading file to workspace");
        Map<String, Object> uploadResponse = DataUpload.uploadFile(filePart);
        if (uploadResponse == null) {
            SendError.sendError(res, 400, "Failed to upload file");
            return;
        }

        // 3. Generate Configs from Gemini
        System.out.println("Generating configs from Gemini");
        List<Map<String, Object>> configs = GetConfig.getConfig(uploadResponse);
        if (configs == null) {
            SendError.sendError(res, 400, "Failed to load configs");
            return;
        }

        // 4. Creating Reports
        System.out.println("Creating Reports");
        List<String> viewIds = CreateReport.createReports(configs);
        if (viewIds == null) {
            SendError.sendError(res, 400, "Failed to create Reports");
            return;
        }

        // 5. Creating Embed URLs
        System.out.println("Creating Embed URLs");
        List<String> embedUrls = CreateEmbedUrls.createEmbedUrls(viewIds);
        if (embedUrls == null) {
            SendError.sendError(res, 400, "Failed to create Embed URLs");
            return;
        }

        // 6. Success Response
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Analysis completed");
        result.put("urls", embedUrls);

        res.setStatus(200);
        res.getWriter().write(gson.toJson(result));
    }
}
