import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { freAssetIndex } from "@/db/schema";
import { desc, asc, eq, ilike, sql, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "dateIndexed";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const offset = (page - 1) * limit;

    const conditions = [];
    if (status) {
      conditions.push(eq(freAssetIndex.reviewStatus, status as typeof freAssetIndex.reviewStatus.enumValues[number]));
    }
    if (search) {
      conditions.push(ilike(freAssetIndex.fileName, `%${search}%`));
    }

    const where = conditions.length > 0
      ? sql`${sql.join(conditions, sql` AND `)}`
      : undefined;

    const sortColumn =
      sortBy === "confidenceScore"
        ? freAssetIndex.confidenceScore
        : sortBy === "fileName"
          ? freAssetIndex.fileName
          : freAssetIndex.dateIndexed;

    const orderFn = sortOrder === "asc" ? asc : desc;

    const [assets, totalResult] = await Promise.all([
      db
        .select()
        .from(freAssetIndex)
        .where(where)
        .orderBy(orderFn(sortColumn))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(freAssetIndex)
        .where(where),
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
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const [asset] = await db
      .insert(freAssetIndex)
      .values({
        fileName: body.fileName,
        fileFormat: body.fileFormat,
        fileSizeKB: body.fileSizeKB,
        dimensions: body.dimensions,
        dropboxPath: body.dropboxPath,
        dropboxLink: body.dropboxLink,
        thumbnailUrl: body.thumbnailUrl,
        assetType: body.assetType,
        productLine: body.productLine,
        flavor: body.flavor,
        nicotineStrength: body.nicotineStrength,
        packFormat: body.packFormat,
        contentTheme: body.contentTheme,
        setting: body.setting,
        campaign: body.campaign,
        usageRights: body.usageRights || "Unlimited Internal",
        description: body.description,
        confidenceScore: body.confidenceScore,
        reviewStatus: body.reviewStatus || "Pending Review",
        taggingMethod: body.taggingMethod || "AI-Suggested",
      })
      .returning();

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}
