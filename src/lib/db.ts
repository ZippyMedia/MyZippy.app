import { supabase } from './supabase';

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function withUserId<T>(
  fn: (userId: string | null) => Promise<T>
): Promise<T> {
  const userId = await getCurrentUserId();
  return fn(userId);
}
