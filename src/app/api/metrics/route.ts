import { NextResponse } from "next/server";
import { db } from "@/db";
import { freAssetIndex, tagCorrectionLog } from "@/db/schema";
import { eq, count, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const [
      totalResult,
      pendingResult,
      approvedResult,
      correctedResult,
      recentActivity,
    ] = await Promise.all([
      db.select({ count: count() }).from(freAssetIndex),
      db
        .select({ count: count() })
        .from(freAssetIndex)
        .where(eq(freAssetIndex.reviewStatus, "Pending Review")),
      db
        .select({ count: count() })
        .from(freAssetIndex)
        .where(eq(freAssetIndex.reviewStatus, "Approved")),
      db
        .select({ count: count() })
        .from(freAssetIndex)
        .where(eq(freAssetIndex.reviewStatus, "Corrected")),
      db
        .select()
        .from(tagCorrectionLog)
        .orderBy(desc(tagCorrectionLog.createdAt))
        .limit(10),
    ]);

    const total = totalResult[0]?.count ?? 0;
    const pending = pendingResult[0]?.count ?? 0;
    const approved = approvedResult[0]?.count ?? 0;
    const corrected = correctedResult[0]?.count ?? 0;

    const reviewed = approved + corrected;
    const accuracyRate = reviewed > 0 ? (approved / reviewed) * 100 : 0;

    return NextResponse.json({
      totalAssets: total,
      pendingReview: pending,
      approved,
      corrected,
      accuracyRate,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        fileName: a.fileName || "Unknown",
        action: a.reviewAction,
        createdAt: a.createdAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({
      totalAssets: 0,
      pendingReview: 0,
      approved: 0,
      corrected: 0,
      accuracyRate: 0,
      recentActivity: [],
    });
  }
}
