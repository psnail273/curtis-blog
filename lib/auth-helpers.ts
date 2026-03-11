import { auth } from '@/lib/auth';

/**
 * Get the current authenticated user session.
 * Returns the session if authenticated, null otherwise.
 * Use this in Server Components and API routes.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Require authentication for an API route or Server Component.
 * Throws an error with 401 status if not authenticated.
 * Returns the authenticated user if successful.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
