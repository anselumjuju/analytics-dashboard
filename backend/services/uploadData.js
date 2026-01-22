// Uploads the data to the Zoho Analytics Workspace via API
// Uses the Workspace ID and orgId from env variables
// Returns the table schema

import {getZohoAccessToken} from '../lib/getZohoAccessToken.js';

export const uploadData = async (file) => {
  const baseURL = process.env.ZOHO_AUTH_ANALYTICS_URL;
  const accessToken = await getZohoAccessToken();
  const workspaceId = process.env.ZOHO_ANALYTICS_WORKSPACE_ID;
  const orgId = process.env.ZOHO_ANALYTICS_ORG_ID;

  const params = new URLSearchParams({
    config: JSON.stringify({
      tableName: req.params.tableName + new Date().getTime().toString().slice(0, 8),
      fileType: 'csv',
      autoIdentify: true,
    }),
  });

  const url = `${baseURL}/restapi/v2/workspaces/${workspaceId}/data/${tableName}/data?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'ZANALYTICS-ORG-ID': orgId,
      },
      body: JSON.stringify(file),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Upload data error:', error);
    return null;
  }
};
