export function reportConfigSchema() {
  return `{
  "baseTableName": {type: 'String', required: true, description: 'Name of the base table used to create report'},
  title: {type: 'String', required: true, description: 'Name of the report'},
  description: {type: 'String', required: false, description: 'Description of the report'},
  reportType: {type: 'String', required: true, allowedValues: ['chart', 'pivot', 'summary']},
  chartType: {
    type: 'String',
    requiredIf: "reportType == 'chart'",
    allowedValues: {
      areaCharts: ['area','area with points','area without points','smooth area','smooth area with points','smooth area without points','stacked area','stacked area with points','stacked smooth area','stacked smooth area with points','stacked smooth area without points'],
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
  axisColumns: { type: 'JSONArray', required: true },
  filters: { type: 'JSONArray', required: false },
  userFilters: { type: 'JSONArray', required: false },
  isAxisMerge: {type: 'String', required: false, allowedValues: ['true', 'false']},
  mergeAxisInfo: {type: 'String', requiredIf: 'isAxisMerge == true', formatExample: {axisIndex: [2, 3], labelName: 'Merge_axis'}},
}`;
}
