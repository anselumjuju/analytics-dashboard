// Uploads the data to the Zoho Analytics Workspace via API
// Uses the Workspace ID and orgId from env variables
// Returns the table schema

import {getZohoAccessToken} from '../lib/getZohoAccessToken.js';

export const uploadData = async (file, fileName) => {
  const baseURL = process.env.ZOHO_AUTH_ANALYTICS_URL;
  const accessToken = await getZohoAccessToken();
  const workspaceId = process.env.ZOHO_ANALYTICS_WORKSPACE_ID;
  const orgId = process.env.ZOHO_ANALYTICS_ORG_ID;

  const uniqueId = new Date().getTime();
  const tableName = `${fileName.replaceAll(/[^a-zA-Z0-9]/g, '_')}_${uniqueId}`;

  const params = new URLSearchParams({
    CONFIG: JSON.stringify({
      tableName,
      fileType: 'csv',
      autoIdentify: 'true',
    }),
  });

  const url = `${baseURL}/restapi/v2/workspaces/${workspaceId}/data?${params}`;

  try {
    const formData = new FormData();

    const blob = new Blob([file.buffer], {type: 'text/csv'});
    formData.append('FILE', blob, fileName);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'ZANALYTICS-ORGID': orgId,
      },
      body: formData,
    });

    const res = await response.json();
    return {status: 'success', data: {tableName: tableName, ...res.data}};
  } catch (error) {
    console.error('Upload data error:', error);
    return null;
  }
};
