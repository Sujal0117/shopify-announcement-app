/**
 * Environment variable validation
 * Checks required env vars on startup and throws if any are missing.
 */

const REQUIRED_ENV_VARS = [
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "SHOPIFY_APP_URL",
  "SCOPES",
  "MONGODB_URI",
];

export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables:\n  ${missing.join("\n  ")}\n\nCopy .env.example to .env and fill in the values.`
    );
    process.exit(1);
  }

  console.log("✅ Environment variables validated");
};
