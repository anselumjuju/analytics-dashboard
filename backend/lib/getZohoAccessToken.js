import {getToken, isTokenExpired} from '../store/tokenStore.js';
import refreshAccessTokenService from '../handles/auth/refreshAccessToken.js';

export const getZohoAccessToken = async () => {
  if (!getToken() || isTokenExpired()) {
    const newToken = await refreshAccessTokenService();
    return newToken;
  }

  return getToken();
};
