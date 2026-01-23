import {GoogleGenerativeAI} from '@google/generative-ai';

export async function askGemini(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
  });
  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  const jsonText = text.replaceAll('```json', '').replaceAll('```', '');
  const configs = `{"data": ${jsonText}}`;

  return configs;
}
