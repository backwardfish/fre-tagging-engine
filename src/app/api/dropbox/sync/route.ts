import { NextResponse } from "next/server";
import { db } from "@/db";
import { monitoredFolders, freAssetIndex } from "@/db/schema";
import { eq } from "drizzle-orm";
import { tagAsset, parseFilePath } from "@/lib/tagging-engine";
import { ALL_SUPPORTED_EXTENSIONS } from "@/lib/constants";

export async function POST() {
  if (!process.env.DROPBOX_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Dropbox access token not configured" },
      { status: 400 }
    );
  }

  try {
    // Dynamically import dropbox to avoid build issues if not installed
    const { Dropbox } = await import("dropbox");
    const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

    const folders = await db
      .select()
      .from(monitoredFolders)
      .where(eq(monitoredFolders.isActive, true));

    let totalNewFiles = 0;
    let totalTagged = 0;
    const errors: string[] = [];

    for (const folder of folders) {
      try {
        const result = await dbx.filesListFolder({
          path: folder.dropboxPath,
          recursive: true,
        });

        const supportedFiles = result.result.entries.filter(
          (entry) =>
            entry[".tag"] === "file" &&
            ALL_SUPPORTED_EXTENSIONS.some((ext) =>
              entry.name.toLowerCase().endsWith(`.${ext}`)
            )
        );

        for (const file of supportedFiles) {
          if (file[".tag"] !== "file") continue;

          // Check if already indexed
          const existing = await db
            .select()
            .from(freAssetIndex)
            .where(eq(freAssetIndex.dropboxPath, file.path_display || ""))
            .limit(1);

          if (existing.length > 0) continue;

          const pathInfo = parseFilePath(file.path_display || file.name);
          const ext = file.name.split(".").pop()?.toLowerCase() || "";

          // Try to get a shared link
          let dropboxLink: string | null = null;
          try {
            const linkResult = await dbx.sharingCreateSharedLinkWithSettings({
              path: file.path_display || file.path_lower || "",
            });
            dropboxLink = linkResult.result.url;
          } catch {
            // Link may already exist or sharing not available
          }

          // Get dimensions from name if possible
          const dimMatch = file.name.match(/(\d{3,4})x(\d{3,4})/);
          const dimensions = dimMatch
            ? `${dimMatch[1]}x${dimMatch[2]}`
            : null;

          // Tag with AI
          let tagResult;
          try {
            tagResult = await tagAsset({
              fileName: file.name,
              filePath: file.path_display || "",
              fileExtension: `.${ext}`,
              fileSizeKB: Math.round((file.size || 0) / 1024),
              dimensions,
              folderName: pathInfo.folderName,
              parentFolderName: pathInfo.parentFolderName,
            });
            totalTagged++;
          } catch {
            tagResult = {
              assetType: "Other",
              productLine: ["FRE Core"],
              flavor: ["N/A"],
              nicotineStrength: ["N/A"],
              packFormat: "N/A",
              contentTheme: ["Product Shot"],
              setting: ["N/A"],
              campaign: null,
              usageRights: "Unlimited Internal",
              description: `Synced from Dropbox: ${file.name}`,
              confidence: 20,
              reviewStatus: "Pending Review",
            };
          }

          await db.insert(freAssetIndex).values({
            fileName: file.name,
            fileFormat: ext,
            fileSizeKB: Math.round((file.size || 0) / 1024),
            dimensions,
            dropboxPath: file.path_display,
            dropboxLink,
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
          });

          totalNewFiles++;
        }

        // Update folder sync stats
        await db
          .update(monitoredFolders)
          .set({
            lastSyncAt: new Date(),
            totalFilesSynced: (folder.totalFilesSynced || 0) + totalNewFiles,
            updatedAt: new Date(),
          })
          .where(eq(monitoredFolders.id, folder.id));
      } catch (folderError) {
        errors.push(
          `${folder.displayName}: ${folderError instanceof Error ? folderError.message : "Unknown error"}`
        );
      }
    }

    return NextResponse.json({
      foldersScanned: folders.length,
      newFilesFound: totalNewFiles,
      filesTagged: totalTagged,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync with Dropbox" },
      { status: 500 }
    );
  }
}
