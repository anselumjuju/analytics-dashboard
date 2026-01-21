import "server-only";
import { redis } from "@/lib/redis";

export async function isZohoConnected(): Promise<boolean> {
	const access_token = await redis.get("zoho_access_token");
	const expires = await redis.get<number>("zoho_token_expiry");

	return Boolean(access_token && expires && Date.now() < expires);
}
