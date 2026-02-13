import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
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
    // Email + password login
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),

    // EncryptID passkey login
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
