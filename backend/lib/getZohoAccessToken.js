import {generateAccessToken} from '../services/generateAccessToken.js';
import {getToken, isTokenExpired} from '../store/tokenStore.js';

export const getZohoAccessToken = async () => {
  if (!getToken() || isTokenExpired()) {
    const newToken = await generateAccessToken();
    return newToken;
  }

  return getToken();
};
