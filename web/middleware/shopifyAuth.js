/**
 * Shopify Authentication Middleware
 * Validates that requests come from authenticated Shopify sessions
 */
import shopify from "../config/shopify.js";

/**
 * Middleware to ensure a valid Shopify session exists
 * Attaches session to res.locals.shopify for downstream use
 */
export const ensureShopifySession = async (req, res, next) => {
  try {
    // Use Shopify's built-in session validation
    const sessionId = await shopify.api.session.getCurrentId({
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: "No active session. Please authenticate with Shopify.",
      });
    }

    const session = await shopify.config.sessionStorage.loadSession(sessionId);

    if (!session || !session.accessToken) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid. Please re-authenticate.",
      });
    }

    // Attach session to res.locals for controllers
    res.locals.shopify = { session };
    next();
  } catch (error) {
    console.error("Session validation error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
