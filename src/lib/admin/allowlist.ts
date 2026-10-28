/**
 * The one account allowed into the admin panel, by numeric GitHub id (logins can be renamed
 * and reused; ids cannot). Unset or malformed means nobody is allowed: it fails closed.
 * No `server-only` import so proxy.ts can share it; it reads a server-side variable only.
 */
export function isAdminGithubId(id: string | undefined): boolean {
  const allowed = process.env.ADMIN_GITHUB_ID?.trim();
  return Boolean(id && allowed && /^\d+$/.test(allowed) && id === allowed);
}
