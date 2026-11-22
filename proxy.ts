import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Uses the DB-free config so the proxy only decodes the JWT cookie.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Everything except Auth.js routes, Next internals and files with an extension.
  matcher: ["/((?!api/auth|_next/static|_next/image|.*\\..*).*)"],
};
