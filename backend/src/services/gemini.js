import {env} from '../lib/env.js';
import {safeJson} from '../lib/utils.js';
import {reportConfigSchema} from './reportConfigSchema.js';
import {validateConfigs} from './validateConfigs.js';

async function generateJson(model, systemInstruction, contents) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      systemInstruction: {parts: [{text: systemInstruction}]},
      contents: contents.map((text) => ({role: 'user', parts: [{text}]})),
      generationConfig: {responseMimeType: 'application/json'},
    }),
  });

  if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}`);

  const body = await response.json();
  return body?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function getConfigs(uploadResponse, jobId, sendProgress) {
  const tableName = String(uploadResponse.tableName);
  const tableSchema = uploadResponse.tableSchema;

  try {
    const text = await generateJson('gemini-2.5-flash-lite', getSystemInstruction(), [
      `Input: \n${getInput(tableName, tableSchema)}`,
      `Objective: \n${getObjective()}`,
      `Steps: \n${getSteps()}`,
      `Return the output in this format: \n${getExample(tableName)}`,
    ]);

    const responseBody = safeJson(text);
    const configs = responseBody.configs || [];

    sendProgress(jobId, 45, 'Building smart Insights');
    const validatedConfigs = validateConfigs(tableName, tableSchema, configs);

    return {
      reportHeading: responseBody.reportHeading,
      reportDescription: responseBody.reportDescription,
      configs: validatedConfigs,
    };
  } catch (error) {
    console.log(`Error getting configs ${error.message}`);
    return null;
  }
}

export async function getInsight(tableSchema, insights) {
  try {
    const text = await generateJson('gemini-2.5-flash-lite', getInsightSystemInstruction(), [
      getInsightInput(tableSchema, insights).replaceAll('%', '%%'),
      getInsightRules(),
      getInsightExample(),
    ]);

    const responseBody = safeJson(text);
    return responseBody.insight;
  } catch (error) {
    console.log(`Error getting insights ${error.message}`);
    return null;
  }
}

function getSystemInstruction() {
  return `ROLE:\nYou are a Senior Data Analyst and Business Intelligence Architect.\nMISSION:\nAnalyze a dataset schema like a BI professional.\nInfer what the dataset represents,\nIdentify its business domain, and design high-impact, decision-ready analytics\nStrictly based on the schema provided.\nYou generate charts intentionally and based on clear requirements.\nYou are NOT being creative or speculative.\nYou operate strictly within provided facts and instructions.\nINPUTS:\n- A table schema (table name, column names, data types)\n- A strict analytics configuration schema that defines the required JSON output\nANALYTICAL RESPONSIBILITIES:\n- Infer the dataset’s real-world domain from table and column semantics\n- Understand the underlying business or operational process\n- Prioritize insights based on business impact\n- Select appropriate report or chart types\n- Build a coherent analytics story\nDESIGN RULES:\n- Treat the dataset as production business data\n- Focus on trends, distributions, comparisons\n- Avoid redundant, low-value, or decorative analytics\n- Ensure every chart or report answers a clear business question\nOUTPUT CONSTRAINTS (STRICT):\n- Output ONLY valid JSON\n- Follow the provided schema EXACTLY\n- Do NOT add, remove, rename, or reorder fields\n- Do NOT include explanations, markdown, or extra text\n- Do NOT invent columns or metrics not inferable from the schema`;
}

function getInput(tableName, tableSchema) {
  return `INPUT DATA (AUTHORITATIVE):\nTABLE SCHEMA (SOURCE OF TRUTH):\n${JSON.stringify(tableSchema, null, 2)}\n\nCONFIG CONTRACT (STRICT & IMMUTABLE):\n${reportConfigSchema()}\n\nBASE TABLE NAME (IMMUTABLE):\n${tableName}`;
}

function getObjective() {
  return `GLOBAL RULES — NON-NEGOTIABLE:\n- createReportSchema is a STRICT contract\n- Do NOT add, remove, rename, or reorder any fields\n- Use ONLY columns explicitly present in TABLE SCHEMA\n- Use baseTableName EXACTLY as provided\n- NEVER modify, alias, or infer alternative table names\n- Output MUST be valid JSON\n- Do NOT include explanations, reasoning steps, or markdown\nOBJECTIVE:\nDesign a production-grade Business Intelligence analytics report that delivers high-impact, decision-oriented insights derived strictly from the given table schema.\nThe output must resemble work produced by a senior BI professional.`;
}

function getSteps() {
  return `PHASE 1 — SCHEMA & DOMAIN UNDERSTANDING:\n- Classify each column as: metric, dimension, time, or identifier\n- Infer the real-world business domain (Sales, Finance, Operations, HR, etc.)\n- Identify decision-driving metrics and operational signals\n\nPHASE 2 — ANALYTICS STORY FLOW (STRICT ORDER):\nConstruct insights in the following narrative sequence:\n1. Executive overview\n2. Core performance indicators\n3. Temporal trends\n4. Top contributors\n5. Bottom performers\n6. Key drivers\n7. Risk indicators\n8. Optimization opportunities\n9. Growth signals\n\nPHASE 3 — BUSINESS QUESTIONS:\n- Generate 7–10 UNIQUE, non-trivial business questions\n- Each question MUST:\n  - Be answerable using the provided schema\n  - Combine at least two meaningful columns\n  - Be directly useful for decision-making\n\nPHASE 4 — ANALYSIS & VISUAL SELECTION:\nFor each business question:\n- Select the strongest analytical comparison:\n  trend, ranking, contribution, breakdown, or correlation\n- Choose the optimal visualization:\n  - Trend → line / area\n  - Ranking → bar\n  - Comparison → grouped bar\n  - Correlation → scatter\n  - Contribution → pie / ring\n  - Breakdown → pivot / table\n- Avoid redundant, weak, or decorative visuals\n\nPHASE 5 — FINAL CONFIG GENERATION:\n- Generate a MINIMUM of 10 report configurations\n- First configuration MUST represent the highest-value insight\n- Rank all configs by business priority and narrative flow\n- Avoid overlapping or duplicated insights\n- Follow createReportSchema EXACTLY\n\nFILTER STRATEGY:\n- Add filters ONLY when they improve decision-making\n- Prefer userFilters for interactive exploration\n- Avoid userFilters on Date-type columns\n- Use multiple userFilters atleast one for each config\n\nOUTPUT REQUIREMENTS (ABSOLUTE):\n- Use key name: reportHeading (NOT title)\n- reportHeading MUST be a concise string of MAXIMUM 4 words\n- Use key name: reportDescription (NOT description)\n- reportDescription MUST be a concise string of MAXIMUM 15 words\n- Output ONLY the final JSON configuration object\n- Match createReportSchema EXACTLY\n- No invented columns, tables, or metrics\n- No duplicate insights\n- No extra text`;
}

function getExample(tableName) {
  return `FORMAT REFERENCE (STRUCTURE ONLY — DO NOT COPY VALUES):\n{\n  reportHeading: "Concise BI Summary",\n  reportDescription: "This is a concise BI summary",\n  configs: [\n    {\n      "baseTableName": ${JSON.stringify(tableName)},\n      "title": "Top Revenue Contributors",\n      "description": "Highlights entities driving the highest revenue impact.",\n      "reportType": "chart",\n      "chartType": "horizontal bar",\n      "axisColumns": [\n        {"type": "xAxis", "columnName": "Entity", "operation": "actual"},\n        {"type": "yAxis", "columnName": "Revenue", "operation": "sum"}\n      ],\n      "filters": [\n        {\n          "tableName": ${JSON.stringify(tableName)},\n          "columnName": "Revenue",\n          "operation": "sum",\n          "filterType": "ranking",\n          "values": ["Top 10"],\n          "exclude": "false"\n        }\n      ],\n      "isAxisMerge": "false"\n    }\n  ]\n}`;
}

function getInsightSystemInstruction() {
  return `ROLE:\nYou are a Business Intelligence Synthesis Agent responsible for consolidating analytical insights into a single executive-level conclusion.\nMISSION:\n- Analyze the provided table schema to infer the dataset domain\n- Review the given report insights and understand their analytical flow\n- Determine what each insight represents in business terms\n- Synthesize them into one coherent, high-impact overall insight\nRULES:\n- Output must be strictly valid JSON\n- Derive conclusions only from the provided insights\n- Do not introduce new metrics, assumptions, or data\n- Preserve numerical values exactly as stated\n- Avoid generic summaries; focus on decision-level implications`;
}

function getInsightInput(tableSchema, insights) {
  return `INPUT DATA:\nTABLE SCHEMA (SOURCE OF TRUTH):\n${JSON.stringify(tableSchema)}\nINSIGHTS (use these insights to create summary):\n${JSON.stringify(insights)}\nOUTPUT SCHEMA (output should strictly follow this schema):\n{\n  "insight" : "[Overall insight as Markdown String][450–500 words]"\n}`;
}

function getInsightRules() {
  return `CONTEXT:\nThe attached file is the sole and authoritative source of truth.\nYou must fully analyze the entire dataset before generating output.\nOBJECTIVE:\nProduce a structured, executive-level analytical report that:\n- Automatically identifies the dataset domain\n- Extracts and computes domain-relevant key metrics\n- Prioritizes the most important performance indicators\n- Clearly separates high-impact KPIs from supporting analysis\n- Provides immediate answers to critical user questions about the dataset\nDOMAIN DETECTION:\nFirst infer the dataset type based on column names, structure, relationships, and value patterns.\nExamples:\n- Sales/Business Data → revenue, profit, margin, growth rate, top product, region contribution\n- Finance Data → expense breakdown, net position, variance, cash flow trends\n- Cricket/Sports Data → total runs, run rate, strike rate, wickets, averages\n- Inventory → turnover rate, stock concentration, shortages, top-moving items\n- User/Analytics → engagement rate, retention rate, conversion metrics\nAdapt metrics dynamically based on detected columns.\nCOLUMN-DRIVEN ANALYSIS REQUIREMENT:\n- Identify measurable numeric columns and relevant categorical fields\n- Analyze relationships between fields (e.g., product vs revenue, player vs runs)\n- Compute totals, averages, ratios, rankings, concentration %, and growth signals only when mathematically supported\n- Validate every calculation against dataset values before including it\n- Do NOT fabricate missing columns or values\n- Do NOT assume industry standards or external benchmarks\n- Preserve all metric names and numeric values exactly as derived\nPRIORITY LOGIC:\n- Highlight 3–6 PRIMARY KPIs most relevant to the inferred domain\n- Present them clearly and separately before deeper analysis\n- Rank insights by impact or contribution\n- Emphasize material differences and dominant contributors\nREPORT STRUCTURE (STRICT INSIDE MARKDOWN):\n## Executive Overview\nHigh-level explanation of dataset type, scope, and dominant performance signals.\n## Primary Key Metrics\nClearly separated high-impact KPIs:\n- Metric Name: **Value** — one-line interpretation\n- Metric Name: **Value** — one-line interpretation\nPrioritize what a user would immediately want to know.\n### Quick Insights\nGenerate 5–8 key questions a user would naturally ask after uploading this dataset.\nImmediately answer each question using precise data-derived values.\nPresent in bullet format:\n- **Subheading for the question** Answer with computed metric and brief interpretation.\n- **Subheading for the question** Answer with computed metric and brief interpretation.\nQuestions must adapt to dataset type.\nInstead of writing the complete question, write the subheading of the question.\nExamples:\n- What is total sales and total profit? [Total Sales & Profit]\n- Which product contributes the most revenue? [Product with most revenue]\n- What is the overall run rate? [Overall run rate]\n- Who has the highest strike rate? [Highest strike rate]\n- Which segment drives the largest share? [Segment with largest share]\n## Performance Highlights\n- Strength indicators\n- Growth or decline patterns\n- Category or segment comparisons\n- Use Bullet Points for better readability\n## Risk & Pattern Analysis\n- Concentration risks\n- Volatility signals\n- Structural imbalances\n- Outliers or anomalies\n- Use Bullet Points for better readability\n## Strategic Implications\nDecision-level insights strictly derived from computed data.\nUse Bullet Points for better readability\nOUTPUT FORMAT (STRICT):\n{\n  "insight": "Markdown-formatted string"\n}\nMARKDOWN REQUIREMENTS:\n- 350–450 words\n- Use only ## and ### headings (no H1)\n- Use bullet points where appropriate\n- Bold all key numeric metrics using ** **\\s\n- Maintain clean spacing and executive clarity\nSTRICT RULES:\n- Return strictly valid JSON\n- Only one key: "insight"\n- No additional keys\n- No commentary outside JSON\n- All metrics must be mathematically correct and traceable to file data\n- If a metric cannot be confidently computed, do not include it`;
}

function getInsightExample() {
  return `EXAMPLE FORMAT (STRUCTURE ONLY — DO NOT COPY CONTENT):\n{\n  "insight": "## Executive Overview\\n\\nSummary paragraph...\\n\\n### Key Drivers\\n- Insight one\\n- Insight two\\n\\n### Strategic Implications\\nConsolidated executive narrative..."\n}`;
}
