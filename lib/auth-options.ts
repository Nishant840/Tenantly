import type { AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { userActiveOrgUpdateData } from "@/lib/user-active-org-data";

/** Matches DB + Prisma schema after `activeOrgId` migration (helps TS when the Prisma client is stale in the editor). */
type UserForJwtSync = {
  id: string;
  activeOrgId: string | null;
  orgMemberships: { organizationId: string }[];
};

async function syncUserJwtFromDb(token: JWT, email: string) {
  const dbUser = (await prisma.user.findUnique({
    where: { email },
    include: {
      orgMemberships: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { organizationId: true },
      },
    },
  })) as UserForJwtSync | null;

  if (!dbUser) {
    return token;
  }

  token.id = dbUser.id;

  let activeOrgId = dbUser.activeOrgId;
  if (!activeOrgId && dbUser.orgMemberships[0]) {
    activeOrgId = dbUser.orgMemberships[0].organizationId;
    await prisma.user.update({
      where: { id: dbUser.id },
      data: userActiveOrgUpdateData(activeOrgId),
    });
  }

  token.activeOrgId = activeOrgId ?? null;
  return token;
}

const authOptions: AuthOptions = {
  // @ts-ignore - trustHost exists at runtime but missing from v4 types
  trustHost: true,
  pages: {
    signIn: "/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          name: user.name,
        },
      });

      return true;
    },
    async jwt({ token, user, trigger }) {
      const email = user?.email ?? token.email;
      if (!email || typeof email !== "string") {
        return token;
      }

      if (user) {
        token.email = email;
      }

      if (
        trigger === "update" ||
        user ||
        token.id === undefined ||
        token.activeOrgId === undefined
      ) {
        return syncUserJwtFromDb(token, email);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.activeOrgId =
          token.activeOrgId === undefined ? null : token.activeOrgId;
      }
      return session;
    },
  },
};

export default authOptions;
