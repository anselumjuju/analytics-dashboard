package com.anselumjuju.controllers;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;

import java.io.IOException;

@WebServlet("/analyze")
@MultipartConfig
public class AnalyzeServlet extends HttpServlet {
    @Override
    public void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
        Part filePart = req.getPart("file");

        if (filePart == null) {
            res.setStatus(400);
            res.getWriter().write("No file uploaded");
        }

//        Create a new Workspace

//        Upload to Workspace

//        Generate Configs by Gemini

//        Create Reports and returns viewIDs

//        Get Private Embed URLs

//        Return Embed URLs

    }
}
