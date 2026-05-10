import { SesiAbsensi } from '@/lib/types';

type SesiConfig = {
  start: string;
  end: string;
};

export const SESI_CONFIG: Record<SesiAbsensi, SesiConfig> = {
  pagi: { start: '06:00', end: '09:00' },
  siang: { start: '11:00', end: '14:00' },
  sore: { start: '15:00', end: '18:00' },
};

export const RADIUS_DEFAULT_METER = 500;
export const MAX_FOTO_LAPORAN = 5;
export const MAX_FOTO_NOTA = 3;

export const KATEGORI_MATERIAL = [
  'semen',
  'pasir',
  'batu',
  'besi',
  'kayu',
  'cat',
  'listrik',
  'pipa',
  'lainnya',
] as const;
