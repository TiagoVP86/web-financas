import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/cadastro")

      if (!isLoggedIn && !isAuthRoute) {
        return Response.redirect(new URL("/login", nextUrl))
      }
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
