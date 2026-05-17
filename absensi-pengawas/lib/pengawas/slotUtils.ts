import type { Tables } from '@/types/supabase';
import { DEFAULT_SLOT_CONFIG, type SlotNumber, type SlotUiStatus } from './constants';
import { formatJamRange, todayDateString } from './dateUtils';

export type SlotConfig = Pick<
  Tables<'konfigurasi_slot'>,
  'slot' | 'nama_slot' | 'jam_mulai' | 'jam_selesai'
>;

export function mergeSlotConfig(
  rows: Tables<'konfigurasi_slot'>[] | null | undefined,
): SlotConfig[] {
  const map = new Map<number, SlotConfig>();
  for (const fallback of DEFAULT_SLOT_CONFIG) {
    map.set(fallback.slot, fallback);
  }
  for (const row of rows ?? []) {
    map.set(row.slot, {
      slot: row.slot,
      nama_slot: row.nama_slot,
      jam_mulai: row.jam_mulai,
      jam_selesai: row.jam_selesai,
    });
  }
  return [...map.values()].sort((a, b) => a.slot - b.slot);
}

function buildSlotBoundary(
  dateStr: string,
  time: string,
  reference: Date,
): Date {
  const [h, m, s = '0'] = time.split(':');
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] ?? reference.getFullYear();
  const month = (parts[1] ?? 1) - 1;
  const day = parts[2] ?? 1;
  return new Date(year, month, day, Number(h), Number(m), Number(s), 0);
}

export function getSlotUiStatus(
  slot: SlotNumber,
  config: SlotConfig,
  now: Date,
  fotoCount: number,
  absensiSubmitted: boolean,
): SlotUiStatus {
  const dateStr = todayDateString(now);
  const start = buildSlotBoundary(dateStr, config.jam_mulai, now);
  const end = buildSlotBoundary(dateStr, config.jam_selesai, now);

  if (fotoCount > 0) {
    if (now > end || absensiSubmitted) return 'locked';
    return 'done';
  }

  if (now < start) return 'waiting';
  if (now >= start && now <= end) return 'active';
  return 'locked';
}

export function slotAvailabilityLabel(
  status: SlotUiStatus,
  config: SlotConfig,
): string {
  if (status === 'waiting') {
    return `Tersedia pukul ${formatJamRange(config.jam_mulai, config.jam_selesai)}`;
  }
  if (status === 'locked') {
    return 'Waktu slot telah berakhir';
  }
  return '';
}
