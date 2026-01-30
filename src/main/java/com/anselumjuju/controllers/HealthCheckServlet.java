package com.anselumjuju.controllers;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/health")
public class HealthCheckServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.getWriter().write("""
            {
              "status": "ok",
              "message": "Servlet is running",
            }
        """);
    }
}
