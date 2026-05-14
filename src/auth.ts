import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { UserRole } from "@prisma/client";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";
import { ensureBootstrapAdmins } from "@/lib/bootstrap-super-admin";

const googleId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...(googleId && googleSecret
      ? [
          Google({
            clientId: googleId,
            clientSecret: googleSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
          create: {
            email: user.email,
            name: user.name ?? "משתמש/ת",
            image: user.image ?? null,
            passwordHash: null,
            role: "client",
          },
        });
      }
      await ensureBootstrapAdmins();
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const row = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true },
        });
        if (row) {
          token.id = row.id;
          token.role = row.role;
        }
      }
      if (user) {
        token.id = user.id;
        token.role = ((user as { role?: UserRole }).role ?? "client") as UserRole;
      }
      if (token.id && typeof token.id === "string") {
        const live = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true },
        });
        if (live) token.role = live.role;
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
});
