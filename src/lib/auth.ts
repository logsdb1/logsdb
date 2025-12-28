import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { getUserRole, Role } from "./authorization";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username: string;
      role: Role;
    };
    // accessToken is kept for server-side API calls but we need
    // to access it via getServerSession, not client session
    accessToken?: string;
  }

  interface Profile {
    login?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    username?: string;
    role?: Role;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email public_repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Store access token server-side only
        token.accessToken = account.access_token;
        token.username = profile.login || "";
        token.role = getUserRole(profile.login);
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info to session (safe for client)
      if (session.user) {
        session.user.username = token.username || "";
        session.user.role = token.role || "user";
      }
      // Keep accessToken for server-side use via getServerSession
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
