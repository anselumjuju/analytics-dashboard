import 'dotenv/config';
import {GetSecretValueCommand, SecretsManagerClient} from '@aws-sdk/client-secrets-manager';

const awsRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '';
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
const secretId = process.env.AWS_SECRET_NAME || process.env.AWS_SECRET_ID || '';

if (!awsRegion) throw new Error('Missing AWS_REGION in .env');
if (!awsAccessKeyId) throw new Error('Missing AWS_ACCESS_KEY_ID in .env');
if (!awsSecretAccessKey) throw new Error('Missing AWS_SECRET_ACCESS_KEY in .env');
if (!secretId) throw new Error('Missing AWS_SECRET_NAME (or AWS_SECRET_ID) in .env');

const secretsClient = new SecretsManagerClient({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
});

const secretResponse = await secretsClient.send(new GetSecretValueCommand({SecretId: secretId}));
const secretString = secretResponse.SecretString || new TextDecoder().decode(secretResponse.SecretBinary || new Uint8Array());

let secretValues = {};
try {
  secretValues = JSON.parse(secretString || '{}');
} catch (error) {
  throw new Error(`AWS secret ${secretId} must contain valid JSON: ${error.message}`);
}

export const env = {
  ZOHO_ANALYTICS_CLIENT_ID: secretValues.ZOHO_ANALYTICS_CLIENT_ID || '',
  ZOHO_ANALYTICS_CLIENT_SECRET: secretValues.ZOHO_ANALYTICS_CLIENT_SECRET || '',
  ZOHO_ANALYTICS_REFRESH_TOKEN: secretValues.ZOHO_ANALYTICS_REFRESH_TOKEN || '',
  ZOHO_ACCOUNT_BASE_URL: secretValues.ZOHO_ACCOUNT_BASE_URL || '',
  ZOHO_AUTH_ANALYTICS_URL: secretValues.ZOHO_AUTH_ANALYTICS_URL || '',
  ZOHO_ANALYTICS_ORG_ID: secretValues.ZOHO_ANALYTICS_ORG_ID || '',
  GEMINI_API_KEY: secretValues.GEMINI_API_KEY || '',
  PORT: secretValues.PORT || '8081',
};
