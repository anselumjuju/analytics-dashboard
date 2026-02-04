import {askGemini} from '../../lib/gemini.js';
import {createReportSchema} from '../../lib/data.js';

export const getConfig = async ({tableSchema, tableName}) => {
  const prompt = `
      ROLE:
      You are a Senior Data Analyst, Business Intelligence Architect, and Insight Strategist.

      MISSION:
      Analyze a dataset schema like a real analytics professional.
      Infer meaning, prioritize business value, build an insight narrative,
      and generate decision-ready analytics configurations.

      You are NOT generating random charts.
      You must think critically, prioritize impact, and build story-driven reports.

      ====================================================================

      OBJECTIVE:
      Given:
      - A table schema (table name + columns + data types)
      - An analytics configuration schema

      You must:
      - Understand what the dataset represents
      - Infer the dataset domain
      - Predict stakeholder insight needs
      - Generate high-value analytical questions
      - Map questions to meaningful column comparisons
      - Select optimal chart/report types
      - Build a narrative analytics flow
      - Output ONLY the final JSON config array

      ====================================================================

      INPUTS:
      TABLE SCHEMA:
      ${JSON.stringify(tableSchema)}

      CONFIG CONTRACT (STRICT):
      ${JSON.stringify(createReportSchema)}

      TABLE NAME (IMMUTABLE):
      ${tableName}

      RULES:
      - Treat createReportSchema as a STRICT CONTRACT
      - Do NOT add, remove, or rename fields
      - Use ONLY allowed schema values
      - Use ONLY real table + column names
      - Use tableName EXACTLY as "baseTableName" in ALL configs
      - Prefer "userFilters" where interactive filtering makes sense
      - Use "filters" only when required
      - NEVER modify tableName

      ====================================================================

      CORE EXPECTATION:
      You are designing reports like a senior BI consultant.
      Each config must:
      - Deliver meaningful business insight
      - Support decision-making
      - Answer a UNIQUE business question
      - Contribute to a coherent analytics story

      This is NOT a random dashboard generator.
      This IS a structured analytics storytelling engine.

      ====================================================================

      STEP 1 — ANALYZE SCHEMA:
      - Classify columns: dimension, metric, time, identifier
      - Infer semantic meaning (revenue, cost, performance, risk, growth)
      - Identify primary vs supporting columns
      - Rank columns by analytical importance

      STEP 2 — DETECT DATASET DOMAIN:
      Infer domain (Sales, Marketing, Finance, HR, Ops, Healthcare, etc.)
      Identify stakeholders, key metrics, and high-value insight patterns.

      STEP 3 — MODEL USER INTENT:
      Predict decision-maker questions about:
      - Performance
      - Trends
      - Rankings
      - Profit vs loss
      - Growth vs decline
      - Efficiency
      - Risk
      - Opportunities

      STEP 4 — BUILD STORY FLOW:
      Create a connected narrative:
      1. Overview
      2. Performance summary
      3. Trends
      4. Top contributors
      5. Bottom performers
      6. Success drivers
      7. Loss drivers
      8. Risk signals
      9. Optimization opportunities
      10. Growth opportunities

      STEP 5 — GENERATE 7-10 INSIGHT QUESTIONS:
      Questions must:
      - Be answerable using schema
      - Provide real business value
      - Avoid trivial or redundant insights

      STEP 6 — MAP QUESTIONS TO COMPARISONS:
      - Use 2+ meaningful columns per insight
      - Choose comparison type: trend, ranking, correlation, contribution, breakdown, distribution, cause
      - Reject weak or low-signal comparisons

      STEP 7 — PRIORITIZE INSIGHTS:
      Rank insights by:
      - Business relevance
      - Actionability
      - Signal strength
      - Stakeholder value
      - Narrative importance
      Order insights by priority and story flow.

      STEP 8 — SELECT BEST VISUALIZATION:
      - Trends → Line / Area
      - Rankings → Bar
      - Comparisons → Grouped Bar
      - Correlation → Scatter
      - Contribution → Pie / Ring
      - Breakdown → Pivot / Table
      - Distribution → Histogram
      Rules:
      - Avoid repeating similar visuals
      - Prefer clarity over decoration

      STEP 9 — FILTERS STRATEGY:
      - Add filters only when they improve decisions
      - Prefer Date, Region, Category, Segment, Team
      - Avoid over-filtering
      - Prefer "userFilters" for exploration

      STEP 10 — BUILD FINAL CONFIGS:
      - Follow createReportSchema STRICTLY
      - Use ONLY valid fields and columns
      - Avoid duplicate insights
      - Maintain narrative order
      - Put the MOST IMPORTANT insight as the FIRST config
      - Minimum 10 configs required
      - Validate schema correctness before output

      ====================================================================

      STRICT OUTPUT RULES:
      - Do NOT explain reasoning
      - Do NOT output intermediate steps
      - Do NOT invent columns or tables
      - Do NOT repeat similar insights
      - Output ONLY the final JSON config array
      - Sort configs by priority and story flow

      ====================================================================

      EXAMPLE OUTPUT STYLE (FORMAT ONLY — DO NOT COPY):

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
          "filters": [
            {
              "tableName": ${tableName},
              "columnName": "Profit",
              "operation": "sum",
              "filterType": "ranking",
              "values": ["Top 10"],
              "exclude": "false"
            }
          ],
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
          "userFilters": [
            {
              "tableName": ${tableName},
              "columnName": "Category",
              "operation": "actual"
            }
          ],
          "isAxisMerge": "false"
        }
      ]

      ====================================================================

      FINAL EXPECTATION:
      Your output must feel like a senior BI consultant's analytics story.
      Guide users from:
      Overview → Performance → Trends → Drivers → Risks → Opportunities

      OUTPUT ONLY THE FINAL JSON CONFIG ARRAY.
      NO EXTRA TEXT.

  `;

  const response = await askGemini(prompt);
  const config = JSON.parse(response);
  return config.data;
};
