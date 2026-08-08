let accessToken = null;
let expiryTime = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(value) {
  accessToken = value;
}

export function getExpiryTime() {
  return expiryTime;
}

export function setExpiryTime(value) {
  expiryTime = value;
}

export function isTokenExpired(value) {
  if (value == null || String(value).trim().length === 0) return true;
  return Date.now() >= Number(value);
}
