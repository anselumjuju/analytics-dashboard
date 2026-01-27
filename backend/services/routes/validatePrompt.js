import {uploadedDataSchema} from '../../lib/data.js';
import {validateConfig} from '../validateConfig.js';

export const validatePrompt = async (req, res) => {
  const tableName = '';
  const configs = [];

  return res.json({
    rawConfigs: configs,
    validatedConfigs: validateConfig(tableName, uploadedDataSchema, configs),
  });
};
