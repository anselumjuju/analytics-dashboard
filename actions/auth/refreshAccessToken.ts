"use server";

import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function refreshAccessToken(refreshToken: string) {

	const params: Record<string, string> = {
		"refresh_token": refreshToken,
		"client_id": process.env.ZOHO_ANALYTICS_CLIENT_ID as string,
		"client_secret": process.env.ZOHO_ANALYTICS_CLIENT_SECRET as string,
		"grant_type": "refresh_token"
	}

	const url = process.env.ZOHO_ACCOUNT_BASE_URL + "/oauth/v2/token?" + new URLSearchParams(params).toString();

	const response = await fetch(url, {
		method: 'POST'
	});

	const responseData = await response.json();

	if (!response.ok)
		return null;

	const { access_token, expires_in } = responseData;

	const expiryTime = Date.now() + (expires_in * 1000) - (5 * 60 * 1000);

	await redis.set('zoho_access_token', access_token);
	await redis.set('zoho_token_expiry', expiryTime.toString());

	return NextResponse.redirect(new URL(process.env.ZOHO_ANALYTICS_REDIRECT_URL as string));
}