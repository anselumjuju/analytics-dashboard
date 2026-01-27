import {getZohoAccessToken} from '../../lib/getZohoAccessToken.js';

export const deleteWorkSpace = async (req, res) => {
  const accessCode = await getZohoAccessToken();
  const baseURL = process.env.ZOHO_AUTH_ANALYTICS_URL;
  const orgId = process.env.ZOHO_ANALYTICS_ORG_ID;

  try {
    // Get all workspaces
    const workspacesRes = await fetch(`${baseURL}/restapi/v2/workspaces`, {
      method: 'GET',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessCode}`,
      },
    });
    const workspaces = await workspacesRes.json();

    // Delete workspaces that start with 'workspace_'
    let ownedWorkSpaces = workspaces?.data?.ownedWorkspaces || [];
    ownedWorkSpaces = ownedWorkSpaces.filter((w) => w.workspaceName.startsWith('workspace_'));

    if (ownedWorkSpaces.length === 0) {
      console.log('No auto-generated workspaces found');
      return res.json({error: 'No auto-generated workspaces found'});
    }

    const deletedWorkSpaces = await Promise.all(
      ownedWorkSpaces.map(async (workspace) => {
        try {
          await fetch(`${baseURL}/restapi/v2/workspaces/${workspace.workspaceId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Zoho-oauthtoken ${accessCode}`,
              'ZANALYTICS-ORGID': orgId,
            },
          });
          return {success: true};
        } catch (error) {
          console.error(error);
          return {success: false};
        }
      }),
    );

    const failed = deletedWorkSpaces.filter((r) => r.success === false);

    if (failed.length > 0) return res.status(500).json({error: 'Failed to delete workspaces', details: failed});
  } catch (error) {
    console.error(error);
    return res.status(500).json({error: 'Failed to delete workspaces'});
  }

  return res.json({message: 'Workspaces deleted'});
};
