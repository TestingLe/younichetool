import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

async function refreshAccessToken(token: {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken!,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }

      // Return previous token if not expired (with 5 minute buffer)
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000 - 300000) {
        return token;
      }

      // Token expired, try to refresh
      console.log('Access token expired, refreshing...');
      return refreshAccessToken(token as {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
      });
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string,
        error: token.error,
      };
    },
  },
  pages: {
    signIn: '/',
  },
};

