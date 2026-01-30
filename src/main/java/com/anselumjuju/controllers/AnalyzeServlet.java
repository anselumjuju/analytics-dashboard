package com.anselumjuju.controllers;

import com.anselumjuju.services.ai.GetConfig;
import com.anselumjuju.services.embed.CreateEmbedUrls;
import com.anselumjuju.services.reports.CreateReport;
import com.anselumjuju.services.upload.DataUpload;
import com.anselumjuju.services.workspaces.CreateWorkSpace;
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
import java.util.List;
import java.util.Map;

@WebServlet("/analyze")
@MultipartConfig
public class AnalyzeServlet extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
        System.out.println("\n\n\n\n\nAnalyzing...\n");
        Part filePart = req.getPart("file");

        if (filePart == null) {
            res.setStatus(400);
            res.getWriter().write("No file uploaded");
        }

//        Create a new Workspace
        Boolean workspaceCreated = CreateWorkSpace.createWorkspace();
        if (!workspaceCreated) {
            res.setStatus(500);
            res.getWriter().write("Failed to create workspace");
            return;
        }
        System.out.println("Workspace created successfully");

//        Upload to Workspace
        Map<String, Object> uploadResponse = DataUpload.uploadFile(filePart);
        if (uploadResponse == null) {
            res.setStatus(500);
            res.getWriter().write("Failed to upload file ");
            return;
        }
        System.out.println("File uploaded successfully");

//        Generate Configs by Gemini
        List<Map<String, Object>> configs = GetConfig.getConfig(uploadResponse);
        if(configs == null){
            res.setStatus(500);
            res.getWriter().write("Failed to generate configs");
            return;
        }
        System.out.println("Configs generated successfully");

//        Create Reports and returns viewIDs
        List<String> viewIds = CreateReport.createReports(configs);
        if(viewIds == null){
            res.setStatus(500);
            res.getWriter().write("Failed to create reports");
            return;
        }
        System.out.println("Reports created successfully");

//        Get Private Embed URLs
        List<String> embedUrls = CreateEmbedUrls.createEmbedUrls(viewIds);
        if(embedUrls == null){
            res.setStatus(500);
            res.getWriter().write("Failed to create embedUrls");
        }
        System.out.println("Embed URLs created successfully");


//        Return Embed URLs
        JsonObject result = new JsonObject();
        result.addProperty("result", "success");
        result.addProperty("urls", embedUrls.toString());

        res.setStatus(200);
        res.getWriter().write(result.toString());
    }
}
