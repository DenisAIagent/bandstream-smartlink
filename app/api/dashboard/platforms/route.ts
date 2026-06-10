export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/api-guard";

/**
 * Read-only platform catalog for authenticated users.
 * (/api/admin/platforms is OWNER/ADMIN only — the artist wizard and
 * the dashboard edit form need this list for every role.)
 */
export async function GET() {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  try {
    const platforms = await prisma.platform.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        shortname: true,
        logo: true,
        URL: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(platforms);
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
