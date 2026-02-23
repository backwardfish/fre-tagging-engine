import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { monitoredFolders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const folders = await db.select().from(monitoredFolders);
    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const [folder] = await db
      .insert(monitoredFolders)
      .values({
        dropboxPath: body.dropboxPath,
        displayName: body.displayName || body.dropboxPath.split("/").pop() || "Folder",
        isActive: true,
      })
      .returning();

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Error adding folder:", error);
    return NextResponse.json(
      { error: "Failed to add folder" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { folderId } = body;

    await db
      .delete(monitoredFolders)
      .where(eq(monitoredFolders.id, folderId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing folder:", error);
    return NextResponse.json(
      { error: "Failed to remove folder" },
      { status: 500 }
    );
  }
}
