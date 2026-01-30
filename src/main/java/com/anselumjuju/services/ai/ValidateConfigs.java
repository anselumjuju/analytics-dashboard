package com.anselumjuju.services.ai;

import com.anselumjuju.utils.AllowedValueResolver;

import java.util.*;
import java.util.stream.Collectors;

public class ValidateConfigs {
    public static List<Map<String, Object>> validateConfigs(String tableName, Map<String, Object> tableSchema, List<Map<String, Object>> configs) {

        try {
//        Remove unknown keys
            List<String> validKeys = new ArrayList<>(List.of("baseTableName", "title", "description", "reportType", "chartType", "axisColumns", "filters", "userFilters", "isAxisMerge", "mergeAxisInfo"));
            for (Map<String, Object> config : configs) {
                Set<String> keys = config.keySet();
                for (String key : keys) {
                    if (!validKeys.contains(key))
                        config.remove(key);
                }
            }

//        Validate table names
            for (Map<String, Object> config : configs) {
//            Update baseTableName
                config.put("baseTableName", tableName);
//            Update tableName in filters
                if (config.containsKey("filters")) {
                    List<Map<String, Object>> filters = (List<Map<String, Object>>) config.get("filters");
                    for (Map<String, Object> filter : filters) {
                        filter.put("tableName", tableName);
                    }
                }
//            Update tableName in userFilters
                if (config.containsKey("userFilters")) {
                    List<Map<String, Object>> userFilters = (List<Map<String, Object>>) config.get("userFilters");
                    for (Map<String, Object> userFilter : userFilters) {
                        userFilter.put("tableName", tableName);
                    }
                }
            }

//        Validate column names
            Set<String> validColumnNames = tableSchema.keySet();
            for (Map<String, Object> config : configs) {
//            Update columnNames in axisColumns
                if (config.containsKey("axisColumns")) {
                    List<Map<String, Object>> axisColumns = (List<Map<String, Object>>) config.get("axisColumns");
                    for (Map<String, Object> axisColumn : axisColumns) {
                        String columnName = (String) axisColumn.get("columnName");
                        if (!validColumnNames.contains(columnName))
                            axisColumn.put("columnName", AllowedValueResolver.resolveFromAllowed(columnName, new ArrayList<>(validColumnNames)));
                    }
                }
//            Update columnNames in filters
                if (config.containsKey("filters")) {
                    List<Map<String, Object>> filters = (List<Map<String, Object>>) config.get("filters");
                    for (Map<String, Object> filter : filters) {
                        String columnName = (String) filter.get("columnName");
                        if (!validColumnNames.contains(columnName))
                            filter.put("columnName", AllowedValueResolver.resolveFromAllowed(columnName, new ArrayList<>(validColumnNames)));
                    }
                }
//            Update columnNames in userFilters
                if (config.containsKey("userFilters")) {
                    List<Map<String, Object>> userFilters = (List<Map<String, Object>>) config.get("userFilters");
                    for (Map<String, Object> userFilter : userFilters) {
                        String columnName = (String) userFilter.get("columnName");
                        if (!validColumnNames.contains(columnName))
                            userFilter.put("columnName", AllowedValueResolver.resolveFromAllowed(columnName, new ArrayList<>(validColumnNames)));
                    }
                }
            }

//        Validate report types

            List<String> validReportTypes = new ArrayList<>(List.of("chart", "pivot", "summary"));
            for (Map<String, Object> config : configs) {
                String reportType = (String) config.get("reportType");
                if (!validReportTypes.contains(reportType))
                    config.put("reportType", AllowedValueResolver.resolveFromAllowed(reportType, new ArrayList<>(validReportTypes)));
            }

//        Validate chart types
            List<String> validChartTypes = new ArrayList<>();
            validChartTypes.addAll(List.of("area", "area with points", "area without points", "smooth area", "smooth area with points", "smooth area without points", "stacked area", "stacked area with points", "stacked smooth area", "stacked smooth area with points", "stacked smooth area without points", "bar", "horizontal bar", "stacked bar", "horizontal stacked bar", "bubble", "packed bubble", "combo", "combo bar with smooth line", "funnel", "pyramid", "line", "line with points", "line without points", "smooth line", "smooth line with points", "smooth line without points", "step", "map area", "map bubble", "map filled", "map pie", "map pie bubble", "map bubble pie", "map scatter", "geo heat map", "pie", "ring", "semi pie", "semi ring", "scatter", "web", "web with fill", "web without fill", "heat map", "butterfly", "table chart"));
            for (Map<String, Object> config : configs) {
                if (!config.get("reportType").equals("chart"))
                    continue;
                String chartType = (String) config.get("chartType");
                if (!validChartTypes.contains(chartType))
                    config.put("chartType", AllowedValueResolver.resolveFromAllowed(chartType, new ArrayList<>(validChartTypes)));
            }


//        Validate axis columns
            Map<String, List<String>> allowedValuesByReportType = new HashMap<>();
            allowedValuesByReportType.put("chart", List.of("xAxis", "yAxis", "textAxis", "colorAxis", "toolTip"));
            allowedValuesByReportType.put("pivot", List.of("row", "column", "data"));
            allowedValuesByReportType.put("summary", List.of("groupBy", "summarize"));
            List<String> validAxisColumnOperations = new ArrayList<>(List.of("year", "quarterYear", "monthYear", "weekYear", "fullDate", "dateTime", "range", "quarter", "month", "week", "weekDay", "day", "hour", "count", "distinctCount", "measure", "dimension", "range", "sum", "min", "max", "average", "stdDev", "median", "mode", "count", "variance", "distinctCount", "actual", "count", "distinctCount"));
            for (Map<String, Object> config : configs) {
                String reportType = (String) config.get("reportType");
                List<String> validTypes = allowedValuesByReportType.getOrDefault(reportType, null);
                if (validTypes == null) configs.remove(config);
                List<Map<String, String>> axisColumns = (List<Map<String, String>>) config.get("axisColumns");
                for (Map<String, String> axisColumn : axisColumns) {
                    axisColumn.put("type", AllowedValueResolver.resolveFromAllowed(axisColumn.get("type"), validTypes));
                    axisColumn.put("operation", AllowedValueResolver.resolveFromAllowed(axisColumn.get("operation"), validAxisColumnOperations));
                }
            }

//        Validate filters
            List<String> validFilterOperations = new ArrayList<>(List.of("actual", "seasonal", "relative", "measure", "dimension", "range", "actual", "sum", "min", "max", "average", "stdDev", "median", "mode", "count", "variance", "distinctCount", "actual", "count", "distinctCount"));
            List<String> validFilterTypes = new ArrayList<>(List.of("individualValues", "range", "ranking", "rankingPct", "dateRange", "year", "quarterYear", "monthYear", "weekYear", "quarter", "month", "week", "weekDay", "day", "hour", "dateTime"));
            for (Map<String, Object> config : configs) {
                if (config.containsKey("filters")) {
                    List<Map<String, String>> filters = (List<Map<String, String>>) config.get("filters");
                    for (Map<String, String> filter : filters) {
                        filter.put("operation", AllowedValueResolver.resolveFromAllowed(filter.get("operation"), validFilterOperations));
                        filter.put("filterType", AllowedValueResolver.resolveFromAllowed(filter.get("filterType"), validFilterTypes));
                    }
                }
            }

//        Validate user filters
            List<String> validUserFilterOperations = new ArrayList<>(List.of("actual", "seasonal", "relative", "measure", "dimension", "range", "actual", "sum", "min", "max", "average", "stdDev", "median", "mode", "count", "variance", "distinctCount", "actual", "count", "distinctCount"));
            for (Map<String, Object> config : configs) {
                if (config.containsKey("userFilters")) {
                    List<Map<String, String>> userFilters = (List<Map<String, String>>) config.get("userFilters");
                    for (Map<String, String> userFilter : userFilters) {
                        userFilter.put("operation", AllowedValueResolver.resolveFromAllowed(userFilter.get("operation"), validUserFilterOperations));
                    }
                }
            }

//        Validate isAxisMerge
            List<String> validIsAxisMerge = new ArrayList<>(List.of("true", "false"));
            for (Map<String, Object> config : configs)
                config.put("isAxisMerge", config.getOrDefault("isAxisMerge", "false"));

//        Validate important fields
            List<String> impBaseFields = List.of("baseTableName", "title", "reportType", "axisColumns");
            List<String> impAxisFields = List.of("type", "operation", "columnName");
            List<String> impFilterFields = List.of("tableName", "columnName", "operation", "filterType", "values", "exclude");
            List<String> impUserFilterFields = List.of("tableName", "columnName", "operation");

            List<Map<String, Object>> validConfigs = new ArrayList<>();
            for (Map<String, Object> config : configs) {
                boolean validConfig = true;
                for (String field : impBaseFields) {
                    if (!config.containsKey(field)) {
                        validConfig = false;
                        break;
                    }
                }

                if (!validConfig)
                    continue;

                List<Map<String, Object>> axisColumns = (List<Map<String, Object>>) config.get("axisColumns");
                List<Map<String, Object>> validAxisColumns = new ArrayList<>();
                if (axisColumns != null) {
                    for (Map<String, Object> axisColumn : axisColumns) {
                        boolean validAxis = true;
                        for (String field : impAxisFields) {
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
                List<Map<String, Object>> filters = (List<Map<String, Object>>) config.get("filters");
                List<Map<String, Object>> validFilters = new ArrayList<>();
                if (filters != null) {
                    for (Map<String, Object> filter : filters) {
                        boolean validFilter = true;
                        for (String field : impFilterFields) {
                            if (!filter.containsKey(field)) {
                                validFilter = false;
                                break;
                            }
                        }
                        if (validFilter) validFilters.add(filter);
                    }
                }
                config.put("filters", validFilters);

                // Validate userFilters
                List<Map<String, Object>> userFilters = (List<Map<String, Object>>) config.get("userFilters");
                List<Map<String, Object>> validUserFilters = new ArrayList<>();
                if (userFilters != null) {
                    for (Map<String, Object> userFilter : userFilters) {
                        boolean validUserFilter = true;
                        for (String field : impUserFilterFields) {
                            if (!userFilter.containsKey(field)) {
                                validUserFilter = false;
                                break;
                            }
                        }
                        if (validUserFilter) validUserFilters.add(userFilter);
                    }
                }
                config.put("userFilters", validUserFilters);

                if (!config.containsKey("isAxisMerge"))
                    config.put("isAxisMerge", "false");

                validConfigs.add(config);
            }

            configs = validConfigs;

            // Since some values for userFilter operations is not working
            // If userFilter is with columnType Date, remove the userFilter
            int userFiltersRemoved = 0;
            for (Map<String, Object> config : configs) {
                if (config.containsKey("userFilters")) {
                    List<Map<String, String>> userFilters = (List<Map<String, String>>) config.get("userFilters");
                    userFiltersRemoved = userFilters.size();
                    List<String> invalidOperations = new ArrayList<>(List.of("actual", "seasonal", "relative"));
                    userFilters = userFilters.stream().filter(userFilter -> !invalidOperations.contains(userFilter.get("operation"))).collect(Collectors.toList());
                    userFiltersRemoved -= userFilters.size();
                    config.put("userFilters", userFilters);
                }
            }
            if (userFiltersRemoved > 0)
                System.out.println("Removed " + userFiltersRemoved + " userFilters for invalid operations");

            // Remove configs with null values
            configs = configs.stream().filter(config -> config != null).collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("Error validating configs: " + e);
            return null;
        }

        return configs;
    }
}
