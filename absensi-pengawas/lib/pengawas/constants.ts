import type { Tables } from '@/types/supabase';

export type SlotNumber = 1 | 2 | 3;
export type SlotUiStatus = 'waiting' | 'active' | 'done' | 'locked';

export const MAX_FOTO_PER_SLOT = 3;

export const DEFAULT_SLOT_CONFIG: Pick<
  Tables<'konfigurasi_slot'>,
  'slot' | 'nama_slot' | 'jam_mulai' | 'jam_selesai'
>[] = [
  { slot: 1, nama_slot: 'Pagi', jam_mulai: '08:00:00', jam_selesai: '09:00:00' },
  { slot: 2, nama_slot: 'Siang', jam_mulai: '11:00:00', jam_selesai: '14:00:00' },
  { slot: 3, nama_slot: 'Sore', jam_mulai: '16:00:00', jam_selesai: '17:30:00' },
];

export const JAKARTA_TZ = 'Asia/Jakarta';
