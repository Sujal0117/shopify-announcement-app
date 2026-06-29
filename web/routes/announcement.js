/**
 * Announcement Routes
 * All routes are protected by Shopify session validation middleware
 */
import express from "express";
import { body, param } from "express-validator";
import {
  createAnnouncement,
  getHistory,
  getCurrentAnnouncement,
  deleteAnnouncementRecord,
  clearMetafield,
} from "../controllers/announcementController.js";

const router = express.Router();

// Validation rules for creating an announcement
const validateAnnouncement = [
  body("text")
    .notEmpty()
    .withMessage("Announcement text cannot be empty")
    .isString()
    .withMessage("Announcement must be a string")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Announcement must be between 1 and 500 characters"),
];

// Validation for ID param
const validateId = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Invalid announcement ID"),
];

/**
 * @route   POST /api/announcement
 * @desc    Create new announcement (saves to MongoDB + Shopify metafield)
 * @access  Private (Shopify session required)
 */
router.post("/", validateAnnouncement, createAnnouncement);

/**
 * @route   GET /api/announcement/history
 * @desc    Get paginated announcement history
 * @query   page, limit, search
 * @access  Private
 */
router.get("/history", getHistory);

/**
 * @route   GET /api/announcement/current
 * @desc    Get the current live announcement from Shopify metafield
 * @access  Private
 */
router.get("/current", getCurrentAnnouncement);

/**
 * @route   DELETE /api/announcement/:id
 * @desc    Soft-delete a single announcement record
 * @access  Private
 */
router.delete("/:id", validateId, deleteAnnouncementRecord);

/**
 * @route   DELETE /api/announcement/metafield/clear
 * @desc    Remove announcement metafield from Shopify shop
 * @access  Private
 */
router.delete("/metafield/clear", clearMetafield);

export default router;
