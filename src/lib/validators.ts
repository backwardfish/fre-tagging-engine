import { z } from "zod";
import {
  ASSET_TYPE_OPTIONS,
  PRODUCT_LINE_OPTIONS,
  FLAVOR_OPTIONS,
  NICOTINE_STRENGTH_OPTIONS,
  PACK_FORMAT_OPTIONS,
  CONTENT_THEME_OPTIONS,
  SETTING_OPTIONS,
  USAGE_RIGHTS_OPTIONS,
} from "./constants";

export const reviewActionSchema = z.object({
  action: z.enum(["approve", "edit", "reject", "skip"]),
  editedTags: z
    .object({
      assetType: z.enum(ASSET_TYPE_OPTIONS).optional(),
      productLine: z.array(z.enum(PRODUCT_LINE_OPTIONS)).optional(),
      flavor: z.array(z.enum(FLAVOR_OPTIONS)).optional(),
      nicotineStrength: z.array(z.enum(NICOTINE_STRENGTH_OPTIONS)).optional(),
      packFormat: z.enum(PACK_FORMAT_OPTIONS).optional(),
      contentTheme: z.array(z.enum(CONTENT_THEME_OPTIONS)).optional(),
      setting: z.array(z.enum(SETTING_OPTIONS)).optional(),
      campaign: z.string().nullable().optional(),
      usageRights: z.enum(USAGE_RIGHTS_OPTIONS).optional(),
      description: z.string().optional(),
    })
    .optional(),
  correctionNote: z.string().optional(),
  reviewedBy: z.string().optional(),
});

export const assetQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z
    .enum([
      "Pending Review",
      "Approved",
      "Corrected",
      "Rejected",
      "Auto-Approved",
    ])
    .optional(),
  assetType: z.enum(ASSET_TYPE_OPTIONS).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["dateIndexed", "confidenceScore", "fileName"]).default("dateIndexed"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ReviewAction = z.infer<typeof reviewActionSchema>;
export type AssetQuery = z.infer<typeof assetQuerySchema>;
