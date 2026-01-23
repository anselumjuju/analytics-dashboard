// Gets the privateEmbed URL for a specific viewID from Zoho Analytics
// Retuns an array of privateEmbed URLs for the given viewIDs

import {getZohoAccessToken} from '../lib/getZohoAccessToken.js';

export const getPrivateEmbedURL = async (viewIDs) => {
  if (!viewIDs?.length) return [];

  const baseURL = process.env.ZOHO_AUTH_ANALYTICS_URL;
  const workspaceId = process.env.ZOHO_ANALYTICS_WORKSPACE_ID;
  const orgId = process.env.ZOHO_ANALYTICS_ORG_ID;

  const accessToken = await getZohoAccessToken();

  const config = {};

  const url = `${baseURL}/restapi/v2/workspaces/${workspaceId}/views/<view-id>/publish/privatelink`;

  const validViewIDs = viewIDs.filter(Boolean);

  const privateEmbedRequests = validViewIDs.map(async (viewID) => {
    try {
      const privateEmbedURL = url.replace('<view-id>', viewID);
      const fullURL = `${privateEmbedURL}?config=${encodeURIComponent(JSON.stringify(config))}`;

      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'ZANALYTICS-ORGID': orgId,
        },
      });

      if (!response.ok) {
        console.error('privateEmbed fetch failed:', await response.text());
        return null;
      }

      return await response.json();
    } catch (err) {
      console.error('privateEmbed URL error:', err);
      return null;
    }
  });

  const privateEmbedResponses = await Promise.all(privateEmbedRequests);

  const urls = privateEmbedResponses.map((privateEmbed) => privateEmbed?.data?.privateUrl).filter(Boolean);

  return urls;
};
