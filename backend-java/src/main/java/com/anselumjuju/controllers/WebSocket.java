package com.anselumjuju.controllers;

import jakarta.websocket.OnClose;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ServerEndpoint("/ws/progress/{jobId}")
public class WebSocket {
    private static final Map<String, Session> sessions = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session,@PathParam("jobId") String jobId) {
        sessions.put(jobId, session);
        System.out.println("WS connected: " + jobId);
    }

    @OnClose
    public void onClose(@PathParam("jobId") String jobId) {
        sessions.remove(jobId);
        System.out.println("WS closed: " + jobId);
    }

    public static Session get(String jobId) {
        return sessions.get(jobId);
    }
}
