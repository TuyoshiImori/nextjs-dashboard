import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // auth ユーザーのセッション
    // request 受信リクエスト
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  // ログインオプションをリストする配列 https://nextjs.org/learn/dashboard-app/adding-authentication#adding-the-credentials-provider
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
