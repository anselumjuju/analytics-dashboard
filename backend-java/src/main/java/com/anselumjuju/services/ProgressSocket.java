package com.anselumjuju.services;

import com.anselumjuju.controllers.WebSocket;
import com.anselumjuju.lib.AccessToken;
import com.anselumjuju.lib.EnvConfig;
import com.anselumjuju.lib.Utils;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import jakarta.websocket.Session;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

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
