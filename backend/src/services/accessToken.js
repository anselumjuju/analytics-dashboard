import {env} from '../lib/env.js';
import {getAccessToken, getExpiryTime, isTokenExpired, setAccessToken, setExpiryTime} from '../stores/tokenStore.js';

export async function getValidAccessToken() {
  const token = getAccessToken();
  const expiry = getExpiryTime();

  if (token && !isTokenExpired(expiry)) return token;
  return generateAccessToken();
}

export async function generateAccessToken() {
  const params = new URLSearchParams({
    refresh_token: env.ZOHO_ANALYTICS_REFRESH_TOKEN,
    client_id: env.ZOHO_ANALYTICS_CLIENT_ID,
    client_secret: env.ZOHO_ANALYTICS_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  const url = `${env.ZOHO_ACCOUNT_BASE_URL}/oauth/v2/token?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: params.toString(),
    });

    const body = await response.json();
    const accessToken = String(body.access_token || '');
    const expiryInMs = Number(body.expires_in || 0) * 1000;
    const expiryTime = String(Date.now() + expiryInMs);

    setAccessToken(accessToken);
    setExpiryTime(expiryTime);

    return accessToken;
  } catch (error) {
    console.log(`Error generating access token ${error.message}`);
    return '';
  }
}
