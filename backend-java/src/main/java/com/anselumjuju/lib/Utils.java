package com.anselumjuju.lib;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class Utils {
    public static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
