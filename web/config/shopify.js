/**
 * Shopify API configuration
 * Initializes the Shopify app with OAuth and MongoDB session storage
 */
import { shopifyApp } from "@shopify/shopify-app-express";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import { ApiVersion, LogSeverity } from "@shopify/shopify-api";
import "dotenv/config";

const isDev = process.env.NODE_ENV !== "production";

// Strip protocol from host — Shopify needs hostname only
const hostName = (process.env.SHOPIFY_APP_URL || "localhost:3000")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

const shopify = shopifyApp({
  api: {
    apiVersion: ApiVersion.January25,
    apiKey: process.env.SHOPIFY_API_KEY || "",
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    scopes: (process.env.SCOPES || "read_themes").split(","),
    hostName,
    logger: {
      level: isDev ? LogSeverity.Debug : LogSeverity.Warning,
    },
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new MongoDBSessionStorage(
    new URL(process.env.MONGODB_URI || "mongodb://localhost:27017/shopify_announcement"),
    "shopify_announcement"
  ),
});

export default shopify;
