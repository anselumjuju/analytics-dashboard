import {createReportSchema} from '../lib/data.js';

export const validateConfig = (tableName, uploadedDataSchema, configs) => {
  const columns = Object.keys(uploadedDataSchema);
  const validConfigKeys = Object.keys(createReportSchema);

  // Remove unknown keys
  configs.map((config) => {
    Object.keys(config).map((key) => {
      if (!validConfigKeys.includes(key)) delete config[key];
    });
  });

  // Validate tableNames
  configs.map((config) => {
    config.baseTableName = tableName;
    if ('filters' in config && config.filters)
      config.filters.map((filter) => {
        filter.tableName = tableName;
      });
    if ('userFilters' in config && config.userFilters)
      config.userFilters.map((filter) => {
        filter.tableName = tableName;
      });
  });

  // Validate Column names
  configs.map((config) => {
    if ('axisColumns' in config && config.axisColumns) {
      config.axisColumns.map((axisColumn) => {
        axisColumn.columnName = resolveFromAllowed(axisColumn.columnName, columns, 0.6);
      });
    }
    if ('filters' in config && config.filters) {
      config.filters.map((filter) => {
        filter.columnName = resolveFromAllowed(filter.columnName, columns, 0.6);
      });
    }
    if ('userFilters' in config && config.userFilters) {
      config.userFilters.map((filter) => {
        filter.columnName = resolveFromAllowed(filter.columnName, columns, 0.6);
      });
    }
  });

  // Validte report type
  const validReportTypes = createReportSchema.reportType.allowedValues;
  configs.map((config) => {
    config.reportType = resolveFromAllowed(config.reportType, validReportTypes) || 'chart';
  });

  // Validate chart types
  const validChartTypes = Object.values(createReportSchema.chartType.allowedValues).flat();
  configs.map((config) => {
    if (config.reportType === 'chart') {
      config.chartType = !('chartType' in config) ? 'bar' : (config.chartType = resolveFromAllowed(config.chartType, validChartTypes) || 'bar');
    }
  });

  // Validate axis columns
  const validAxisColumnsType = createReportSchema.axisColumns.structure.type.allowedValuesByReportType;
  const validAxisColumnsOperations = Object.values(createReportSchema.axisColumns.structure.operation.allowedValuesByDataType).flat();
  configs.map((config) => {
    config.axisColumns.map((axisColumn) => {
      const validAxisColumnsByReportType = validAxisColumnsType[config.reportType];
      axisColumn.type = resolveFromAllowed(axisColumn.type, validAxisColumnsByReportType) || validAxisColumnsByReportType[0];
      axisColumn.operation = resolveFromAllowed(axisColumn.operation, validAxisColumnsOperations) || validAxisColumnsOperations[0];
    });
  });

  // Validate filters
  const validFilterOperations = Object.values(createReportSchema.filters.structure.operation.allowedValuesByDataType).flat();
  const validFilterTypes = createReportSchema.filters.structure.filterType.allowedValues;
  configs.map((config) => {
    if (!('filters' in config)) return;
    config.filters.map((filter) => {
      filter.operation = resolveFromAllowed(filter.operation, validFilterOperations) || validFilterOperations[0];
      filter.filterType = resolveFromAllowed(filter.filterType, validFilterTypes) || validFilterTypes[0];
      filter.exclude = filter.exclude == 'true' || filter.exclude == 'false' ? filter.exclude : 'false';
    });
  });

  // Validate user filters
  const validUserFilterOperations = Object.values(createReportSchema.userFilters.structure.operation.allowedValuesByDataType).flat();
  configs.map((config) => {
    if (!('userFilters' in config)) return;
    config.userFilters.map((filter) => {
      filter.operation = resolveFromAllowed(filter.operation, validUserFilterOperations) || validUserFilterOperations[0];
    });
  });

  // Validate isAxisMerge
  configs.map((config) => {
    config.isAxisMerge = config.isAxisMerge == 'true' || config.isAxisMerge == 'false' ? config.isAxisMerge : 'false';
  });

  // Validate mergeAxisInfo
  configs.map((config) => {
    config.mergeAxisInfo = config.isAxisMerge == 'true' ? config.mergeAxisInfo : null;
    if (config.mergeAxisInfo == null) delete config.mergeAxisInfo;
  });

  // Since some values for userFilter operations is not working
  // If userFilter is with columnType Date, remove the userFilter
  let userFiltersRemoved = 0;
  configs = configs.map((config) => {
    if ('userFilters' in config && config.userFilters) {
      config.userFilters = config.userFilters.filter((userFilter) => {
        if (['actual', 'seasonal', 'relative'].includes(userFilter.operation)) {
          const dataType = uploadedDataSchema[userFilter.columnName];
          if (dataType == 'Date') {
            userFiltersRemoved++;
            return false;
          }
        }
        return true;
      });
    }
    return config;
  });
  if (userFiltersRemoved > 0) console.log(`Removed ${userFiltersRemoved} userFilters for invalid operations`);

  // Validate important fields
  const impBaseFields = ['baseTableName', 'title', 'reportType', 'axisColumns'];
  const impAxisFields = ['type', 'operation', 'columnName'];
  const impFilterFields = ['tableName', 'columnName', 'operation', 'filterType', 'values', 'exclude'];
  const impUserFilterFields = ['tableName', 'columnName', 'operation'];

  configs = configs.filter((config) => {
    impBaseFields.map((impBaseField) => {
      if (impBaseField in config && config[impBaseField] == null) delete config[impBaseField];
      if (!(impBaseField in config)) {
        return false;
      }
    });

    config.axisColumns.map((axisColumn) => {
      impAxisFields.map((impAxisField) => {
        if (impAxisField in axisColumn && axisColumn[impAxisField] == null) delete axisColumn[impAxisField];
        if (!(impAxisField in axisColumn)) {
          return false;
        }
      });
    });

    if ('filters' in config) {
      config.filters.map((filter) => {
        impFilterFields.map((impFilterField) => {
          if (impFilterField in filter && filter[impFilterField] == null) delete filter[impFilterField];
          if (!(impFilterField in filter)) {
            return false;
          }
        });
      });
    }

    if ('userFilters' in config) {
      config.userFilters.map((filter) => {
        impUserFilterFields.map((impUserFilterField) => {
          if (impUserFilterField in filter && filter[impUserFilterField] == null) delete filter[impUserFilterField];
          if (!(impUserFilterField in filter)) {
            return false;
          }
        });
      });
    }

    if (config.reportType == 'chart' && !('chartType' in config)) return false;
    if (config.isAxisMerge == 'true' && !('mergeAxisInfo' in config)) return false;
    return true;
  });

  return configs;
};

function resolveFromAllowed(input, allowedValues, threshold = 0.8) {
  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[\s_-]/g, '')
      .replace(/[^\w]/g, '')
      .trim();

  const levenshtein = (a, b) => {
    const dp = Array.from({length: a.length + 1}, () => new Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[a.length][b.length];
  };

  const similarity = (a, b) => 1 - levenshtein(a, b) / Math.max(a.length, b.length);

  const inputNorm = normalize(input);

  let best = null;
  let bestScore = 0;

  for (const value of allowedValues) {
    const score = similarity(inputNorm, normalize(value));
    if (score > bestScore) {
      bestScore = score;
      best = value;
    }
  }

  return bestScore >= threshold ? best : null;
}
