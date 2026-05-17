import supabase from '@/lib/supabase';

export async function clearLocalAuthSession(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Session may already be cleared locally.
  }
}
