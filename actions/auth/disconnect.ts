"use server";

import { redis } from "@/lib/redis";

export async function disconnectZoho() {
	await redis.del("zoho_access_token");
	await redis.del("zoho_refresh_token");
	await redis.del("zoho_token_expiry");

	return { success: true };
}