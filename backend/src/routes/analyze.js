import {sendError} from '../lib/utils.js';
import {createWorkspace} from '../services/workspaces.js';
import {uploadFile} from '../services/dataUpload.js';
import {getConfigs, getInsight} from '../services/gemini.js';
import {createReports} from '../services/reports.js';
import {createEmbedUrls} from '../services/embedUrls.js';
import {createInsights} from '../services/insights.js';
import {sendProgress} from '../services/progressSocket.js';

export async function analyzeRoute(req, res) {
  const jobId = req.query.jobId;
  if (!jobId || String(jobId).trim().length === 0) return sendError(res, 400, 'Insufficient Parameters passed');

  const file = req.file;
  if (!file) return sendError(res, 400, 'No file uploaded');

  sendProgress(jobId, 10, 'Getting things ready...');
  const workspaceId = await createWorkspace();
  if (!workspaceId) return sendError(res, 500, 'Failed to create workspace');

  const uploadResponse = await uploadFile(file, workspaceId);
  if (!uploadResponse) return sendError(res, 400, 'Failed to upload file');

  sendProgress(jobId, 20, 'Analyzing your report...');
  const geminiResponse = await getConfigs(uploadResponse, jobId, sendProgress);
  if (!geminiResponse || !geminiResponse.configs) return sendError(res, 400, 'Failed to load configs');

  const {reportHeading, reportDescription, configs} = geminiResponse;

  sendProgress(jobId, 55, 'Designing your dashboard');
  const viewIds = await createReports(configs, workspaceId);
  if (!viewIds || viewIds.length === 0) return sendError(res, 400, 'Failed to create Reports');

  for (let i = viewIds.length - 1; i >= 0; i--) {
    if (viewIds[i] == null) {
      configs.splice(i, 1);
      viewIds.splice(i, 1);
    }
  }

  if (viewIds.length === 0) return sendError(res, 400, 'Failed to create Reports');

  sendProgress(jobId, 75, 'Finalizing your dashboard');
  const embedUrls = await createEmbedUrls(viewIds, workspaceId);
  if (!embedUrls || embedUrls.length === 0) return sendError(res, 400, 'Failed to create Embed URLs');

  for (let i = embedUrls.length - 1; i >= 0; i--) {
    if (embedUrls[i] == null) {
      configs.splice(i, 1);
      viewIds.splice(i, 1);
      embedUrls.splice(i, 1);
    }
  }

  if (embedUrls.length === 0) return sendError(res, 400, 'Failed to create Embed URLs');

  for (let i = 0; i < embedUrls.length; i++) configs[i].embedUrl = embedUrls[i];

  sendProgress(jobId, 80, 'Getting insights...');
  const reportInsights = await createInsights(viewIds, workspaceId);

  const tableSchema = uploadResponse.tableSchema;
  const reportInsight = await getInsight(tableSchema, reportInsights);

  sendProgress(jobId, 93, 'Your dashboard is ready!');
  res.status(200).json({
    success: true,
    status: 200,
    data: {
      message: 'Analysis completed',
      reportHeading,
      reportDescription,
      urls: embedUrls,
      configs,
      insights: {
        reportInsights,
        reportInsight,
      },
    },
  });
}
