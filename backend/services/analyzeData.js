import {getZohoAccessToken} from '../lib/getZohoAccessToken.js';
import {createReport} from './createReport.js';
import {getEmbedURL} from './getEmbedURL.js';
import {uploadData} from './uploadData.js';

export const analyzeData = async (req, res) => {
  const file = req.file;

  if (!req.file) return res.status(400).json({error: 'No file received'});

  const clientId = process.env.ZOHO_ANALYTICS_CLIENT_ID;
  const clientSecret = process.env.ZOHO_ANALYTICS_CLIENT_SECRET;
  const baseUrl = process.env.ZOHO_ACCOUNT_BASE_URL;
  const accessToken = await getZohoAccessToken();

  // Upload Data to Zoho Analytics and Gets Schema
  console.log('Uploading File...');
  const uploadDataResponse = await uploadData(file);
  console.log('Upload Data Response:', uploadDataResponse);

  // Upload Schema to gemini and gets report viewIDs
  console.log('Getting Report View IDs...');
  const reportDataResponse = await createReport(uploadDataResponse);
  console.log('Report Data Response:', reportDataResponse);

  // Use viewIDs to get embed URLs
  console.log('Getting Embed URLs...');
  const embedURLsResponse = await getEmbedURL(reportDataResponse);
  console.log('Embed URLs Response:', embedURLsResponse);

  // Return Embed URLs
  console.log('Returning Embed URLs...');

  return res.json({
    success: true,
    accessToken,
    urls: embedURLsResponse,
  });
};
