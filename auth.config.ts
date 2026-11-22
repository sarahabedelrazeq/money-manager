import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * DB-free part of the Auth.js config. Used by `proxy.ts` (optimistic redirects)
 * and extended in `auth.ts` with the database adapter.
 */
export default {
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    // Runs in proxy.ts. Only a quick redirect check; real authorization
    // happens in app/lib/dal.ts next to the data.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnLogin) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/transactions", nextUrl));
        }
        return true;
      }
      return isLoggedIn; // false → redirect to pages.signIn
    },
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
