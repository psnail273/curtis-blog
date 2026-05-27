import { handlers } from '@/lib/auth';

/**
 * Auth.js v5 route handler for /api/auth/*.
 * Handles all authentication routes including:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/google
 * - /api/auth/session
 */
export const { GET, POST } = handlers;
