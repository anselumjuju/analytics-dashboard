package com.anselumjuju.controllers;

import com.anselumjuju.services.ProgressSocket;
import com.anselumjuju.services.embed.CreateEmbedUrls;
import com.anselumjuju.services.encodeLinks.EncodeDecodeLinks;
import com.anselumjuju.utils.SendError;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/get-embed-urls")
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
        List<String> viewIds = EncodeDecodeLinks.decodeLinks(key);
        if (viewIds == null) {
            SendError.sendError(res, 400, "Dashboard expired");
            return;
        }

        ProgressSocket.send(jobId, 76, "Fetching your dashboard...");
        List<String> embedUrls = CreateEmbedUrls.createEmbedUrls(viewIds);
        if (embedUrls == null) {
            SendError.sendError(res, 400, "Failed to create Embed URLs");
            return;
        }

        ProgressSocket.send(jobId, 100, "Your dashboard is ready!");
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Analysis completed");
        result.put("key", key);
        result.put("urls", embedUrls);

        res.setStatus(200);
        res.getWriter().write(gson.toJson(result));
    }
}
