import {askGemini} from '../../lib/gemini.js';
import {createReportSchema} from '../../lib/data.js';

export const getConfig = async ({tableSchema, tableName}) => {
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
    ${JSON.stringify(createReportSchema)}
    - Strictly follow this format.
    - Do not add any additional fields.
    - Do not change the allowed values of any fields.
    - Do not change the format of any fields.
    - Do not remove any required fields.
    - Make sure to add userFilters and Filters atmost.
    - Use userFilters whenever possible

    ------------------------------------
    TABLE NAME:
    ${tableName}
    - Use this as the baseTableName for each config object.
    - Don't change or modify this.

    ------------------------------------
    EXAMPLE OUTPUT STYLE (DO NOT COPY — JUST LEARN FORMAT):
    [
      {
        "baseTableName": ${tableName},
        "title": "Top 10 Most Profitable Products",
        "description": "Identifies the leading products contributing to the bottom line.",
        "reportType": "chart",
        "chartType": "horizontal bar",
        "axisColumns": [
          {"type": "xAxis", "columnName": "Product Name", "operation": "actual"},
          {"type": "yAxis", "columnName": "Profit", "operation": "sum"}
        ],
        "filters": [{"tableName": ${tableName}, "columnName": "Profit", "operation": "sum", "filterType": "ranking", "values": ["Top 10"], "exclude": "false"}],
        "isAxisMerge": "false"
      },
      {
        "baseTableName": ${tableName},
        "title": "Shipping Mode and Region Efficiency",
        "description": "Pivot table analyzing order volume across different shipping modes and regions.",
        "reportType": "pivot",
        "axisColumns": [
          {"type": "row", "columnName": "Region", "operation": "actual"},
          {"type": "column", "columnName": "Ship Mode", "operation": "actual"},
          {"type": "data", "columnName": "Order ID", "operation": "distinctCount"}
        ],
        "userFilters": [{"tableName": ${tableName}, "columnName": "Category", "operation": "actual"}],
        "isAxisMerge": "false"
      },
    ]
    

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

  const response = await askGemini(prompt);
  const config = JSON.parse(response);
  return config.data;
};
