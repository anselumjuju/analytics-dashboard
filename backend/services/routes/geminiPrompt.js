import {getConfig} from '../gemini/getConfigs.js';
import {validateConfig} from '../validateConfig.js';

export const geminiPrompt = async (req, res) => {
  const tableName = '';
  const tableSchema = {};

  const rawConfigs = await getConfig({tableSchema, tableName});
  const validatedConfigs = validateConfig(tableName, tableSchema, rawConfigs);

  return res.json({
    rawConfigs,
    validatedConfigs,
  });
};
