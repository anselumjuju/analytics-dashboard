package com.anselumjuju.services.ai;

import com.anselumjuju.utils.AllowedValueResolver;

import java.util.*;
import java.util.stream.Collectors;

public class ValidateConfigs {
    public static List<Map<String, Object>> validateConfigs(String tableName, Map<String, Object> tableSchema, List<Map<String, Object>> configs) {

        // Validation Constants

        // Available Fields
        List<String> VALID_KEYS = new ArrayList<>(List.of("baseTableName", "title", "description", "reportType", "chartType", "axisColumns", "filters", "userFilters", "isAxisMerge", "mergeAxisInfo"));
        // Keys
        List<String> VALID_REPORT_TYPES = new ArrayList<>(List.of("chart", "pivot", "summary"));
        List<String> VALID_CHART_TYPES = new ArrayList<>(List.of(
                "area", "area with points", "area without points", "smooth area", "smooth area with points", "smooth area without points", "stacked area", "stacked area with points", "stacked smooth area", "stacked smooth area with points", "stacked smooth area without points", "bar", "horizontal bar", "stacked bar", "horizontal stacked bar", "bubble", "packed bubble", "combo", "combo bar with smooth line", "funnel", "pyramid", "line", "line with points", "line without points", "smooth line", "smooth line with points", "smooth line without points", "step", "map area", "map bubble", "map filled", "map pie", "map pie bubble", "map bubble pie", "map scatter", "geo heat map", "pie", "ring", "semi pie", "semi ring", "scatter", "web", "web with fill", "web without fill", "heat map", "butterfly", "table chart"
        ));
        Map<String, List<String>> VALID_AXIS_COLUMN_REPORT_TYPES = new HashMap<>();
        VALID_AXIS_COLUMN_REPORT_TYPES.put("chart", new ArrayList<>(List.of("xAxis", "yAxis", "textAxis", "colorAxis", "toolTip")));
        VALID_AXIS_COLUMN_REPORT_TYPES.put("pivot", new ArrayList<>(List.of("row", "column", "data")));
        VALID_AXIS_COLUMN_REPORT_TYPES.put("summary", new ArrayList<>(List.of("groupBy", "summarize")));
        List<String> VALID_AXIS_COLUMN_OPERATIONS = new ArrayList<>(List.of(
                "year", "quarterYear", "monthYear", "weekYear", "fullDate", "dateTime", "range", "quarter", "month", "week", "weekDay", "day", "hour", "count", "distinctCount", "measure", "dimension", "range", "sum", "min", "max", "average", "stdDev", "median", "mode", "count", "variance", "distinctCount", "actual", "count", "distinctCount"
        ));
        List<String> VALID_FILTER_OPERATIONS = new ArrayList<>(List.of(
                "actual", "seasonal", "relative", "measure", "dimension", "range", "actual", "sum", "min", "max", "average", "stdDev", "median", "mode", "count", "variance", "distinctCount", "actual", "count", "distinctCount"
        ));
        List<String> VALID_FILTER_TYPES = new ArrayList<>(List.of(
                "individualValues", "range", "ranking", "rankingPct", "dateRange", "year", "quarterYear", "monthYear", "weekYear", "quarter", "month", "week", "weekDay", "day", "hour", "dateTime"
        ));
        List<String> VALID_USER_FILTER_OPERATIONS = new ArrayList<>(List.of(
                "actual", "seasonal", "relative", "measure", "dimension", "range", "actual", "sum", "min", "max", "average", "stdDev", "median", "mode", "count", "variance", "distinctCount", "actual", "count", "distinctCount"
        ));
        // Required Fields
        List<String> IMP_BASE_FIELDS = List.of("baseTableName", "title", "reportType", "axisColumns");
        List<String> IMP_AXIS_COLUMN_FIELDS = List.of("type", "operation", "columnName");
        List<String> IMP_FILTER_FIELDS = List.of("tableName", "columnName", "operation", "filterType", "values", "exclude");
        List<String> IMP_USER_FILTER_FIELDS = List.of("tableName", "columnName", "operation");

        // Column names
        Set<String> VALID_COLUMN_NAMES = tableSchema.keySet();


        try {
            // Remove unknown keys and rename table
            for (Map<String, Object> config : configs) {
                // Remove unknown keys
                Set<String> keys = new HashSet<>(config.keySet());
                for (String key : keys) {
                    if (!VALID_KEYS.contains(key))
                        config.remove(key);
                }

                // Rename baseTable & tableName in filters & userFilters
                config.put("baseTableName", tableName);

                if (config.containsKey("filters")) {
                    List<Map<String, Object>> filters = (List<Map<String, Object>>) config.get("filters");
                    for (Map<String, Object> filter : filters)
                        filter.put("tableName", tableName);
                }
                if (config.containsKey("userFilters")) {
                    List<Map<String, Object>> userFilters = (List<Map<String, Object>>) config.get("userFilters");
                    for (Map<String, Object> userFilter : userFilters)
                        userFilter.put("tableName", tableName);
                }
            }

            // Validate Column Names
            List<String> validColumnNames = new ArrayList<>(VALID_COLUMN_NAMES);
            for (Map<String, Object> config : configs) {
                // axisColumns
                List<Map<String, Object>> axisColumns = (List<Map<String, Object>>) config.get("axisColumns");
                if (axisColumns != null) {
                    for (Map<String, Object> axisColumn : axisColumns) {
                        String columnName = (String) axisColumn.get("columnName");
                        if (!VALID_COLUMN_NAMES.contains(columnName))
                            axisColumn.put("columnName", AllowedValueResolver.resolveFromAllowed(columnName, validColumnNames));
                    }
                }
                // filters
                List<Map<String, Object>> filters = (List<Map<String, Object>>) config.get("filters");
                if (filters != null) {
                    for (Map<String, Object> filter : filters) {
                        String columnName = (String) filter.get("columnName");
                        if (!VALID_COLUMN_NAMES.contains(columnName))
                            filter.put("columnName", AllowedValueResolver.resolveFromAllowed(columnName, validColumnNames));
                    }
                }
                // userFilters
                List<Map<String, Object>> userFilters = (List<Map<String, Object>>) config.get("userFilters");
                if (userFilters != null) {
                    for (Map<String, Object> userFilter : userFilters) {
                        String columnName = (String) userFilter.get("columnName");
                        if (!VALID_COLUMN_NAMES.contains(columnName))
                            userFilter.put("columnName", AllowedValueResolver.resolveFromAllowed(columnName, validColumnNames));
                    }
                }

            }

            // Validate Report & Chart Types
            List<String> validReportTypes = new ArrayList<>(VALID_REPORT_TYPES);
            List<String> validChartTypes = new ArrayList<>(VALID_CHART_TYPES);
            for (Map<String, Object> config : configs) {
                String reportType = (String) config.get("reportType");

                if (!VALID_REPORT_TYPES.contains(reportType))
                    config.put("reportType", AllowedValueResolver.resolveFromAllowed(reportType, validReportTypes));

                if (reportType.equals("chart")) {
                    String chartType = (String) config.get("chartType");
                    config.put("chartType", AllowedValueResolver.resolveFromAllowed(chartType, validChartTypes));
                }
            }

            // Validate axisColumns
            List<String> validAxisColumnOperations = new ArrayList<>(VALID_AXIS_COLUMN_OPERATIONS);
            for (Map<String, Object> config : configs) {
                String reportType = (String) config.get("reportType");
                List<String> validTypes = VALID_AXIS_COLUMN_REPORT_TYPES.get(reportType);
                List<Map<String, String>> axisColumns = (List<Map<String, String>>) config.get("axisColumns");
                if (axisColumns == null) continue;
                for (Map<String, String> axisColumn : axisColumns) {
                    axisColumn.put("type", AllowedValueResolver.resolveFromAllowed(axisColumn.get("type"), validTypes));
                    axisColumn.put("operation", AllowedValueResolver.resolveFromAllowed(axisColumn.get("operation"), validAxisColumnOperations));
                }
            }

            // Validate filters
            List<String> validFilterOperations = new ArrayList<>(VALID_FILTER_OPERATIONS);
            List<String> validFilterTypes = new ArrayList<>(VALID_FILTER_TYPES);
            for (Map<String, Object> config : configs) {
                if (config.containsKey("filters")) {
                    List<Map<String, String>> filters = (List<Map<String, String>>) config.get("filters");
                    for (Map<String, String> filter : filters) {
                        filter.put("operation", AllowedValueResolver.resolveFromAllowed(filter.get("operation"), validFilterOperations));
                        filter.put("filterType", AllowedValueResolver.resolveFromAllowed(filter.get("filterType"), validFilterTypes));
                    }
                }
            }

            // Validate user filters
            List<String> validUserFilterOperations = new ArrayList<>(VALID_USER_FILTER_OPERATIONS);
            for (Map<String, Object> config : configs) {
                if (config.containsKey("userFilters")) {
                    List<Map<String, String>> userFilters = (List<Map<String, String>>) config.get("userFilters");
                    for (Map<String, String> userFilter : userFilters)
                        userFilter.put("operation", AllowedValueResolver.resolveFromAllowed(userFilter.get("operation"), validUserFilterOperations));
                }
            }

            // Validate isAxisMerge
            for (Map<String, Object> config : configs)
                config.put("isAxisMerge", config.getOrDefault("isAxisMerge", "false"));

            // Validate important fields
            List<Map<String, Object>> validConfigs = new ArrayList<>();
            for (Map<String, Object> config : configs) {
                boolean isValid = true;

                for (String field : IMP_BASE_FIELDS) {
                    if (!config.containsKey(field)) {
                        isValid = false;
                        break;
                    }
                }

                List<Map<String, Object>> axisColumns = (List<Map<String, Object>>) config.get("axisColumns");
                List<Map<String, Object>> validAxisColumns = new ArrayList<>();
                if (axisColumns != null) {
                    for (Map<String, Object> axisColumn : axisColumns) {
                        boolean validAxis = true;
                        for (String field : IMP_AXIS_COLUMN_FIELDS) {
                            if (!axisColumn.containsKey(field)) {
                                validAxis = false;
                                break;
                            }
                        }
                        if (validAxis) validAxisColumns.add(axisColumn);
                    }
                }
                config.put("axisColumns", validAxisColumns);

                // Validate filters
                if (config.containsKey("filters")) {
                    List<Map<String, Object>> filters = (List<Map<String, Object>>) config.get("filters");
                    List<Map<String, Object>> validFilters = new ArrayList<>();
                    if (filters != null) {
                        for (Map<String, Object> filter : filters) {
                            boolean validFilter = true;
                            for (String field : IMP_FILTER_FIELDS) {
                                if (!filter.containsKey(field)) {
                                    validFilter = false;
                                    break;
                                }
                            }
                            if (validFilter) validFilters.add(filter);
                        }
                    }
                    config.put("filters", validFilters);
                }

                // Validate userFilters
                if (config.containsKey("userFilters")) {
                    List<Map<String, Object>> userFilters = (List<Map<String, Object>>) config.get("userFilters");
                    List<Map<String, Object>> validUserFilters = new ArrayList<>();
                    if (userFilters != null) {
                        for (Map<String, Object> userFilter : userFilters) {
                            boolean validUserFilter = true;
                            for (String field : IMP_USER_FILTER_FIELDS) {
                                if (!userFilter.containsKey(field)) {
                                    validUserFilter = false;
                                    break;
                                }
                            }
                            if (validUserFilter) validUserFilters.add(userFilter);
                        }
                    }
                    config.put("userFilters", validUserFilters);
                }

                if (isValid)
                    validConfigs.add(config);
            }
            configs = validConfigs;

            // Since some values for userFilter operations is not working
            // If userFilter is with columnType Date, remove the userFilter
            int userFiltersRemoved = 0;
            List<String> invalidOperations = new ArrayList<>(List.of("actual", "seasonal", "relative"));
            for (Map<String, Object> config : configs) {
                if (config.containsKey("userFilters")) {
                    List<Map<String, String>> userFilters = (List<Map<String, String>>) config.get("userFilters");

                    int before = userFilters.size();
                    userFilters.removeIf(f -> {
                        String columnType = (String) tableSchema.get(f.get("columnName"));
                        if (columnType.equals("Date"))
                            return invalidOperations.contains(f.get("operation"));
                        return false;
                    });

                    userFiltersRemoved += (before - userFilters.size());
                    config.put("userFilters", userFilters);
                }
            }
            if (userFiltersRemoved > 0)
                System.out.println("Removed " + userFiltersRemoved + " userFilters for invalid operations");


        } catch (Exception e) {
            System.out.println("Error validating configs: " + e.getMessage());
            return null;
        }

        return configs;
    }
}
