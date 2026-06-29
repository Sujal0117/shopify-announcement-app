/**
 * Shopify Announcement App — Express Server Entry Point
 * Handles OAuth, API routes, and serves the React frontend
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import serveStatic from "serve-static";

import shopify from "./config/shopify.js";
import connectDB from "./config/database.js";
import announcementRoutes from "./routes/announcement.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { validateEnv } from "./utils/validateEnv.js";

// Validate required environment variables before anything else
validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || "3000", 10);
const isDev = process.env.NODE_ENV !== "production";

// ─── Connect to MongoDB ──────────────────────────────────────────────────────
await connectDB();

// ─── Initialize Express ──────────────────────────────────────────────────────
const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(morgan(isDev ? "dev" : "combined"));
app.use(cookieParser());

// Shopify requires raw body for webhook verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// CORS — allow requests from embedded app iframe
app.use(
  cors({
    origin: process.env.SHOPIFY_APP_URL,
    credentials: true,
  })
);

// ─── Shopify OAuth Routes ────────────────────────────────────────────────────
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

// ─── Shopify Webhooks ────────────────────────────────────────────────────────
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: {} })
);

// ─── API Routes ──────────────────────────────────────────────────────────────
// In development, skip Shopify session validation and use env vars directly.
// In production, validate the Shopify session.
const apiAuthMiddleware =
  isDev
    ? (req, res, next) => {
        // Inject shop + token from env so controllers work without OAuth
        res.locals.shopify = {
          session: {
            shop: process.env.SHOP,
            accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
          },
        };
        next();
      }
    : shopify.validateAuthenticatedSession();

app.use("/api/announcement", apiAuthMiddleware, announcementRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ─── Serve React Frontend ─────────────────────────────────────────────────────
// In both dev and production, serve the built client/dist folder
const STATIC_PATH = path.join(__dirname, "../client/dist");
app.use(serveStatic(STATIC_PATH, { index: false }));

// ─── SPA Fallback ─────────────────────────────────────────────────────────────
const spaMiddleware = isDev
  ? (req, res, next) => next()
  : shopify.ensureInstalledOnShop();

app.use("/*", spaMiddleware, async (req, res) => {
  res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Announcement Manager</title>
          <script>
            window.__SHOPIFY_API_KEY__ = "${process.env.SHOPIFY_API_KEY}";
          </script>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="/assets/main.js"></script>
        </body>
      </html>`
    );
});

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 App URL: ${process.env.SHOPIFY_APP_URL}`);
});

export default app;
