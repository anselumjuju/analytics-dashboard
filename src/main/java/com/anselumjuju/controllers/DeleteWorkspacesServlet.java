package com.anselumjuju.controllers;

import com.anselumjuju.services.workspaces.DeleteWorkspaces;
import com.anselumjuju.services.workspaces.GetAllWorkspaces;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

@WebServlet("/api/delete-workspaces")
public class DeleteWorkspacesServlet extends HttpServlet {
    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {

        try {
            List<String> workspaces = GetAllWorkspaces.getAllOwnedWorkspaces();
            if (workspaces == null || workspaces.isEmpty()) {
                res.setStatus(200);
                res.getWriter().write("""
                            {
                              "success": true,
                              "message": "No auto-generated workspaces found",
                              "data": { "deletedCount": 0 }
                            }
                        """);
                return;
            }

            int deletedCount = DeleteWorkspaces.deleteWorkspaces(workspaces);
            res.setStatus(HttpServletResponse.SC_OK);
            res.getWriter().write(String.format("""
                        {
                          "success": true,
                          "message": "Deleted %d auto-generated workspaces",
                          "data": { "deletedCount": %d }
                        }
                    """, deletedCount, deletedCount));
        } catch (Exception e) {
            res.setStatus(500);
            res.getWriter().write(String.format("""
                        {
                          "success": false,
                          "status": 500,
                          "message": "Failed to delete workspaces",
                          "details": "%s"
                        }
                    """, e.getMessage()));
        }
    }
}
