import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { freAssetIndex } from "@/db/schema";
import { eq, asc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const [assets, totalResult] = await Promise.all([
      db
        .select()
        .from(freAssetIndex)
        .where(eq(freAssetIndex.reviewStatus, "Pending Review"))
        .orderBy(asc(freAssetIndex.confidenceScore))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(freAssetIndex)
        .where(eq(freAssetIndex.reviewStatus, "Pending Review")),
    ]);

    return NextResponse.json({
      assets,
      pagination: {
        page,
        limit,
        total: totalResult[0]?.count ?? 0,
        totalPages: Math.ceil((totalResult[0]?.count ?? 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching review queue:", error);
    return NextResponse.json(
      { error: "Failed to fetch review queue" },
      { status: 500 }
    );
  }
}
