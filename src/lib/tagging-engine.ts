import { getAnthropicClient } from "./anthropic";
import { buildSystemPrompt } from "./system-prompt";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MODE_AUTO_APPROVE_THRESHOLDS, type OperatingMode } from "./constants";

export interface TaggingInput {
  fileName: string;
  filePath: string;
  fileExtension: string;
  fileSizeKB: number | null;
  dimensions: string | null;
  folderName: string;
  parentFolderName: string;
}

export interface TaggingResult {
  assetType: string;
  productLine: string[];
  flavor: string[];
  nicotineStrength: string[];
  packFormat: string;
  contentTheme: string[];
  setting: string[];
  campaign: string | null;
  usageRights: string;
  description: string;
  confidence: number;
  reviewStatus: string;
}

async function getSettingValue(key: string): Promise<string | null> {
  try {
    const result = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .limit(1);
    return result[0]?.value ?? null;
  } catch {
    return null;
  }
}

function determineReviewStatus(
  confidence: number,
  mode: OperatingMode
): string {
  const threshold = MODE_AUTO_APPROVE_THRESHOLDS[mode];
  return confidence >= threshold ? "Auto-Approved" : "Pending Review";
}

export async function tagAsset(input: TaggingInput): Promise<TaggingResult> {
  const anthropic = getAnthropicClient();

  // Load correction patterns and operating mode
  const [patterns, modeValue] = await Promise.all([
    getSettingValue("correction_patterns"),
    getSettingValue("operating_mode"),
  ]);

  const mode = (modeValue as OperatingMode) || "Calibration";
  const systemPrompt = buildSystemPrompt(patterns || "");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: JSON.stringify(input, null, 2) }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  // Parse the JSON response, handling potential markdown code blocks
  let jsonText = content.text.trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const tags = JSON.parse(jsonText);

  const reviewStatus = determineReviewStatus(tags.confidence, mode);

  return {
    assetType: tags.assetType,
    productLine: tags.productLine,
    flavor: tags.flavor,
    nicotineStrength: tags.nicotineStrength,
    packFormat: tags.packFormat,
    contentTheme: tags.contentTheme,
    setting: tags.setting,
    campaign: tags.campaign,
    usageRights: tags.usageRights || "Unlimited Internal",
    description: tags.description,
    confidence: tags.confidence,
    reviewStatus,
  };
}

export function parseFilePath(fullPath: string): {
  folderName: string;
  parentFolderName: string;
  fileName: string;
  fileExtension: string;
} {
  const parts = fullPath.replace(/\\/g, "/").split("/").filter(Boolean);
  const fileName = parts[parts.length - 1] || "";
  const folderName = parts[parts.length - 2] || "";
  const parentFolderName = parts[parts.length - 3] || "";
  const fileExtension = "." + (fileName.split(".").pop() || "").toLowerCase();

  return { folderName, parentFolderName, fileName, fileExtension };
}
