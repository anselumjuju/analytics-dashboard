// Take the Refresh Token from env and
// generate a new access token

import {setToken} from '../store/tokenStore.js';

export const generateAccessToken = async () => {
  const clientId = process.env.ZOHO_ANALYTICS_CLIENT_ID;
  const clientSecret = process.env.ZOHO_ANALYTICS_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_ANALYTICS_REFRESH_TOKEN;
  const baseUrl = process.env.ZOHO_ACCOUNT_BASE_URL;

  if (!clientId || !clientSecret || !refreshToken || !baseUrl) return null;

  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const url = `${baseUrl}/oauth/v2/token?${params.toString()}`;

  try {
    const response = await fetch(url, {method: 'POST'});
    const data = await response.json();

    if (!response.ok) return null;

    setToken(data.access_token, data.expires_in);

    return data.access_token;
  } catch (error) {
    console.error('Refresh token error:', error);
    return null;
  }
};
