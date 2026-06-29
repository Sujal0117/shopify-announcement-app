/**
 * Announcement Mongoose Model
 * Each save creates a NEW record — history is preserved, records are never overwritten.
 */
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    // The Shopify shop domain (e.g. my-store.myshopify.com)
    shop: {
      type: String,
      required: [true, "Shop domain is required"],
      trim: true,
      lowercase: true,
      index: true,
    },

    // The announcement text content
    announcementText: {
      type: String,
      required: [true, "Announcement text is required"],
      trim: true,
      maxlength: [500, "Announcement cannot exceed 500 characters"],
    },

    // Metafield ID returned by Shopify (for reference/debugging)
    metafieldId: {
      type: String,
      default: null,
    },

    // Whether this is the currently active announcement for the shop
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    // Auto-manage createdAt and updatedAt
    timestamps: true,
    // Transform _id to id in JSON output
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient per-shop queries
announcementSchema.index({ shop: 1, createdAt: -1 });

// Static method: get latest active announcement for a shop
announcementSchema.statics.getLatestForShop = function (shop) {
  return this.findOne({ shop, isDeleted: false })
    .sort({ createdAt: -1 })
    .lean();
};

// Static method: get full history for a shop (newest first)
announcementSchema.statics.getHistoryForShop = function (
  shop,
  { page = 1, limit = 10, search = "" } = {}
) {
  const skip = (page - 1) * limit;
  const query = { shop, isDeleted: false };

  if (search) {
    query.announcementText = { $regex: search, $options: "i" };
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method: count total records (for pagination)
announcementSchema.statics.countForShop = function (shop, search = "") {
  const query = { shop, isDeleted: false };
  if (search) {
    query.announcementText = { $regex: search, $options: "i" };
  }
  return this.countDocuments(query);
};

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
