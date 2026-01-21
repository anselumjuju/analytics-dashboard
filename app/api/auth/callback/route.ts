import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const code = searchParams.get("code");
	const error = searchParams.get("error");

	if (error || !code) {
		return NextResponse.error();
	}

	const params: Record<string, string> = {
		code,
		"client_id": process.env.ZOHO_ANALYTICS_CLIENT_ID as string,
		"client_secret": process.env.ZOHO_ANALYTICS_CLIENT_SECRET as string,
		"redirect_uri": process.env.ZOHO_ANALYTICS_REDIRECT_URL + '/api/auth/callback',
		"grant_type": "authorization_code"
	}

	const url = process.env.ZOHO_ACCOUNT_BASE_URL + "/oauth/v2/token?" + new URLSearchParams(params).toString();

	const response = await fetch(url, {
		method: 'POST'
	});

	const accessCode_data = await response.json();

	if (accessCode_data.error) {
		return NextResponse.json({ code: null, error: accessCode_data.error });
	}

	await redis.set('zoho_access_token', accessCode_data.access_token);
	await redis.set('zoho_refresh_token', accessCode_data.refresh_token);
	await redis.set('zoho_token_expiry', Date.now() + (accessCode_data.expires_in * 1000));

	return NextResponse.redirect(new URL(process.env.ZOHO_ANALYTICS_REDIRECT_URL as string));
}