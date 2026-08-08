import crypto from 'node:crypto';
import {env} from '../lib/env.js';
import {encode} from '../lib/utils.js';
import {getValidAccessToken} from './accessToken.js';

export async function uploadFile(file, workspaceId) {
  const uniqueId = crypto.randomUUID().replaceAll('-', '').slice(0, 10);
  const tableName = `table_${uniqueId}`;

  const params = {
    tableName,
    fileType: 'csv',
    autoIdentify: 'true',
    onError: 'skiprow',
    thousandSeparator: 0,
  };

  const url = `${env.ZOHO_AUTH_ANALYTICS_URL}/restapi/v2/workspaces/${workspaceId}/data?CONFIG=${encode(JSON.stringify(params))}`;

  try {
    const accessToken = await getValidAccessToken();
    const formData = new FormData();
    const blob = new Blob([file.buffer], {type: file.mimetype || 'application/octet-stream'});
    formData.append('FILE', blob, file.originalname || 'upload.csv');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'ZANALYTICS-ORGID': env.ZOHO_ANALYTICS_ORG_ID,
      },
      body: formData,
    });

    const body = await response.json();
    if (body.status !== 'success') {
      console.log(`Error uploading file: ${body?.data?.errorMessage || 'Unknown error'}`);
      return null;
    }

    return {
      status: 'success',
      tableName,
      tableSchema: body?.data?.columnDetails,
    };
  } catch (error) {
    console.log(`Error uploading file: ${error.message}`);
    return null;
  }
}
