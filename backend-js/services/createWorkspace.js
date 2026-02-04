import {getZohoAccessToken} from '../lib/getZohoAccessToken.js';
import {setWorkspaceId} from '../store/tokenStore.js';

export const createWorkSpace = async () => {
  const accessCode = await getZohoAccessToken();

  const baseURL = process.env.ZOHO_AUTH_ANALYTICS_URL;
  const orgId = process.env.ZOHO_ANALYTICS_ORG_ID;

  const uniqueId = new Date().getTime().toString();
  const workspaceName = `workspace_${uniqueId}`;

  const params = new URLSearchParams({
    CONFIG: JSON.stringify({
      workspaceName: workspaceName,
    }),
  });

  const url = `${baseURL}/restapi/v2/workspaces?${params}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessCode}`,
        'ZANALYTICS-ORGID': orgId,
      },
    });

    const data = await res.json();
    setWorkspaceId(data.data.workspaceId);

    return data;
  } catch (error) {
    console.error(error);
  }
};
