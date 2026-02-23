import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { systemSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const settings = await db.select().from(systemSettings);

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({
      operatingMode: settingsMap["operating_mode"] || "Calibration",
      confidenceThresholdAuto: parseInt(
        settingsMap["confidence_threshold_auto"] || "85"
      ),
      confidenceThresholdReview: parseInt(
        settingsMap["confidence_threshold_review"] || "60"
      ),
      correctionPatterns: settingsMap["correction_patterns"] || "",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({
      operatingMode: "Calibration",
      confidenceThresholdAuto: 85,
      confidenceThresholdReview: 60,
      correctionPatterns: "",
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    for (const [key, value] of Object.entries(body)) {
      const stringValue = typeof value === "string" ? value : JSON.stringify(value);

      await db
        .insert(systemSettings)
        .values({ key, value: stringValue })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: { value: stringValue, updatedAt: new Date() },
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
