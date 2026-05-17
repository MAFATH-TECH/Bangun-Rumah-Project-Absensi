import type { Tables } from '@/types/supabase';

export function getPengawasDisplayName(
  profile: Tables<'profiles'> | { full_name?: string; nama_lengkap?: string } | null,
): string {
  if (!profile) return 'Pengawas';
  if ('full_name' in profile && profile.full_name) return profile.full_name;
  if ('nama_lengkap' in profile && profile.nama_lengkap) return profile.nama_lengkap;
  return 'Pengawas';
}
