/**
 * Announcement Controller
 * Handles all business logic for announcement CRUD operations.
 */
import Announcement from "../models/Announcement.js";
import {
  saveAnnouncementMetafield,
  getAnnouncement,
  deleteAnnouncement,
} from "../services/shopifyService.js";
import { validationResult } from "express-validator";

/**
 * POST /api/announcement
 * Save a new announcement to MongoDB and sync to Shopify metafield
 */
export const createAnnouncement = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { text } = req.body;
    const session = res.locals.shopify?.session;
    const shop = session?.shop || process.env.SHOP;
    const accessToken = session?.accessToken || process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shop || !accessToken) {
      return res.status(401).json({
        success: false,
        message: "Shopify session not found. Please reinstall the app.",
      });
    }

    // 1. Save to Shopify metafield via GraphQL
    let metafieldId = null;
    try {
      const metafield = await saveAnnouncementMetafield(shop, accessToken, text);
      metafieldId = metafield?.id || null;
    } catch (shopifyError) {
      console.error("Shopify metafield save error:", shopifyError.message);
      // Log but don't block — still save to MongoDB
    }

    // 2. Save to MongoDB (always creates a new record — no overwrite)
    const announcement = await Announcement.create({
      shop,
      announcementText: text,
      metafieldId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Announcement saved successfully",
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/announcement/history
 * Return paginated, searchable history of announcements
 */
export const getHistory = async (req, res, next) => {
  try {
    const session = res.locals.shopify?.session;
    const shop = session?.shop || process.env.SHOP;

    if (!shop) {
      return res.status(401).json({
        success: false,
        message: "Shop not identified",
      });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const search = (req.query.search || "").trim();

    const [announcements, total] = await Promise.all([
      Announcement.getHistoryForShop(shop, { page, limit, search }),
      Announcement.countForShop(shop, search),
    ]);

    return res.status(200).json({
      success: true,
      data: announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/announcement/current
 * Return the latest active announcement from Shopify metafield
 */
export const getCurrentAnnouncement = async (req, res, next) => {
  try {
    const session = res.locals.shopify?.session;
    const shop = session?.shop || process.env.SHOP;
    const accessToken = session?.accessToken || process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shop || !accessToken) {
      return res.status(401).json({
        success: false,
        message: "Shopify session not found",
      });
    }

    const metafield = await getAnnouncement(shop, accessToken);

    return res.status(200).json({
      success: true,
      data: {
        text: metafield?.value || "",
        metafieldId: metafield?.id || null,
        updatedAt: metafield?.updatedAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/announcement/:id
 * Soft-delete an announcement record from MongoDB
 */
export const deleteAnnouncementRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = res.locals.shopify?.session;
    const shop = session?.shop || process.env.SHOP;

    const announcement = await Announcement.findOne({ _id: id, shop });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    // Soft delete
    announcement.isDeleted = true;
    await announcement.save();

    return res.status(200).json({
      success: true,
      message: "Announcement deleted",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/announcement/metafield/clear
 * Remove the announcement metafield from Shopify entirely
 */
export const clearMetafield = async (req, res, next) => {
  try {
    const session = res.locals.shopify?.session;
    const shop = session?.shop || process.env.SHOP;
    const accessToken = session?.accessToken || process.env.SHOPIFY_ACCESS_TOKEN;

    const { metafieldId } = req.body;

    if (!metafieldId) {
      return res.status(400).json({
        success: false,
        message: "metafieldId is required",
      });
    }

    await deleteAnnouncement(shop, accessToken, metafieldId);

    return res.status(200).json({
      success: true,
      message: "Metafield cleared from Shopify storefront",
    });
  } catch (error) {
    next(error);
  }
};
