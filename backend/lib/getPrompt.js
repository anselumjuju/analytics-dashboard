export const getPrompt = (tableSchema, tableName) => {
  const configFields = {
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

  const prompt = `
    You are a senior data analyst and business intelligence expert.

    Your task:
    Analyze the given table schema and generate AT LEAST 7 UNIQUE Zoho Analytics report config objects.

    STRICT RULES:
    - Think like a real analytics consultant.
    - DO NOT repeat similar report ideas.
    - Every report must serve a DIFFERENT analytical purpose.
    - Base insights ONLY on available columns.
    - Use numeric fields for measures and text/date fields for grouping.
    - Make reports business-meaningful (sales, profit, customers, geography, performance, trends, efficiency, etc.).
    - If a Date column exists, include time-based trend reports.
    - If Geography exists, include region/state/city performance.
    - If Sales/Profit exist, include profitability & growth analysis.
    - Each config MUST follow Zoho Analytics CONFIG_SCHEMA format.

    OUTPUT FORMAT:
    Return ONLY a JSON ARRAY of config objects — no explanation text. No other text.
    Even without mentioning JSON or enclosing within backticks, return the JSON ARRAY.

    ------------------------------------
    TABLE SCHEMA:
    ${JSON.stringify(tableSchema)}

    ------------------------------------
    CONFIG FIELD RULES:
    ${JSON.stringify(configFields)}
    - Strictly follow this format.
    - Do not add any additional fields.
    - Do not change the allowed values of any fields.
    - Do not change the format of any fields.
    - Do not remove any required fields.

    ------------------------------------
    TABLE NAME:
    ${tableName}
    - Use this as the baseTableName for each config object.
    - Don't change or modify this.

    ------------------------------------
    EXAMPLE OUTPUT STYLE (DO NOT COPY — JUST LEARN FORMAT):
    {
      "success": true,
      "configs": 
        [
          {
            "baseTableName": ${tableName},
            "title": "Sales Trend by Order Date",
            "description": "Tracks sales performance over time",
            "reportType": "chart",
            "chartType": "line",
            "axisColumns": [
              { "type": "xAxis", "columnName": "Order Date", "operation": "monthYear" },
              { "type": "yAxis", "columnName": "Sales", "operation": "sum" }
            ]
          },
          {
            "baseTableName": ${tableName},
            "title": "Profit by Category",
            "description": "Compares profit across product categories",
            "reportType": "chart",
            "chartType": "bar",
            "axisColumns": [
              { "type": "xAxis", "columnName": "Category", "operation": "actual" },
              { "type": "yAxis", "columnName": "Profit", "operation": "sum" }
            ]
          }
        ]
    }
    

    ------------------------------------
    NOW GENERATE:
    - Minimum 10 configs
    - Maximum creativity
    - Diverse insights
    - Strong real-world analytics value
    - Also keep the result in a json format like above without additional text
    - I'll parse the result and use it to generate a report
    - Don't change the tableName and use it in baseTableName
    - Only use the allowed values in configFields
    - Don't use any other values in configFields
    ;
    }
  `;

  return prompt;
};
