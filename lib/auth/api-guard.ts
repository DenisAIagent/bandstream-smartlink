import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Verify that the request is authenticated and the user has admin privileges.
 * Returns the session if authorized, or a NextResponse error if not.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }

  // Check role from session (set in JWT callback)
  const role = (session.user as { role?: string }).role;
  if (!role || !["OWNER", "ADMIN"].includes(role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), session: null };
  }

  return { error: null, session };
}

/**
 * Verify that the request is authenticated (any role).
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }

  return { error: null, session };
}
