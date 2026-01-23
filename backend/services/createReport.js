// Connect with gemini and gets url for creating reports
// Uses those urls to create reports and filter their viewID
// Returns an array of viewIDs for the created reports

import {getConfig} from './getConfig.js';
import {getPrompt} from '../lib/getPrompt.js';
import {getZohoAccessToken} from '../lib/getZohoAccessToken.js';

export const createReport = async (uploadDataResponse) => {
  const mockConfigs = [
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Overall Sales Performance Over Time',
      description: 'Displays the trend of total sales aggregated by month and year to understand sales seasonality and growth.',
      reportType: 'chart',
      chartType: 'line',
      axisColumns: [
        {type: 'xAxis', columnName: 'Order Date', operation: 'monthYear'},
        {type: 'yAxis', columnName: 'Sales', operation: 'sum'},
      ],
    },
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Profitability by Product Category',
      description: 'Compares the total profit generated across different product categories to identify high-performing segments.',
      reportType: 'chart',
      chartType: 'bar',
      axisColumns: [
        {type: 'xAxis', columnName: 'Category', operation: 'actual'},
        {type: 'yAxis', columnName: 'Profit', operation: 'sum'},
      ],
    },
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Sales Distribution by Region',
      description: 'Visualizes sales volume across different geographical regions to understand market penetration.',
      reportType: 'chart',
      chartType: 'map area',
      axisColumns: [
        {type: 'colorAxis', columnName: 'Region', operation: 'actual'},
        {type: 'yAxis', columnName: 'Sales', operation: 'sum'},
      ],
    },
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Top Performing Sub-Categories by Profit',
      description: 'Identifies the sub-categories that contribute the most to overall profit.',
      reportType: 'pivot',
      axisColumns: [
        {type: 'row', columnName: 'Sub Category', operation: 'actual'},
        {type: 'column', columnName: 'Category', operation: 'actual'},
        {type: 'data', columnName: 'Profit', operation: 'sum'},
      ],
    },
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Customer Purchase Trends by Day of Week',
      description: 'Analyzes sales patterns based on the day of the week to optimize staffing or promotions.',
      reportType: 'chart',
      chartType: 'line',
      axisColumns: [
        {type: 'xAxis', columnName: 'Order Date', operation: 'weekDay'},
        {type: 'yAxis', columnName: 'Sales', operation: 'sum'},
      ],
    },
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Sales and Profit Analysis by State',
      description: 'Provides a detailed breakdown of sales and profit for each state, highlighting geographical performance differences.',
      reportType: 'pivot',
      axisColumns: [
        {type: 'row', columnName: 'State', operation: 'actual'},
        {type: 'column', columnName: 'Region', operation: 'actual'},
        {type: 'data', columnName: 'Sales', operation: 'sum'},
        {type: 'data', columnName: 'Profit', operation: 'sum'},
      ],
    },
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Impact of Discount on Profit',
      description: 'Examines the relationship between discount rates and the profit generated, to understand discounting strategies.',
      reportType: 'chart',
      chartType: 'scatter',
      axisColumns: [
        {type: 'xAxis', columnName: 'Discount', operation: 'average'},
        {type: 'yAxis', columnName: 'Profit', operation: 'sum'},
        {type: 'colorAxis', columnName: 'Category', operation: 'actual'},
      ],
    },
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Sales Performance by City',
      description: 'Shows the total sales for each city, allowing for localized performance assessment and identification of key urban markets.',
      reportType: 'chart',
      chartType: 'map bubble',
      axisColumns: [
        {type: 'colorAxis', columnName: 'City', operation: 'actual'},
        {type: 'sizeAxis', columnName: 'Sales', operation: 'sum'},
        {type: 'xAxis', columnName: 'City', operation: 'actual'},
        {type: 'yAxis', columnName: 'Sales', operation: 'sum'},
      ],
    },
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Monthly Sales Trend with Profitability Overlay',
      description: 'Combines monthly sales trends with profit margins to provide a comprehensive view of revenue and profitability over time.',
      reportType: 'chart',
      chartType: 'combo',
      axisColumns: [
        {type: 'xAxis', columnName: 'Order Date', operation: 'monthYear'},
        {type: 'yAxis', columnName: 'Sales', operation: 'sum'},
        {type: 'toolTip', columnName: 'Profit', operation: 'sum'},
      ],
    },
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Profit Margin by Sub-Category',
      description: 'Calculates and displays the profit margin for each sub-category to identify which products are most profitable relative to their sales.',
      reportType: 'chart',
      chartType: 'bar',
      axisColumns: [
        {type: 'xAxis', columnName: 'Sub Category', operation: 'actual'},
        {type: 'yAxis', columnName: 'Profit', operation: 'sum'},
        {type: 'toolTip', columnName: 'Sales', operation: 'sum'},
      ],
    },
    {
      baseTableName: 'Supermart_Grocery_Sales___Retail_Analytics_Dataset_csv_1769146801773',
      title: 'Sales and Profit Breakdown by Customer',
      description: 'Aggregates total sales and profit per customer to identify key accounts and understand customer value.',
      reportType: 'pivot',
      axisColumns: [
        {type: 'row', columnName: 'Customer Name', operation: 'actual'},
        {type: 'data', columnName: 'Sales', operation: 'sum'},
        {type: 'data', columnName: 'Profit', operation: 'sum'},
      ],
    },
  ];

  const {tableName, columnDetails} = uploadDataResponse;

  const baseURL = process.env.ZOHO_AUTH_ANALYTICS_URL;
  const accessToken = await getZohoAccessToken();
  const workspaceId = process.env.ZOHO_ANALYTICS_WORKSPACE_ID;
  const orgId = process.env.ZOHO_ANALYTICS_ORG_ID;

  const configs = await getConfig(getPrompt(columnDetails, tableName));

  const baseReportURL = `${baseURL}/restapi/v2/workspaces/${workspaceId}/reports`;

  const urls = configs.map((config) => {
    config.baseTableName = tableName;
    return `${baseReportURL}?CONFIG=${encodeURIComponent(JSON.stringify(config))}`;
  });

  const reportRequests = urls.map(async (url) => {
    console.log('\n\nurl: ', url);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'ZANALYTICS-ORGID': orgId,
        },
      });

      if (!response.ok) {
        console.error('Zoho API Error:', await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Report creation error:', error);
      return null;
    }
  });

  const reports = await Promise.all(reportRequests);

  console.log('\n\nreports: ', reports);

  const viewIds = reports.map((report) => report?.data?.viewId).filter(Boolean);

  return viewIds;
};
