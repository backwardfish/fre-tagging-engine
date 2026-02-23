import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { freAssetIndex } from "@/db/schema";
import { eq } from "drizzle-orm";
import { tagAsset, parseFilePath } from "@/lib/tagging-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId } = body;

    if (!assetId) {
      return NextResponse.json(
        { error: "assetId is required" },
        { status: 400 }
      );
    }

    const [asset] = await db
      .select()
      .from(freAssetIndex)
      .where(eq(freAssetIndex.id, assetId))
      .limit(1);

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const pathInfo = parseFilePath(asset.dropboxPath || asset.fileName);

    const tagResult = await tagAsset({
      fileName: asset.fileName,
      filePath: asset.dropboxPath || `/${asset.fileName}`,
      fileExtension: "." + asset.fileFormat,
      fileSizeKB: asset.fileSizeKB,
      dimensions: asset.dimensions,
      folderName: pathInfo.folderName,
      parentFolderName: pathInfo.parentFolderName,
    });

    const [updated] = await db
      .update(freAssetIndex)
      .set({
        assetType: tagResult.assetType as typeof freAssetIndex.assetType.enumValues[number],
        productLine: tagResult.productLine,
        flavor: tagResult.flavor,
        nicotineStrength: tagResult.nicotineStrength,
        packFormat: tagResult.packFormat as typeof freAssetIndex.packFormat.enumValues[number],
        contentTheme: tagResult.contentTheme,
        setting: tagResult.setting,
        campaign: tagResult.campaign,
        usageRights: tagResult.usageRights as typeof freAssetIndex.usageRights.enumValues[number],
        description: tagResult.description,
        confidenceScore: tagResult.confidence,
        reviewStatus: tagResult.reviewStatus as typeof freAssetIndex.reviewStatus.enumValues[number],
        taggingMethod: "AI-Suggested",
        updatedAt: new Date(),
      })
      .where(eq(freAssetIndex.id, assetId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Tagging error:", error);
    return NextResponse.json(
      { error: "Failed to tag asset" },
      { status: 500 }
    );
  }
}
