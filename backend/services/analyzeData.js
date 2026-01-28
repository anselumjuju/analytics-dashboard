import {createReport} from './createReport.js';
import {createWorkSpace} from './createWorkspace.js';
import {getPrivateEmbedURL} from './getEmbedURL.js';
import {uploadData} from './uploadData.js';

export const analyzeData = async (req, res) => {
  const file = req.file;
  const fileName = req.file.originalname;

  if (!req.file) return res.status(400).json({error: 'No file received'});

  console.log('\n\n\n\nFile received');
  console.log('Analyizing the file...');

  // Create a new Workspace
  const workspace = await createWorkSpace();
  if (workspace?.status !== 'success') return res.status(500).json({error: 'Workspace creation failed', details: workspace});
  console.log('Workspace created');

  // Upload Data to Zoho Analytics and Gets Schema
  const uploadDataResponse = await uploadData(file, fileName);
  if (uploadDataResponse.status !== 'success') return res.status(500).json({error: 'Data upload failed', details: uploadDataResponse});
  console.log('Data uploaded');

  // Upload Schema to gemini and gets report viewIDs
  const reportDataResponse = await createReport(uploadDataResponse);
  console.log('Reports created');

  const viewIDs = reportDataResponse.filter((id) => id !== undefined);
  if (viewIDs.length === 0) return res.status(500).json({error: 'Report creation failed', details: reportDataResponse});
  console.log(`View IDs: ${viewIDs.length}`);

  // // Use viewIDs to get embed URLs
  const embedURLs = await getPrivateEmbedURL(viewIDs);
  console.log(`Embed URLs: ${embedURLs.length}`);

  return res.json({
    success: true,
    urls: embedURLs,
  });
};
