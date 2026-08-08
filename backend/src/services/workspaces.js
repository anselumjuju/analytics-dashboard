import {env} from '../lib/env.js';
import {encode} from '../lib/utils.js';
import {getValidAccessToken} from './accessToken.js';

export async function createWorkspace() {
  const uniqueId = crypto.randomUUID().replaceAll('-', '').slice(0, 5);
  const uniqueTimestamp = String(Date.now());
  const workspaceName = `workspace_${uniqueId}_${uniqueTimestamp}`;
  const params = encode(JSON.stringify({workspaceName}));
  const url = `${env.ZOHO_AUTH_ANALYTICS_URL}/restapi/v2/workspaces?CONFIG=${params}`;

  try {
    const accessToken = await getValidAccessToken();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'ZANALYTICS-ORGID': env.ZOHO_ANALYTICS_ORG_ID,
      },
    });

    const body = await response.json();
    if (body.status !== 'success') {
      console.log(`Error creating workspace: ${body?.data?.errorMessage || 'Unknown error'}`);
      return null;
    }

    return body?.data?.workspaceId || null;
  } catch (error) {
    console.log(`Error creating workspace: ${error.message}`);
    return null;
  }
}

export async function getAllOwnedWorkspaces() {
  const url = `${env.ZOHO_AUTH_ANALYTICS_URL}/restapi/v2/workspaces`;

  try {
    const accessToken = await getValidAccessToken();
    const response = await fetch(url, {headers: {Authorization: `Zoho-oauthtoken ${accessToken}`}});
    if (response.status !== 200) return null;

    const body = await response.json();
    if (body.status !== 'success') return null;

    const ownedWorkspaces = body?.data?.ownedWorkspaces || [];
    return ownedWorkspaces
      .filter((workspace) => typeof workspace.workspaceName === 'string' && workspace.workspaceName.startsWith('workspace_'))
      .map((workspace) => workspace.workspaceId)
      .filter(Boolean);
  } catch (error) {
    console.log(`Error fetching workspaces: ${error.message}`);
    return null;
  }
}

export async function deleteWorkspaces() {
  const workspaces = await getAllOwnedWorkspaces();
  if (!workspaces || workspaces.length === 0) return 0;

  try {
    const accessToken = await getValidAccessToken();
    const results = await Promise.all(workspaces.map(async (workspaceId) => deleteWorkspaceById(accessToken, workspaceId)));
    return results.filter(Boolean).length;
  } catch (error) {
    console.log(`Error deleting workspaces: ${error.message}`);
    return 0;
  }
}

async function deleteWorkspaceById(accessToken, workspaceId) {
  const url = `${env.ZOHO_AUTH_ANALYTICS_URL}/restapi/v2/workspaces/${workspaceId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'ZANALYTICS-ORGID': env.ZOHO_ANALYTICS_ORG_ID,
      },
    });

    return response.status === 204;
  } catch (error) {
    console.log(`Failed to delete workspace ${workspaceId}: ${error.message}`);
    return false;
  }
}
