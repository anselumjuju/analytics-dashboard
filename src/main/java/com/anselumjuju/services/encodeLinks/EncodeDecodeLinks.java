package com.anselumjuju.services.encodeLinks;


import java.util.Base64;
import java.util.List;

public class EncodeDecodeLinks {
    public static String encodeLinks(List<String> viewIds) {
        String expriryTime = String.valueOf(System.currentTimeMillis() + 24 * 3600 * 1000);
        String str = String.join(",", viewIds) + "-" + expriryTime;
        String encoded = encode(str);

        return encoded;
    }

    public static List<String> decodeLinks(String encoded) {
        String decoded = decode(encoded);
        String[] parts = decoded.split("-");
        String viewIds = parts[0];
        String expriryTime = parts[1];

        if (Long.parseLong(expriryTime) < System.currentTimeMillis())
            return null;

        return List.of(viewIds.split(","));
    }

    public static String encode(String input) {
        return Base64.getEncoder().encodeToString(input.getBytes());
    }

    public static String decode(String encoded) {
        return new String(Base64.getDecoder().decode(encoded));
    }
}
