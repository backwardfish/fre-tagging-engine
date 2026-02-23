import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  real,
  pgEnum,
  json,
  boolean,
} from "drizzle-orm/pg-core";

// --- Enums ---
export const assetTypeEnum = pgEnum("asset_type", [
  "Photo",
  "Video",
  "Illustration",
  "Icon",
  "Template",
  "Sell Sheet",
  "Social Asset",
  "Packaging File",
  "Presentation",
  "Document",
  "Other",
]);

export const packFormatEnum = pgEnum("pack_format", [
  "20ct Can",
  "100ct Mega Pack",
  "Both",
  "N/A",
]);

export const usageRightsEnum = pgEnum("usage_rights", [
  "Unlimited Internal",
  "Approved External",
  "Restricted",
  "Expires",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "Pending Review",
  "Approved",
  "Corrected",
  "Rejected",
  "Auto-Approved",
]);

export const taggingMethodEnum = pgEnum("tagging_method", [
  "AI-Suggested",
  "Human-Reviewed",
  "Human-Corrected",
  "Manual",
]);

export const operatingModeEnum = pgEnum("operating_mode", [
  "Calibration",
  "Confidence-Based",
  "Autonomous",
]);

// --- Main Asset Index ---
export const freAssetIndex = pgTable("fre_asset_index", {
  id: serial("id").primaryKey(),

  // File metadata (auto-extracted)
  fileName: text("file_name").notNull(),
  fileFormat: text("file_format").notNull(),
  fileSizeKB: integer("file_size_kb"),
  dimensions: text("dimensions"),
  dropboxPath: text("dropbox_path"),
  dropboxLink: text("dropbox_link"),
  uploadedBy: text("uploaded_by").default("system"),
  dateCaptured: timestamp("date_captured"),
  dateIndexed: timestamp("date_indexed").defaultNow().notNull(),

  // Thumbnail
  thumbnailUrl: text("thumbnail_url"),

  // AI-generated tag fields
  assetType: assetTypeEnum("asset_type"),
  productLine: json("product_line").$type<string[]>(),
  flavor: json("flavor").$type<string[]>(),
  nicotineStrength: json("nicotine_strength").$type<string[]>(),
  packFormat: packFormatEnum("pack_format"),
  contentTheme: json("content_theme").$type<string[]>(),
  setting: json("setting").$type<string[]>(),
  campaign: text("campaign"),
  usageRights: usageRightsEnum("usage_rights").default("Unlimited Internal"),
  expirationDate: timestamp("expiration_date"),
  description: text("description"),

  // System fields
  taggingMethod: taggingMethodEnum("tagging_method").default("AI-Suggested"),
  confidenceScore: real("confidence_score"),
  reviewStatus: reviewStatusEnum("review_status").default("Pending Review"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Correction Log ---
export const tagCorrectionLog = pgTable("tag_correction_log", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id")
    .notNull()
    .references(() => freAssetIndex.id, { onDelete: "cascade" }),
  reviewAction: text("review_action").notNull(),
  reviewedBy: text("reviewed_by").default("reviewer"),
  originalTags: json("original_tags").$type<Record<string, unknown>>(),
  finalTags: json("final_tags").$type<Record<string, unknown>>(),
  correctedFields: text("corrected_fields"),
  correctionNote: text("correction_note"),
  confidenceScore: real("confidence_score"),
  fileName: text("file_name"),
  folderPath: text("folder_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Accuracy Log ---
export const taggingAccuracyLog = pgTable("tagging_accuracy_log", {
  id: serial("id").primaryKey(),
  weekStarting: timestamp("week_starting").notNull(),
  totalAssetsReviewed: integer("total_assets_reviewed").notNull().default(0),
  totalApproved: integer("total_approved").notNull().default(0),
  totalCorrected: integer("total_corrected").notNull().default(0),
  totalRejected: integer("total_rejected").notNull().default(0),
  accuracyRate: real("accuracy_rate"),
  avgConfidenceScore: real("avg_confidence_score"),
  mostCorrectedField: text("most_corrected_field"),
  operatingMode: operatingModeEnum("operating_mode_snapshot"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Monitored Folders ---
export const monitoredFolders = pgTable("monitored_folders", {
  id: serial("id").primaryKey(),
  dropboxPath: text("dropbox_path").notNull().unique(),
  displayName: text("display_name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastSyncCursor: text("last_sync_cursor"),
  lastSyncAt: timestamp("last_sync_at"),
  totalFilesSynced: integer("total_files_synced").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- System Settings ---
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Type exports ---
export type InsertAsset = typeof freAssetIndex.$inferInsert;
export type SelectAsset = typeof freAssetIndex.$inferSelect;
export type InsertCorrection = typeof tagCorrectionLog.$inferInsert;
export type SelectCorrection = typeof tagCorrectionLog.$inferSelect;
export type InsertAccuracy = typeof taggingAccuracyLog.$inferInsert;
export type SelectAccuracy = typeof taggingAccuracyLog.$inferSelect;
export type InsertFolder = typeof monitoredFolders.$inferInsert;
export type SelectFolder = typeof monitoredFolders.$inferSelect;
