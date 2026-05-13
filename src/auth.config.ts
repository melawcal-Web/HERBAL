import "./auth-type-augmentations";
import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

/** Edge-safe: no Prisma client / bcrypt. Used by `middleware.ts` only. */
export default {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id;
        session.user.role = (token.role as UserRole) ?? "client";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
