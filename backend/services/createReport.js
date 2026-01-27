// Connect with gemini and gets url for creating reports
// Uses those urls to create reports and filter their viewID
// Returns an array of viewIDs for the created reports

import {getConfig} from './gemini/getConfigs.js';
import {mockConfigs} from '../lib/data.js';
import {getZohoAccessToken} from '../lib/getZohoAccessToken.js';
import {getWorkspaceId} from '../store/tokenStore.js';
import {validateConfig} from './validateConfig.js';

export const createReport = async (uploadDataResponse) => {
  const {tableName, columnDetails} = uploadDataResponse;

  const baseURL = process.env.ZOHO_AUTH_ANALYTICS_URL;
  const accessToken = await getZohoAccessToken();
  const workspaceId = getWorkspaceId();
  const orgId = process.env.ZOHO_ANALYTICS_ORG_ID;

  const rawConfigs = await getConfig({tableSchema: columnDetails, tableName});
  const validatedConfigs = validateConfig(tableName, columnDetails, rawConfigs);

  const configs = validatedConfigs;
  // const configs = mockConfigs(tableName);

  if (!configs?.length) return [];

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
