import {env} from '../lib/env.js';
import {encode} from '../lib/utils.js';
import {getValidAccessToken} from './accessToken.js';

export async function createReports(configs, workspaceId) {
  const baseUrl = `${env.ZOHO_AUTH_ANALYTICS_URL}/restapi/v2/workspaces/${workspaceId}/reports?CONFIG=`;

  try {
    const accessToken = await getValidAccessToken();
    return await Promise.all(configs.map(async (config) => createReport(accessToken, baseUrl, config)));
  } catch (error) {
    console.log(`Failed to create reports: ${error.message}`);
    return null;
  }
}

async function createReport(accessToken, baseUrl, config) {
  try {
    const configString = encode(JSON.stringify(config));
    const response = await fetch(`${baseUrl}${configString}`, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'ZANALYTICS-ORGID': env.ZOHO_ANALYTICS_ORG_ID,
      },
      body: configString,
    });

    const body = await response.json();
    if (body.status !== 'success') {
      console.log(`Failed to create report: ${body?.data?.errorMessage || 'Unknown error'}`);
      return null;
    }

    return String(body?.data?.viewId || '');
  } catch {
    return null;
  }
}
