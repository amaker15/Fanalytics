import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

/**
 * Check if user has basic permissions (authenticated users)
 * Limited permissions: can view content but may have restricted features
 */
export async function hasBasicPermissions(): Promise<boolean> {
  return await isAuthenticated();
}

/**
 * Check if user has full permissions (for future premium features)
 * Currently same as basic, but can be extended
 */
export async function hasFullPermissions(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // For now, all authenticated users have full permissions
  // In the future, this can check for premium subscription, admin role, etc.
  return true;
}

