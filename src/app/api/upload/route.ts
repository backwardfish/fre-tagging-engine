import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { freAssetIndex } from "@/db/schema";
import { tagAsset, parseFilePath } from "@/lib/tagging-engine";
import { IMAGE_EXTENSIONS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const results = [];

    for (const file of files) {
      const fileName = file.name;
      const fileExtension =
        "." + (fileName.split(".").pop() || "").toLowerCase();
      const fileSizeKB = Math.round(file.size / 1024);

      // Check if it's an image for dimensions
      let dimensions: string | null = null;
      const ext = fileExtension.replace(".", "");
      const isImage = (IMAGE_EXTENSIONS as readonly string[]).includes(ext);

      // For images, we could extract dimensions via a library
      // For now, we'll let the AI infer from file name patterns like "1080x1080"
      const dimMatch = fileName.match(/(\d{3,4})x(\d{3,4})/);
      if (dimMatch) {
        dimensions = `${dimMatch[1]}x${dimMatch[2]}`;
      }

      const pathInfo = parseFilePath(fileName);

      // Call AI tagging
      let tagResult;
      try {
        tagResult = await tagAsset({
          fileName,
          filePath: `/${fileName}`,
          fileExtension,
          fileSizeKB,
          dimensions,
          folderName: "Uploads",
          parentFolderName: "Local",
        });
      } catch (aiError) {
        console.error("AI tagging failed, using defaults:", aiError);
        tagResult = {
          assetType: isImage ? "Photo" : "Document",
          productLine: ["FRE Core"],
          flavor: ["N/A"],
          nicotineStrength: ["N/A"],
          packFormat: "N/A",
          contentTheme: ["Product Shot"],
          setting: ["N/A"],
          campaign: null,
          usageRights: "Unlimited Internal",
          description: `Uploaded file: ${fileName}`,
          confidence: 30,
          reviewStatus: "Pending Review",
        };
      }

      // Convert the uploaded file to a data URL for thumbnail (images only)
      let thumbnailUrl: string | null = null;
      if (isImage && file.size < 5 * 1024 * 1024) {
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString("base64");
        const mimeType =
          ext === "svg"
            ? "image/svg+xml"
            : ext === "png"
              ? "image/png"
              : ext === "gif"
                ? "image/gif"
                : ext === "webp"
                  ? "image/webp"
                  : "image/jpeg";
        thumbnailUrl = `data:${mimeType};base64,${base64}`;
      }

      // Save to database
      const [asset] = await db
        .insert(freAssetIndex)
        .values({
          fileName,
          fileFormat: ext,
          fileSizeKB,
          dimensions,
          thumbnailUrl,
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
        })
        .returning();

      results.push(asset);
    }

    return NextResponse.json({ assets: results, count: results.length });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}
