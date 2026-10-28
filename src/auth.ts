import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAdminGithubId } from "@/lib/admin/allowlist";

declare module "next-auth" {
  interface Session {
    /** The GitHub account id the session was issued to. */
    githubId?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    githubId?: string;
  }
}

/**
 * Single-admin sign-in. GitHub proves who someone is; the allowlist (ADMIN_GITHUB_ID, a
 * numeric account id) decides whether they may sign in at all. Every admin page and action
 * checks the allowlist again (see lib/admin/session.ts), so this callback is not the only gate.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  callbacks: {
    signIn({ account }) {
      return account?.provider === "github" && isAdminGithubId(account.providerAccountId);
    },
    jwt({ token, account }) {
      // `account` is only present at sign-in; keep the id on the token afterwards.
      if (account?.provider === "github") token.githubId = account.providerAccountId;
      return token;
    },
    session({ session, token }) {
      session.githubId = token.githubId;
      return session;
    },
  },
});
