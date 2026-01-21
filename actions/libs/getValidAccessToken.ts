"use server";

import { redis } from "@/lib/redis";
import { refreshAccessToken } from "../auth/refreshAccessToken";

const ACCESS_KEY = 'zoho_access_token';
const REFRESH_KEY = 'zoho_refresh_token';
const EXPIRY_KEY = 'zoho_token_expiry';

export const getValidAccessToken = async () => {
	const [accessToken, refreshToken, tokenExpiry] = await Promise.all([
		redis.get(ACCESS_KEY),
		redis.get(REFRESH_KEY),
		redis.get(EXPIRY_KEY)
	]);

	if (accessToken && tokenExpiry && Date.now() < parseInt(tokenExpiry as string)) {
		return accessToken;
	}

	return refreshAccessToken(refreshToken as string);
}