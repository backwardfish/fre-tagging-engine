// --- Tag Field Options ---

export const ASSET_TYPE_OPTIONS = [
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
] as const;

export const PRODUCT_LINE_OPTIONS = [
  "FRE Core",
  "FRE LABS",
  "Corporate/TPB",
  "Partnership",
  "Non-Branded",
] as const;

export const FLAVOR_OPTIONS = [
  "Mint",
  "Wintergreen",
  "Sweet",
  "Lush",
  "Original",
  "Watermelon",
  "Multiple",
  "N/A",
] as const;

export const NICOTINE_STRENGTH_OPTIONS = [
  "3mg",
  "6mg",
  "9mg",
  "12mg",
  "15mg",
  "Multiple",
  "N/A",
] as const;

export const PACK_FORMAT_OPTIONS = [
  "20ct Can",
  "100ct Mega Pack",
  "Both",
  "N/A",
] as const;

export const CONTENT_THEME_OPTIONS = [
  "Lifestyle",
  "Product Shot",
  "Packaging",
  "Retail/POS",
  "Event",
  "Data/Chart",
  "Partnership",
  "Behind-the-Scenes",
  "UGC",
  "Template/Layout",
] as const;

export const SETTING_OPTIONS = [
  "Outdoor",
  "Urban",
  "Workplace",
  "Sports",
  "Nightlife",
  "Studio/Clean",
  "Retail Environment",
  "Event Venue",
  "N/A",
] as const;

export const USAGE_RIGHTS_OPTIONS = [
  "Unlimited Internal",
  "Approved External",
  "Restricted",
  "Expires",
] as const;

export const REVIEW_STATUS_OPTIONS = [
  "Pending Review",
  "Approved",
  "Corrected",
  "Rejected",
  "Auto-Approved",
] as const;

// --- Supported File Extensions ---

export const IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "tiff",
  "bmp",
  "svg",
] as const;

export const VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "wmv"] as const;

export const DESIGN_EXTENSIONS = [
  "psd",
  "ai",
  "indd",
  "sketch",
  "fig",
] as const;

export const DOCUMENT_EXTENSIONS = [
  "pdf",
  "pptx",
  "ppt",
  "docx",
  "doc",
  "xlsx",
  "xls",
] as const;

export const ALL_SUPPORTED_EXTENSIONS = [
  ...IMAGE_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
  ...DESIGN_EXTENSIONS,
  ...DOCUMENT_EXTENSIONS,
] as const;

// --- Confidence Thresholds ---

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 85,
  MEDIUM: 60,
  LOW: 0,
} as const;

export const MODE_AUTO_APPROVE_THRESHOLDS = {
  Calibration: Infinity, // Never auto-approve
  "Confidence-Based": 85,
  Autonomous: 70,
} as const;

// --- Operating Modes ---

export type OperatingMode = "Calibration" | "Confidence-Based" | "Autonomous";

export const OPERATING_MODES: {
  value: OperatingMode;
  label: string;
  description: string;
}[] = [
  {
    value: "Calibration",
    label: "Mode 1: Calibration",
    description: "100% of assets reviewed by humans",
  },
  {
    value: "Confidence-Based",
    label: "Mode 2: Confidence-Based Routing",
    description: "Only medium/low confidence reviewed (~30-50%)",
  },
  {
    value: "Autonomous",
    label: "Mode 3: Autonomous + Exceptions",
    description: "Only low confidence and anomalies reviewed (~5-10%)",
  },
];
