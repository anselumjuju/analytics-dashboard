export const mockConfigs = (tableName) => [
  {
    baseTableName: tableName,
    title: '2023 Sales by Category',
    description: 'Bar chart showing sales by category, filtered strictly for the year 2023.',
    reportType: 'chart',
    chartType: 'bar',
    isAxisMerge: 'false',
    axisColumns: [
      {type: 'xAxis', columnName: 'Category', operation: 'actual'},
      {type: 'yAxis', columnName: 'Sales', operation: 'sum'},
    ],
    filters: [
      {
        tableName: tableName,
        columnName: 'Order Date',
        operation: 'year',
        filterType: 'year',
        values: ['2023'],
        exclude: 'false',
      },
    ],
    userFilters: [
      {
        tableName: tableName,
        columnName: 'Region',
        operation: 'actual',
      },
    ],
  },
  {
    baseTableName: tableName,
    title: 'Profit Trend (Consumer Segment)',
    description: 'Monthly profit trend specifically for the Consumer segment.',
    reportType: 'chart',
    chartType: 'smooth line',
    isAxisMerge: 'false',
    axisColumns: [
      {type: 'xAxis', columnName: 'Order Date', operation: 'monthYear'},
      {type: 'yAxis', columnName: 'Profit', operation: 'sum'},
    ],
    filters: [
      {
        tableName: tableName,
        columnName: 'Segment',
        operation: 'actual',
        filterType: 'individualValues',
        values: ['Consumer'],
        exclude: 'false',
      },
    ],
    userFilters: [
      {
        tableName: tableName,
        columnName: 'State',
        operation: 'actual',
      },
      {
        tableName: tableName,
        columnName: 'Category',
        operation: 'actual',
      },
    ],
  },
  {
    baseTableName: tableName,
    title: 'High Value Orders Pivot',
    description: 'Pivot table of sales > 500, broken down by Region and Sub-Category.',
    reportType: 'pivot',
    isAxisMerge: 'false',
    axisColumns: [
      {type: 'row', columnName: 'Region', operation: 'actual'},
      {type: 'column', columnName: 'Sub-Category', operation: 'actual'},
      {type: 'data', columnName: 'Sales', operation: 'sum'},
    ],
    filters: [
      {
        tableName: tableName,
        columnName: 'Sales',
        operation: 'measure',
        filterType: 'range',
        values: ['500 to 100000'],
        exclude: 'false',
      },
    ],
    userFilters: [
      {
        tableName: tableName,
        columnName: 'Ship Mode',
        operation: 'actual',
      },
    ],
  },
  {
    baseTableName: tableName,
    title: 'California KPI Summary',
    description: 'Summary of Sales, Quantity, and Profit for California only.',
    reportType: 'summary',
    isAxisMerge: 'false',
    axisColumns: [
      {type: 'summarize', columnName: 'Sales', operation: 'sum'},
      {type: 'summarize', columnName: 'Quantity', operation: 'sum'},
      {type: 'summarize', columnName: 'Profit', operation: 'sum'},
    ],
    filters: [
      {
        tableName: tableName,
        columnName: 'State',
        operation: 'actual',
        filterType: 'individualValues',
        values: ['California'],
        exclude: 'false',
      },
    ],
    userFilters: [
      {
        tableName: tableName,
        columnName: 'Order Date',
        operation: 'year',
      },
    ],
  },
  {
    baseTableName: tableName,
    title: 'Exclude Furniture Sales',
    description: 'Donut chart of sales by segment, explicitly excluding Furniture.',
    reportType: 'chart',
    chartType: 'ring',
    isAxisMerge: 'false',
    axisColumns: [
      {type: 'colorAxis', columnName: 'Segment', operation: 'actual'},
      {type: 'yAxis', columnName: 'Sales', operation: 'sum'},
    ],
    filters: [
      {
        tableName: tableName,
        columnName: 'Category',
        operation: 'actual',
        filterType: 'individualValues',
        values: ['Furniture'],
        exclude: 'true',
      },
    ],
    userFilters: [
      {
        tableName: tableName,
        columnName: 'City',
        operation: 'actual',
      },
    ],
  },
  {
    baseTableName: tableName,
    title: 'West Region Map',
    description: 'Map showing profit distribution for the West region only.',
    reportType: 'chart',
    chartType: 'map filled',
    isAxisMerge: 'false',
    axisColumns: [
      {type: 'xAxis', columnName: 'State', operation: 'actual'},
      {type: 'colorAxis', columnName: 'Profit', operation: 'sum'},
    ],
    filters: [
      {
        tableName: tableName,
        columnName: 'Region',
        operation: 'actual',
        filterType: 'individualValues',
        values: ['West'],
        exclude: 'false',
      },
    ],
    userFilters: [
      {
        tableName: tableName,
        columnName: 'Sub-Category',
        operation: 'actual',
      },
    ],
  },
  {
    baseTableName: tableName,
    title: 'Top 10 Customers',
    description: 'Ranking the top 10 customers by total Sales volume.',
    reportType: 'chart',
    chartType: 'horizontal bar',
    isAxisMerge: 'false',
    axisColumns: [
      {type: 'xAxis', columnName: 'Customer Name', operation: 'actual'},
      {type: 'yAxis', columnName: 'Sales', operation: 'sum'},
    ],
    filters: [
      {
        tableName: tableName,
        columnName: 'Sales',
        operation: 'measure',
        filterType: 'ranking',
        values: ['Top 10'],
        exclude: 'false',
      },
    ],
    userFilters: [
      {
        tableName: tableName,
        columnName: 'Region',
        operation: 'actual',
      },
    ],
  },
  {
    baseTableName: tableName,
    title: 'Discounted Orders Scatter',
    description: 'Scatter plot for orders that had a discount greater than 0.',
    reportType: 'chart',
    chartType: 'scatter',
    isAxisMerge: 'false',
    axisColumns: [
      {type: 'xAxis', columnName: 'Discount', operation: 'average'},
      {type: 'yAxis', columnName: 'Profit', operation: 'sum'},
      {type: 'colorAxis', columnName: 'Category', operation: 'actual'},
    ],
    filters: [
      {
        tableName: tableName,
        columnName: 'Discount',
        operation: 'measure',
        filterType: 'range',
        values: ['0.1 to 1.0'],
        exclude: 'false',
      },
    ],
    userFilters: [
      {
        tableName: tableName,
        columnName: 'Order Date',
        operation: 'quarterYear',
      },
    ],
  },
  {
    baseTableName: tableName,
    title: 'Q4 Sales Stacked Bar',
    description: 'Stacked bar chart of sales by ship mode for Q4 (Oct, Nov, Dec).',
    reportType: 'chart',
    chartType: 'stacked bar',
    isAxisMerge: 'false',
    axisColumns: [
      {type: 'xAxis', columnName: 'Ship Mode', operation: 'actual'},
      {type: 'yAxis', columnName: 'Sales', operation: 'sum'},
      {type: 'colorAxis', columnName: 'Region', operation: 'actual'},
    ],
    filters: [
      {
        tableName: tableName,
        columnName: 'Order Date',
        operation: 'quarter',
        filterType: 'quarter',
        values: ['Q4'],
        exclude: 'false',
      },
    ],
    userFilters: [
      {
        tableName: tableName,
        columnName: 'Segment',
        operation: 'actual',
      },
    ],
  },
  {
    baseTableName: tableName,
    title: 'Recent Weekdays Heatmap',
    description: 'Heatmap filtered to a specific date range.',
    reportType: 'chart',
    chartType: 'heat map',
    isAxisMerge: 'false',
    axisColumns: [
      {type: 'xAxis', columnName: 'Order Date', operation: 'weekDay'},
      {type: 'yAxis', columnName: 'Order Date', operation: 'hour'},
      {type: 'colorAxis', columnName: 'Sales', operation: 'sum'},
    ],
    filters: [
      {
        tableName: tableName,
        columnName: 'Order Date',
        operation: 'range',
        filterType: 'dateRange',
        values: ['from 01 Jan 2023 00:00:00'],
        exclude: 'false',
      },
    ],
    userFilters: [
      {
        tableName: tableName,
        columnName: 'Category',
        operation: 'actual',
      },
    ],
  },
];
