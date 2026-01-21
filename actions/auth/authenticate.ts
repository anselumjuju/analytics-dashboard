"use server";

import { redirect } from "next/navigation";


export async function authenticate() {
	const params: Record<string, string> = {
		"client_id": process.env.ZOHO_ANALYTICS_CLIENT_ID as string,
		"response_type": "code",
		"scope": "ZohoAnalytics.fullaccess.all",
		"redirect_uri": process.env.ZOHO_ANALYTICS_REDIRECT_URL + '/api/auth/callback',
		"access_type": "offline",
		"prompt": "consent"
	};

	const url = process.env.ZOHO_ACCOUNT_BASE_URL + "/oauth/v2/auth?" + new URLSearchParams(params).toString();

	return redirect(url);
}