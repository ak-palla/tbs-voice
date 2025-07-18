import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@/utils/supabase/server';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/analytics.readonly',
            'https://www.googleapis.com/auth/analytics.manage.users.readonly'
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && account.access_token) {
        try {
          const supabase = await createClient();
          
          // Get the current user from Supabase
          const { data: { user: supabaseUser } } = await supabase.auth.getUser();
          
          if (supabaseUser) {
            // Store or update the Google Analytics tokens
            const { error } = await supabase
              .from('google_analytics_tokens')
              .upsert({
                user_id: supabaseUser.id,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at ? new Date(account.expires_at * 1000).toISOString() : null,
                scope: account.scope,
                token_type: account.token_type,
                account_name: profile?.email || user.email,
              });
            
            if (error) {
              console.error('Error storing Google Analytics tokens:', error);
              return false;
            }
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}; 