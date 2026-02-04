package com.anselumjuju.controllers;

import com.anselumjuju.services.Workspaces;
import com.google.gson.Gson;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/deleteWorkspaces")
public class DeleteWorkspacesServlet extends HttpServlet {
    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {

        try {
            int deletedCount = Workspaces.deleteWorkspaces();

            Map<String, Object> resMap = new HashMap<>();
            resMap.put("success", true);
            resMap.put("message", "Deleted " + deletedCount + " auto-generated workspaces");
            resMap.put("data", Map.of("deletedCount", deletedCount));

            res.setStatus(200);
            res.getWriter().write(new Gson().toJson(resMap));
        } catch (Exception e) {
            Map<String, Object> resMap = new HashMap<>();
            resMap.put("success", false);
            resMap.put("message", "Failed to delete workspaces");
            resMap.put("data", e.getMessage());

            res.setStatus(500);
            res.getWriter().write(new Gson().toJson(resMap));
        }
    }
}
