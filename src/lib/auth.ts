import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { verifyEncryptIDToken } from "./encryptid";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    // EncryptID passkey login — sole auth provider
    Credentials({
      id: "encryptid",
      name: "EncryptID Passkey",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) {
          return null;
        }

        // Verify the EncryptID JWT
        const claims = await verifyEncryptIDToken(credentials.token as string);
        if (!claims) {
          return null;
        }

        const did = claims.did || claims.sub;

        // Find existing user by DID or create a new one
        let user = await prisma.user.findFirst({
          where: { did },
        });

        if (!user) {
          // Create new passkey-only user
          user = await prisma.user.create({
            data: {
              email: `${did}@encryptid.local`, // Placeholder email for DID-only users
              did,
              name: claims.username || null,
              credits: 50, // Starting credits
              emailVerified: new Date(),
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
