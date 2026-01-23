// Connect with gemini and gets url for creating reports
// Uses those urls to create reports and filter their viewID
// Returns an array of viewIDs for the created reports

import {getConfig} from './getConfig.js';
import {getPrompt} from '../lib/getPrompt.js';
import {mockConfigs} from '../lib/mockConfigs.js';
import {getZohoAccessToken} from '../lib/getZohoAccessToken.js';

export const createReport = async (uploadDataResponse) => {
  const {tableName, columnDetails} = uploadDataResponse;

  const baseURL = process.env.ZOHO_AUTH_ANALYTICS_URL;
  const accessToken = await getZohoAccessToken();
  const workspaceId = process.env.ZOHO_ANALYTICS_WORKSPACE_ID;
  const orgId = process.env.ZOHO_ANALYTICS_ORG_ID;

  const configs = await getConfig(getPrompt(columnDetails, tableName));
  // const configs = mockConfigs(tableName);

  const baseReportURL = `${baseURL}/restapi/v2/workspaces/${workspaceId}/reports`;

  const urls = configs.map((config) => {
    config.baseTableName = tableName;
    return `${baseReportURL}?CONFIG=${encodeURIComponent(JSON.stringify(config))}`;
  });

  const reportRequests = urls.map(async (url) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          'ZANALYTICS-ORGID': orgId,
        },
      });

      if (!response.ok) {
        console.error('Zoho API Error:', await response.text());
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Report creation error:', error);
      return null;
    }
  });

  const reports = await Promise.all(reportRequests);

  const viewIds = reports.map((report) => report?.data?.viewId).filter(Boolean);

  return viewIds;
};
