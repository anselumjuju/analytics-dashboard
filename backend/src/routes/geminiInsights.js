import {env} from '../lib/env.js';
import {sendError} from '../lib/utils.js';
import {GoogleGenAI} from '@google/genai';

export async function geminiInsightsRoute(req, res) {
  const file = req.file;
  if (!file) return sendError(res, 400, 'No file uploaded');
  if (!file.buffer || file.size === 0) return sendError(res, 400, 'Empty file');

  try {
    const text = await generateGeminiInsight(file);
    const cleanedJson = text.replaceAll('```json', '').replaceAll('```', '').trim();
    const responseBody = JSON.parse(cleanedJson);

    res.status(200).json({
      success: true,
      status: 200,
      data: {
        message: 'Insight generated successfully',
        insight: responseBody.insight,
      },
    });
  } catch (error) {
    console.log(`Error getting gemini insights ${error.message}`);
    sendError(res, 500, 'Failed to get gemini insights');
  }
}

async function generateGeminiInsight(file) {
  const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
  });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',

    contents: [
      {
        text: getPrompt(),
      },
      {
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString('base64'),
        },
      },
    ],

    config: {
      systemInstruction: getSystemInstruction(),

      responseMimeType: 'application/json',
    },
  });

  return response.text;
}

function getPrompt() {
  return `ROLE:\nYou are a Senior Business Intelligence Analyst specializing in structured data analysis and executive reporting.\nOBJECTIVE:\nAnalyze the provided dataset thoroughly and produce high-impact, decision-ready insights.\nANALYTICAL STANDARDS:\n- Base all conclusions strictly on the file contents\n- Derive calculations only when mathematically supported\n- Highlight measurable performance drivers and risk indicators\n- Prioritize material findings over descriptive summaries\nCONSTRAINTS:\n- Output strictly valid JSON\n- Do not fabricate data or assume missing values\n- Preserve all numerical values exactly as provided\n- No commentary outside the required JSON structure`;
}

function getSystemInstruction() {
  return getPrompt();
}
