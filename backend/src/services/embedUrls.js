import {env} from '../lib/env.js';
import {encode} from '../lib/utils.js';
import {getValidAccessToken} from './accessToken.js';

export async function createEmbedUrls(viewIds, workspaceId) {
  try {
    const accessToken = await getValidAccessToken();
    const embedUrls = [];

    for (const viewId of viewIds) {
      if (!viewId) continue;
      embedUrls.push(await createEmbedUrl(accessToken, workspaceId, viewId));
    }

    return embedUrls;
  } catch (error) {
    console.log(`Failed to create Embed Urls ${error.message}`);
    return null;
  }
}

async function createEmbedUrl(accessToken, workspaceId, viewId) {
  const permissions = {export: true, vud: true, drillDown: true, insight: true};
  const config = encode(JSON.stringify({permissions}));
  const url = `${env.ZOHO_AUTH_ANALYTICS_URL}/restapi/v2/workspaces/${workspaceId}/views/${viewId}/publish/privatelink?CONFIG=${config}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'ZANALYTICS-ORGID': env.ZOHO_ANALYTICS_ORG_ID,
      },
      body: '{}',
    });

    const body = await response.json();
    if (body.status !== 'success') {
      console.log(`Failed to create an Embed Url: ${body?.data?.errorMessage || 'Unknown error'}`);
      return null;
    }

    return String(body?.data?.privateUrl || '');
  } catch {
    return null;
  }
}
