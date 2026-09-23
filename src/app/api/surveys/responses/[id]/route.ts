import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await db.surveyResponse.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Respuesta eliminada" });
  } catch (error) {
    console.error("Error deleting survey response:", error);
    return NextResponse.json({ error: "Failed to delete response" }, { status: 500 });
  }
}
