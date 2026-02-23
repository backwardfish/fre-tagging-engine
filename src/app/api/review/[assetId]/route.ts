import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { freAssetIndex, tagCorrectionLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { reviewActionSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    const id = parseInt(assetId);
    const body = await request.json();
    const parsed = reviewActionSchema.parse(body);

    // Get the current asset
    const [asset] = await db
      .select()
      .from(freAssetIndex)
      .where(eq(freAssetIndex.id, id))
      .limit(1);

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const originalTags = {
      assetType: asset.assetType,
      productLine: asset.productLine,
      flavor: asset.flavor,
      nicotineStrength: asset.nicotineStrength,
      packFormat: asset.packFormat,
      contentTheme: asset.contentTheme,
      setting: asset.setting,
      campaign: asset.campaign,
      usageRights: asset.usageRights,
      description: asset.description,
    };

    let reviewStatus: string;
    let taggingMethod: string;
    let finalTags = originalTags;
    let correctedFields: string[] = [];

    switch (parsed.action) {
      case "approve":
        reviewStatus = "Approved";
        taggingMethod = "Human-Reviewed";
        break;

      case "edit":
        reviewStatus = "Corrected";
        taggingMethod = "Human-Corrected";
        if (parsed.editedTags) {
          finalTags = { ...originalTags, ...parsed.editedTags };
          // Identify which fields changed
          for (const [key, value] of Object.entries(parsed.editedTags)) {
            const origValue = originalTags[key as keyof typeof originalTags];
            if (JSON.stringify(origValue) !== JSON.stringify(value)) {
              correctedFields.push(key);
            }
          }
        }
        break;

      case "reject":
        reviewStatus = "Rejected";
        taggingMethod = asset.taggingMethod || "AI-Suggested";
        break;

      case "skip":
        return NextResponse.json({ success: true, message: "Skipped" });

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    // Update the asset
    const updateData: Record<string, unknown> = {
      reviewStatus,
      taggingMethod,
      reviewedBy: parsed.reviewedBy || "reviewer",
      reviewedAt: new Date(),
      updatedAt: new Date(),
    };

    if (parsed.action === "edit" && parsed.editedTags) {
      Object.assign(updateData, parsed.editedTags);
    }

    const [updated] = await db
      .update(freAssetIndex)
      .set(updateData)
      .where(eq(freAssetIndex.id, id))
      .returning();

    // Log the review action
    await db.insert(tagCorrectionLog).values({
      assetId: id,
      reviewAction: parsed.action,
      reviewedBy: parsed.reviewedBy || "reviewer",
      originalTags,
      finalTags,
      correctedFields: correctedFields.join(", "),
      correctionNote: parsed.correctionNote || null,
      confidenceScore: asset.confidenceScore,
      fileName: asset.fileName,
      folderPath: asset.dropboxPath,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error processing review:", error);
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 }
    );
  }
}
