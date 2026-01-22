let accessToken = null;
let expiryTime = null;

export const setToken = (token, expiresIn) => {
  accessToken = token;
  expiryTime = Date.now() + expiresIn * 1000;
};

export const getToken = () => {
  return accessToken;
};

export const isTokenExpired = () => {
  return !expiryTime || Date.now() > expiryTime;
};
