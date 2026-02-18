import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import { getDb } from '@/lib/db';

/**
 * Extend the built-in session types to include our custom userId field.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

/**
 * Auth.js v5 configuration with Google OAuth provider.
 * Uses JWT session strategy (no separate session table).
 * Syncs Google profile data into our users table on sign-in.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    /**
     * Upsert user into our database on sign-in.
     * Creates a new user record or updates existing one with latest profile data.
     */
    async signIn({ user, account }) {
      if (!account || !user.email) {
        return false;
      }

      try {
        const sql = getDb();

        // Upsert user into our users table
        await sql`
          INSERT INTO users (name, email, image, provider, provider_id)
          VALUES (
            ${user.name || 'Anonymous'},
            ${user.email},
            ${user.image},
            ${account.provider},
            ${account.providerAccountId}
          )
          ON CONFLICT (email)
          DO UPDATE SET
            name = EXCLUDED.name,
            image = EXCLUDED.image,
            provider = EXCLUDED.provider,
            provider_id = EXCLUDED.provider_id
        `;

        return true;
      } catch (error) {
        console.error('Error upserting user:', error);
        return false;
      }
    },

    /**
     * Attach our database user ID to the JWT token.
     * Fetches the user from our database and adds the UUID to the token.
     */
    async jwt({ token, user }) {
      if (user) {
        try {
          const sql = getDb();
          const rows = await sql`
            SELECT id FROM users WHERE email = ${user.email}
          `;

          if (rows.length > 0) {
            token.userId = rows[0].id;
          }
        } catch (error) {
          console.error('Error fetching user ID:', error);
        }
      }
      return token;
    },

    /**
     * Expose the database user ID on the session object.
     * Makes it available to client components via useSession().
     */
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
