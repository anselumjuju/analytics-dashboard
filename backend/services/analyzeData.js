import {createReport} from './createReport.js';
import {getPrivateEmbedURL} from './getEmbedURL.js';
import {uploadData} from './uploadData.js';

export const analyzeData = async (req, res) => {
  const file = req.file;
  const fileName = req.file.originalname;

  if (!req.file) return res.status(400).json({error: 'No file received'});

  // Upload Data to Zoho Analytics and Gets Schema
  const uploadDataResponse = await uploadData(file, fileName);

  if (uploadDataResponse.status !== 'success') return res.status(500).json({error: 'Data upload failed', details: uploadDataResponse});

  // Upload Schema to gemini and gets report viewIDs
  const reportDataResponse = await createReport(uploadDataResponse.data);
  const viewIDs = reportDataResponse.filter((id) => id !== undefined);

  if (viewIDs.length === 0) return res.status(500).json({error: 'Report creation failed', details: reportDataResponse});

  // // Use viewIDs to get embed URLs
  const embedURLs = await getPrivateEmbedURL(viewIDs);

  return res.json({
    success: true,
    urls: embedURLs,
  });
};
