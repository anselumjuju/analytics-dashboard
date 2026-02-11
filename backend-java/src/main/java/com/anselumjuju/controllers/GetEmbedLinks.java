package com.anselumjuju.controllers;

import com.anselumjuju.lib.Utils;
import com.anselumjuju.services.EmbedUrls;
import com.anselumjuju.services.ProgressSocket;
import com.anselumjuju.lib.SendError;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/fetch/embedUrls")
public class GetEmbedLinks extends HttpServlet {
    private static final Gson gson = new Gson();

    @Override
    public void doGet(jakarta.servlet.http.HttpServletRequest req, jakarta.servlet.http.HttpServletResponse res) throws IOException {
        String key = req.getParameter("key");
        String jobId = req.getParameter("jobId");
        if (key == null || key.isBlank() || jobId == null || jobId.isBlank()) {
            SendError.sendError(res, 400, "Insufficient Parameters passed");
            return;
        }

        ProgressSocket.send(jobId, 45, "Getting things ready...");
        Map<String, Object> decoded = Utils.decodeLinks(key);
        String workspaceId = (String) decoded.get("workspaceId");
        List<String> viewIds = (List<String>) decoded.get("viewIds");
        if (viewIds == null || workspaceId == null) {
            SendError.sendError(res, 400, "Dashboard expired");
            return;
        }

        ProgressSocket.send(jobId, 76, "Fetching your dashboard...");
        List<String> embedUrls = EmbedUrls.createEmbedUrls(viewIds, workspaceId);
        if (embedUrls == null) {
            SendError.sendError(res, 400, "Failed to create Embed URLs");
            return;
        }

        ProgressSocket.send(jobId, 100, "Your dashboard is ready!");
        res.setStatus(200);
        res.getWriter().write(gson.toJson(Map.of(
                "success", true,
                "status", 200,
                "data", Map.of(
                        "message", "Analysis completed",
                        "key", key,
                        "reportHeading", "Data Insights",
                        "urls", embedUrls
                )
        )));
    }
}
