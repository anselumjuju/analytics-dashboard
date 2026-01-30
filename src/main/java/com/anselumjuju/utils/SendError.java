package com.anselumjuju.utils;

import com.google.gson.Gson;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

public class SendError {
    private static final Gson gson = new Gson();

    public static void sendError(HttpServletResponse res, int status, String message) throws IOException {
        res.setStatus(status);
        res.getWriter().write(gson.toJson(Map.of(
                "success", false,
                "status", status,
                "message", message
        )));
    }
}
