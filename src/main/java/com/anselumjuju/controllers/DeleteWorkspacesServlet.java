package com.anselumjuju.controllers;

import com.anselumjuju.services.workspaces.DeleteWorkspaces;
import com.anselumjuju.services.workspaces.GetAllWorkspaces;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;


@WebServlet("/delete-workspaces")
public class DeleteWorkspacesServlet extends HttpServlet {
    @Override
    public void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        List<String> workspaces = GetAllWorkspaces.getAllOwnedWorkspaces();

        int deletedWorkspaces = 0;
        if (workspaces == null || workspaces.isEmpty()) {
            System.out.println("No auto generated workspaces found");
        } else {
            deletedWorkspaces = DeleteWorkspaces.deleteWorkspaces(workspaces);
            System.out.println("Deleted " + deletedWorkspaces + " auto generated workspaces");
        }
        res.getWriter().write(String.format("""
                {
                    "status":"success",
                    "message":"Deleted %s auto generated workspaces",
                }
                """, deletedWorkspaces)
        );
    }
}
