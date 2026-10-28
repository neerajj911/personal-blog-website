import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminGithubId } from "@/lib/admin/allowlist";

export interface AdminSession {
  name?: string | null;
  image?: string | null;
}

/** The signed-in admin, or null. Re-checks the allowlist on every call. */
export const getAdmin = cache(async (): Promise<AdminSession | null> => {
  const session = await auth();
  if (!session || !isAdminGithubId(session.githubId)) return null;
  return { name: session.user?.name, image: session.user?.image };
});

/**
 * The gate for every admin page, server action and route handler: call it first, before
 * reading or writing anything. A layout check is not enough (layouts do not re-run on
 * navigation) and a proxy check is only optimistic.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
