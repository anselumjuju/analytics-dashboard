package com.anselumjuju.controllers;

import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.utils.AccessToken;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/test")
public class TestServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String accessToken = AccessToken.getAccessToken();
        String refreshToken = EnvConfig.ZOHO_ANALYTICS_REFRESH_TOKEN;

        res.setStatus(200);
        PrintWriter writer = res.getWriter();
        writer.write(String.format("""
                {
                    "message": "Test Servlet"
                    "access_token": "" + %s + ""
                    "refresh_token": "" + %s + ""
                }
                """, accessToken, refreshToken));
    }
}
