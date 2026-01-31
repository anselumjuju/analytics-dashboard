package com.anselumjuju.services;

import com.anselumjuju.controllers.WebSocket;
import com.google.gson.Gson;
import jakarta.websocket.Session;

import java.util.Map;

public class ProgressSocket {
    public static void send(String jobId, int progress, String message) {
        Session session = WebSocket.get(jobId);

        if (session == null || !session.isOpen()) return;

        try {
            String json = new Gson().toJson(Map.of(
                    "progress", progress,
                    "message", message
            ));
            session.getAsyncRemote().sendText(json);
        } catch (Exception e) {
            System.out.println("Error sending progress ws " + e.getMessage());
        }
    }
}
