export const getWorkspaces = async (accessToken: string) => {

	const url = process.env.ZOHO_AUTH_ANALYTICS_URL + '/restapi/v2/workspaces';

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Zoho-oauthtoken ${accessToken}`,
			'Content-Type': 'application/json'
		}
	})

	return response.json();
}