import {setToken} from '../../store/tokenStore.js';

export const refreshAccessToken = async (req, res) => {
  try {
    const clientId = process.env.ZOHO_ANALYTICS_CLIENT_ID;
    const clientSecret = process.env.ZOHO_ANALYTICS_CLIENT_SECRET;
    const refreshToken = process.env.ZOHO_ANALYTICS_REFRESH_TOKEN;
    const baseUrl = process.env.ZOHO_ACCOUNT_BASE_URL;

    if (!clientId || !clientSecret || !refreshToken || !baseUrl) {
      return res.status(400).json({
        success: false,
        message: 'Missing required environment variables',
      });
    }

    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    });

    const url = `${baseUrl}/oauth/v2/token?${params.toString()}`;

    const response = await fetch(url, {method: 'POST'});

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: 'Failed to refresh access token',
        error: data,
      });
    }

    setToken(data.access_token, data.expires_in);

    return res.json({
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    });
  } catch (error) {
    console.error('Refresh token error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error while refreshing token',
    });
  }
};
