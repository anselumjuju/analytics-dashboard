import {uploadedDataSchema} from '../../lib/data.js';
import {getConfig} from '../gemini/getConfigs.js';
import {validateConfig} from '../validateConfig.js';

export const geminiPrompt = async (req, res) => {
  const tableName = 'Supermarket_Sales_Data';
  const tableSchema = uploadedDataSchema;

  const rawConfigs = await getConfig({tableSchema, tableName});
  const validatedConfigs = validateConfig(tableName, tableSchema, rawConfigs);

  return res.json({
    rawConfigs,
    validatedConfigs,
  });
};
