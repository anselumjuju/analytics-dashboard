import {resolveFromAllowed} from './allowedValueResolver.js';

export function validateConfigs(tableName, tableSchema, configs) {
  try {
    const validKeys = new Set(['baseTableName', 'title', 'description', 'reportType', 'chartType', 'axisColumns', 'filters', 'userFilters', 'isAxisMerge', 'mergeAxisInfo']);
    const validReportTypes = ['chart', 'pivot', 'summary'];
    const validChartTypes = [
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
      'bar',
      'horizontal bar',
      'stacked bar',
      'horizontal stacked bar',
      'bubble',
      'packed bubble',
      'combo',
      'combo bar with smooth line',
      'funnel',
      'pyramid',
      'line',
      'line with points',
      'line without points',
      'smooth line',
      'smooth line with points',
      'smooth line without points',
      'step',
      'map area',
      'map bubble',
      'map filled',
      'map pie',
      'map pie bubble',
      'map bubble pie',
      'map scatter',
      'geo heat map',
      'pie',
      'ring',
      'semi pie',
      'semi ring',
      'scatter',
      'web',
      'web with fill',
      'web without fill',
      'heat map',
      'butterfly',
      'table chart',
    ];
    const validAxisColumnOperations = [
      'year',
      'quarterYear',
      'monthYear',
      'weekYear',
      'fullDate',
      'dateTime',
      'range',
      'quarter',
      'month',
      'week',
      'weekDay',
      'day',
      'hour',
      'count',
      'distinctCount',
      'measure',
      'dimension',
      'range',
      'sum',
      'min',
      'max',
      'average',
      'stdDev',
      'median',
      'mode',
      'count',
      'variance',
      'distinctCount',
      'actual',
      'count',
      'distinctCount',
    ];
    const validFilterOperations = [
      'actual',
      'seasonal',
      'relative',
      'measure',
      'dimension',
      'range',
      'actual',
      'sum',
      'min',
      'max',
      'average',
      'stdDev',
      'median',
      'mode',
      'count',
      'variance',
      'distinctCount',
      'actual',
      'count',
      'distinctCount',
    ];
    const validFilterTypes = [
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
    ];
    const validColumnNames = Object.keys(tableSchema || {});
    const invalidOperations = new Set(['actual', 'seasonal', 'relative']);

    for (const config of configs || []) {
      for (const key of Object.keys(config)) {
        if (!validKeys.has(key)) delete config[key];
      }

      config.baseTableName = tableName;
      for (const filter of config.filters || []) filter.tableName = tableName;
      for (const userFilter of config.userFilters || []) userFilter.tableName = tableName;
    }

    for (const config of configs || []) {
      for (const axisColumn of config.axisColumns || []) {
        if (!validColumnNames.includes(axisColumn.columnName)) axisColumn.columnName = resolveFromAllowed(axisColumn.columnName, validColumnNames);
      }
      for (const filter of config.filters || []) {
        if (!validColumnNames.includes(filter.columnName)) filter.columnName = resolveFromAllowed(filter.columnName, validColumnNames);
      }
      for (const userFilter of config.userFilters || []) {
        if (!validColumnNames.includes(userFilter.columnName)) userFilter.columnName = resolveFromAllowed(userFilter.columnName, validColumnNames);
      }
    }

    for (const config of configs || []) {
      if (!validReportTypes.includes(config.reportType)) config.reportType = resolveFromAllowed(config.reportType, validReportTypes);
      if (config.reportType === 'chart') config.chartType = resolveFromAllowed(config.chartType, validChartTypes);
    }

    for (const config of configs || []) {
      const validTypes =
        config.reportType === 'chart' ? ['xAxis', 'yAxis', 'textAxis', 'colorAxis', 'toolTip']
        : config.reportType === 'pivot' ? ['row', 'column', 'data']
        : ['groupBy', 'summarize'];
      for (const axisColumn of config.axisColumns || []) {
        axisColumn.type = resolveFromAllowed(axisColumn.type, validTypes);
        axisColumn.operation = resolveFromAllowed(axisColumn.operation, validAxisColumnOperations);
      }
      for (const filter of config.filters || []) {
        filter.operation = resolveFromAllowed(filter.operation, validFilterOperations);
        filter.filterType = resolveFromAllowed(filter.filterType, validFilterTypes);
      }
      for (const userFilter of config.userFilters || []) {
        userFilter.operation = resolveFromAllowed(userFilter.operation, validFilterOperations);
      }
      config.isAxisMerge = config.isAxisMerge || 'false';
    }

    const validConfigs = [];
    for (const config of configs || []) {
      if (!config.baseTableName || !config.title || !config.reportType || !config.axisColumns) continue;

      config.axisColumns = (config.axisColumns || []).filter((axisColumn) => axisColumn.type && axisColumn.operation && axisColumn.columnName);
      if (config.filters)
        config.filters = config.filters.filter((filter) => filter.tableName && filter.columnName && filter.operation && filter.filterType && filter.values && filter.exclude);
      if (config.userFilters) config.userFilters = config.userFilters.filter((userFilter) => userFilter.tableName && userFilter.columnName && userFilter.operation);

      if (config.userFilters) {
        config.userFilters = config.userFilters.filter((userFilter) => {
          const columnType = tableSchema?.[userFilter.columnName];
          return !(columnType === 'Date' && invalidOperations.has(userFilter.operation));
        });
      }

      validConfigs.push(config);
    }

    return validConfigs;
  } catch (error) {
    console.log(`Error validating configs: ${error.message}`);
    return null;
  }
}
