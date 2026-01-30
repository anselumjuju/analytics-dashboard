package com.anselumjuju.lib;

public class ReportConfigSchema {
    public static String reportConfigSchema() {
        return """
                {
                  baseTableName: {type: 'String', required: true, description: 'Name of the base table used to create report'},
                  title: {type: 'String', required: true, description: 'Name of the report'},
                  description: {type: 'String', required: false, description: 'Description of the report'},
                  reportType: {type: 'String', required: true, allowedValues: ['chart', 'pivot', 'summary']},
                  chartType: {
                    type: 'String',
                    requiredIf: "reportType == 'chart'",
                    allowedValues: {
                      areaCharts: [
                        'area',
                        'area with points',
                        'area without points',
                        'smooth area',
                        'smooth area with points',
                        'smooth area without points',
                        'stacked area',
                        'stacked area with points',
                        'stacked smooth area',
                        'stacked smooth area with points',
                        'stacked smooth area without points',
                      ],
                      barCharts: ['bar', 'horizontal bar', 'stacked bar', 'horizontal stacked bar'],
                      bubbleCharts: ['bubble', 'packed bubble'],
                      comboCharts: ['combo', 'combo bar with smooth line'],
                      funnelPyramidCharts: ['funnel', 'pyramid'],
                      lineCharts: ['line', 'line with points', 'line without points', 'smooth line', 'smooth line with points', 'smooth line without points', 'step'],
                      mapCharts: ['map area', 'map bubble', 'map filled', 'map pie', 'map pie bubble', 'map bubble pie', 'map scatter', 'geo heat map'],
                      pieRingCharts: ['pie', 'ring', 'semi pie', 'semi ring'],
                      scatterCharts: ['scatter'],
                      webCharts: ['web', 'web with fill', 'web without fill'],
                      heatMaps: ['heat map'],
                      otherCharts: ['butterfly', 'table chart'],
                    },
                  },
                  axisColumns: {
                    type: 'JSONArray',
                    required: true,
                    structure: {
                      type: {
                        type: 'String',
                        required: true,
                        allowedValuesByReportType: {chart: ['xAxis', 'yAxis', 'textAxis', 'colorAxis', 'toolTip'], pivot: ['row', 'column', 'data'], summary: ['groupBy', 'summarize']},
                      },
                      columnName: {type: 'String', required: true},
                      operation: {
                        type: 'String',
                        required: true,
                        allowedValuesByDataType: {
                          Date: ['year', 'quarterYear', 'monthYear', 'weekYear', 'fullDate', 'dateTime', 'range', 'quarter', 'month', 'week', 'weekDay', 'day', 'hour', 'count', 'distinctCount'],
                          Numeric: ['measure', 'dimension', 'range', 'sum', 'min', 'max', 'average', 'stdDev', 'median', 'mode', 'count', 'variance', 'distinctCount'],
                          String: ['actual', 'count', 'distinctCount'],
                        },
                      },
                    },
                  },
                  filters: {
                    type: 'JSONArray',
                    required: false,
                    structure: {
                      tableName: {type: 'String', required: true},
                      columnName: {type: 'String', required: true},
                      operation: {
                        type: 'String',
                        required: true,
                        allowedValuesByDataType: {
                          Date: ['actual', 'seasonal', 'relative'],
                          Numeric: ['measure', 'dimension', 'range', 'actual', 'sum', 'min', 'max', 'average', 'stdDev', 'median', 'mode', 'count', 'variance', 'distinctCount'],
                          String: ['actual', 'count', 'distinctCount'],
                        },
                      },
                      filterType: {
                        type: 'String',
                        required: true,
                        allowedValues: [
                          'individualValues',
                          'range',
                          'ranking',
                          'rankingPct',
                          'dateRange',
                          'year',
                          'quarterYear',
                          'monthYear',
                          'weekYear',
                          'quarter',
                          'month',
                          'week',
                          'weekDay',
                          'day',
                          'hour',
                          'dateTime',
                        ],
                      },
                      values: {
                        type: 'JSONArray',
                        required: true,
                        valueExamples: {
                          ranking: ['Top 5'],
                          range: ['1000 to 2000'],
                          individualValues: ['20.97'],
                          year: ['2012'],
                          monthYear: ['Aug 2012'],
                          weekYear: ['W03 2012'],
                          quarterYear: ['Q1 2012'],
                          actualDate: ['10 Mar 2012'],
                          dateTime: ['10 Mar 2012 10:00:00'],
                          dateRange: ['from 10 Dec 2013 00:00:00'],
                          seasonalMonth: ['Jan'],
                          relativeYear: ['Last Year'],
                        },
                      },
                      exclude: {type: 'String', required: true, allowedValues: ['true', 'false']},
                    },
                  },
                  userFilters: {
                    type: 'JSONArray',
                    required: false,
                    structure: {
                      tableName: {type: 'String', required: true},
                      columnName: {type: 'String', required: true},
                      operation: {
                        type: 'String',
                        required: true,
                        allowedValuesByDataType: {
                          Date: ['actual', 'seasonal', 'relative'],
                          Numeric: ['measure', 'dimension', 'range', 'actual', 'sum', 'min', 'max', 'average', 'stdDev', 'median', 'mode', 'count', 'variance', 'distinctCount'],
                          String: ['actual', 'count', 'distinctCount'],
                        },
                      },
                    },
                  },
                  isAxisMerge: {type: 'String', required: false, allowedValues: ['true', 'false']},
                  mergeAxisInfo: {type: 'String', requiredIf: 'isAxisMerge == true', formatExample: {axisIndex: [2, 3], labelName: 'Merge_axis'}},
                };
                """;

    }
}
