export const createReportSchema = {
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

export const mockConfigs = (tableName) => {
  return [
    {
      baseTableName: tableName,
      title: 'Overall Sales & Profit Trends by Month',
      description: 'Analyzes the monthly performance of total sales and profit, highlighting growth, decline, and seasonal patterns for executive overview.',
      reportType: 'chart',
      chartType: 'combo',
      axisColumns: [
        {
          type: 'xAxis',
          columnName: 'Order Date',
          operation: 'monthYear',
        },
        {
          type: 'yAxis',
          columnName: 'Sales',
          operation: 'sum',
        },
        {
          type: 'yAxis',
          columnName: 'Profit',
          operation: 'sum',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Segment',
          operation: 'actual',
        },
        {
          tableName: tableName,
          columnName: 'Category',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
    {
      baseTableName: tableName,
      title: 'Sales Performance by State',
      description: 'Visualizes total sales contribution from each state, identifying key geographical markets and areas needing strategic attention or investment.',
      reportType: 'chart',
      chartType: 'map filled',
      axisColumns: [
        {
          type: 'xAxis',
          columnName: 'State',
          operation: 'actual',
        },
        {
          type: 'yAxis',
          columnName: 'Sales',
          operation: 'sum',
        },
        {
          type: 'toolTip',
          columnName: 'Profit',
          operation: 'sum',
        },
        {
          type: 'toolTip',
          columnName: 'Order ID',
          operation: 'distinctCount',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Category',
          operation: 'actual',
        },
        {
          tableName: tableName,
          columnName: 'Region',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
    {
      baseTableName: tableName,
      title: 'Profitability Breakdown by Product Category and Sub-Category',
      description:
        'Provides a detailed pivot view of profit, sales, and order volume across product categories and their sub-categories, identifying core profitable areas and potential loss leaders.',
      reportType: 'pivot',
      axisColumns: [
        {
          type: 'row',
          columnName: 'Category',
          operation: 'actual',
        },
        {
          type: 'row',
          columnName: 'Sub-Category',
          operation: 'actual',
        },
        {
          type: 'data',
          columnName: 'Profit',
          operation: 'sum',
        },
        {
          type: 'data',
          columnName: 'Sales',
          operation: 'sum',
        },
        {
          type: 'data',
          columnName: 'Order ID',
          operation: 'distinctCount',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Region',
          operation: 'actual',
        },
        {
          tableName: tableName,
          columnName: 'Segment',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
    {
      baseTableName: tableName,
      title: 'Top 10 Most Profitable Products',
      description: 'Identifies the top 10 products contributing highest to the overall profit margin, guiding inventory, marketing, and sales strategies.',
      reportType: 'chart',
      chartType: 'horizontal bar',
      axisColumns: [
        {
          type: 'xAxis',
          columnName: 'Product Name',
          operation: 'actual',
        },
        {
          type: 'yAxis',
          columnName: 'Profit',
          operation: 'sum',
        },
      ],
      filters: [
        {
          tableName: tableName,
          columnName: 'Profit',
          operation: 'sum',
          filterType: 'ranking',
          values: ['Top 10'],
          exclude: 'false',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Category',
          operation: 'actual',
        },
        {
          tableName: tableName,
          columnName: 'Segment',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
    {
      baseTableName: tableName,
      title: 'Customer Segment Sales Contribution Over Time',
      description:
        'Illustrates the historical sales performance of different customer segments, showing their changing contribution to total revenue and identifying growth or decline trends.',
      reportType: 'chart',
      chartType: 'stacked area',
      axisColumns: [
        {
          type: 'xAxis',
          columnName: 'Order Date',
          operation: 'monthYear',
        },
        {
          type: 'yAxis',
          columnName: 'Sales',
          operation: 'sum',
        },
        {
          type: 'colorAxis',
          columnName: 'Segment',
          operation: 'actual',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Region',
          operation: 'actual',
        },
        {
          tableName: tableName,
          columnName: 'Category',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
    {
      baseTableName: tableName,
      title: 'Impact of Discount on Profit by Category',
      description:
        'Examines the correlation between average discount percentages and total profit, segmented by product category, to identify effective and detrimental discounting strategies and their financial risks.',
      reportType: 'chart',
      chartType: 'scatter',
      axisColumns: [
        {
          type: 'xAxis',
          columnName: 'Discount',
          operation: 'average',
        },
        {
          type: 'yAxis',
          columnName: 'Profit',
          operation: 'sum',
        },
        {
          type: 'colorAxis',
          columnName: 'Category',
          operation: 'actual',
        },
        {
          type: 'toolTip',
          columnName: 'Product Name',
          operation: 'distinctCount',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Region',
          operation: 'actual',
        },
        {
          tableName: tableName,
          columnName: 'Segment',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
    {
      baseTableName: tableName,
      title: 'Products with Negative Profit Contribution',
      description:
        'Lists specific products that have consistently generated negative profit, indicating areas of financial leakage and requiring immediate review for pricing or cost adjustments.',
      reportType: 'summary',
      axisColumns: [
        {
          type: 'groupBy',
          columnName: 'Product Name',
          operation: 'actual',
        },
        {
          type: 'summarize',
          columnName: 'Profit',
          operation: 'sum',
        },
        {
          type: 'summarize',
          columnName: 'Sales',
          operation: 'sum',
        },
        {
          type: 'summarize',
          columnName: 'Quantity',
          operation: 'sum',
        },
      ],
      filters: [
        {
          tableName: tableName,
          columnName: 'Profit',
          operation: 'sum',
          filterType: 'range',
          values: ['-Infinity to -0.01'],
          exclude: 'false',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Category',
          operation: 'actual',
        },
        {
          tableName: tableName,
          columnName: 'Region',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
    {
      baseTableName: tableName,
      title: 'Average Profit per Order by Ship Mode',
      description:
        'Compares the average profit generated per order across different shipping modes to assess their financial efficiency and identify potential operational improvements.',
      reportType: 'chart',
      chartType: 'bar',
      axisColumns: [
        {
          type: 'xAxis',
          columnName: 'Ship Mode',
          operation: 'actual',
        },
        {
          type: 'yAxis',
          columnName: 'Profit',
          operation: 'average',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Category',
          operation: 'actual',
        },
        {
          tableName: tableName,
          columnName: 'Segment',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
    {
      baseTableName: tableName,
      title: 'Monthly Order Volume by Year (Seasonality Analysis)',
      description:
        'Analyzes the number of unique orders placed each month across different years, revealing crucial seasonality patterns and year-over-year growth in order volume for operational planning.',
      reportType: 'pivot',
      axisColumns: [
        {
          type: 'row',
          columnName: 'Order Date',
          operation: 'month',
        },
        {
          type: 'column',
          columnName: 'Order Date',
          operation: 'year',
        },
        {
          type: 'data',
          columnName: 'Order ID',
          operation: 'distinctCount',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Region',
          operation: 'actual',
        },
        {
          tableName: tableName,
          columnName: 'Segment',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
    {
      baseTableName: tableName,
      title: 'Sales, Quantity, and Discount Relationship by Sub-Category',
      description:
        'Explores the interplay between average discount, total quantity sold, and total sales for each sub-category, providing insights into pricing strategy effectiveness and product demand.',
      reportType: 'chart',
      chartType: 'bubble',
      axisColumns: [
        {
          type: 'xAxis',
          columnName: 'Discount',
          operation: 'average',
        },
        {
          type: 'yAxis',
          columnName: 'Quantity',
          operation: 'sum',
        },
        {
          type: 'colorAxis',
          columnName: 'Sub-Category',
          operation: 'actual',
        },
        {
          type: 'textAxis',
          columnName: 'Sales',
          operation: 'sum',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Category',
          operation: 'actual',
        },
        {
          tableName: tableName,
          columnName: 'Region',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
    {
      baseTableName: tableName,
      title: 'Sales Contribution by Region and Customer Segment',
      description:
        'Analyzes total sales contribution broken down by geographical region and customer segment, identifying key markets and growth opportunities for each customer group.',
      reportType: 'pivot',
      axisColumns: [
        {
          type: 'row',
          columnName: 'Region',
          operation: 'actual',
        },
        {
          type: 'column',
          columnName: 'Segment',
          operation: 'actual',
        },
        {
          type: 'data',
          columnName: 'Sales',
          operation: 'sum',
        },
      ],
      userFilters: [
        {
          tableName: tableName,
          columnName: 'Category',
          operation: 'actual',
        },
      ],
      isAxisMerge: 'false',
    },
  ];
};

export const uploadedDataSchema = {
  'Row ID': 'Positive Number',
  'Order ID': 'Plain Text',
  'Order Date': 'Date',
  'Ship Date': 'Date',
  'Ship Mode': 'Plain Text',
  'Customer ID': 'Plain Text',
  'Customer Name': 'Plain Text',
  Segment: 'Plain Text',
  Country: 'Geo column',
  City: 'Plain Text',
  State: 'Geo column',
  'Postal Code': 'Positive Number',
  Region: 'Plain Text',
  'Product ID': 'Plain Text',
  Category: 'Plain Text',
  'Sub-Category': 'Plain Text',
  'Product Name': 'Plain Text',
  Sales: 'Decimal Number',
  Quantity: 'Positive Number',
  Discount: 'Decimal Number',
  Profit: 'Decimal Number',
};
