import {askGemini} from '../lib/gemini.js';

export const getConfig = async (prompt) => {
  const response = await askGemini(prompt);
  const config = JSON.parse(response);
  return config.data;
};
