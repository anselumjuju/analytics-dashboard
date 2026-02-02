package com.anselumjuju.lib;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Utils {
    public static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    public static String encodeLinks(List<String> viewIds, String workspaceId) {
        String expriryTime = String.valueOf(System.currentTimeMillis() + 24 * 3600 * 1000);
        String str = workspaceId + "-" + String.join(",", viewIds) + "-" + expriryTime;
        String encoded = Base64.getEncoder().encodeToString(str.getBytes());

        return encoded;
    }

    public static Map<String, Object> decodeLinks(String encoded) {
        String decoded = new String(Base64.getDecoder().decode(encoded));
        String[] parts = decoded.split("-");
        String workspaceId = parts[0];
        String viewIds = parts[1];
        String expriryTime = parts[2];

        if (Long.parseLong(expriryTime) < System.currentTimeMillis())
            return null;

        Map<String, Object> resMap = new HashMap<>();
        resMap.put("workspaceId", workspaceId);
        resMap.put("viewIds", List.of(viewIds.split(",")));

        return resMap;
    }

}
