import {env} from '../lib/env.js';
import {encode} from '../lib/utils.js';
import {getValidAccessToken} from './accessToken.js';

export async function createInsights(viewIds, workspaceId) {
  const baseUrl = `${env.ZOHO_AUTH_ANALYTICS_URL}/restapi/v2/workspaces/${workspaceId}/views/<view_id>/zia/insights`;

  try {
    const accessToken = await getValidAccessToken();
    const insights = [];

    for (const viewId of viewIds) {
      insights.push(await createInsight(accessToken, baseUrl, viewId));
    }

    return insights;
  } catch (error) {
    console.log(`Failed to create insights: ${error.message}`);
    return null;
  }
}

async function createInsight(accessToken, baseUrl, viewId) {
  const params = encode(JSON.stringify({responseType: 'string', insightLang: 'en', verbosity: 'medium'}));
  const url = `${baseUrl}?CONFIG=${params}`.replace('<view_id>', viewId);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'ZANALYTICS-ORGID': env.ZOHO_ANALYTICS_ORG_ID,
      },
    });

    const body = await response.json();
    if (body.status !== 'success') {
      console.log(`Failed to create insight: ${body?.data?.errorMessage || 'Unknown error'}`);
      return null;
    }

    return body?.data?.insights?.Insight || null;
  } catch (error) {
    console.log(`Failed to create insight: ${error.message}`);
    return null;
  }
}
