/**
 * Environment variable validation
 * Warns about missing vars but only exits on truly critical ones.
 */

const CRITICAL_VARS = [
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "MONGODB_URI",
];

const OPTIONAL_VARS = [
  "SHOPIFY_APP_URL",
  "SCOPES",
  "SESSION_SECRET",
];

export const validateEnv = () => {
  const missing = CRITICAL_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing critical environment variables:\n  ${missing.join("\n  ")}\n\nAdd them to your deployment environment.`
    );
    process.exit(1);
  }

  // Warn about optional but recommended vars
  const missingOptional = OPTIONAL_VARS.filter((key) => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(`⚠️  Missing optional env vars: ${missingOptional.join(", ")}`);
  }

  console.log("✅ Environment variables validated");
};
