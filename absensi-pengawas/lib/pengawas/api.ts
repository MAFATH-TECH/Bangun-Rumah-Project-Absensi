import supabase from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/types/supabase';
import { todayDateString } from './dateUtils';
import { mergeSlotConfig } from './slotUtils';
import type { SlotNumber } from './constants';
import { getServerNow, validateSlotUploadServer } from './serverTime';
import { uploadToStorage } from '@/lib/utils/uploadHelper';

export type FotoProgress = Tables<'foto_progress_harian'>;
export type LaporanProgress = Tables<'laporan_progress'>;
export type AbsensiHarian = Tables<'absensi_harian'>;
export type SopPengawas = Tables<'sop_pengawas'>;

export async function fetchSlotConfig() {
  const { data, error } = await supabase.from('konfigurasi_slot').select('*').order('slot');
  return { config: mergeSlotConfig(data), error };
}

export async function fetchActiveSop(): Promise<SopPengawas | null> {
  const { data } = await supabase
    .from('sop_pengawas')
    .select('*')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('berlaku_mulai', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function hasAcknowledgedSopToday(
  pengawasId: string,
  sopId: string,
): Promise<boolean> {
  const tanggal = todayDateString();
  const { data } = await supabase
    .from('sop_acknowledgment')
    .select('id')
    .eq('pengawas_id', pengawasId)
    .eq('sop_id', sopId)
    .eq('tanggal', tanggal)
    .maybeSingle();
  return Boolean(data);
}

export async function acknowledgeSop(pengawasId: string, sopId: string) {
  const tanggal = todayDateString();
  const payload: TablesInsert<'sop_acknowledgment'> = {
    pengawas_id: pengawasId,
    sop_id: sopId,
    tanggal,
    acknowledged_at: new Date().toISOString(),
  };
  const existing = await hasAcknowledgedSopToday(pengawasId, sopId);
  if (existing) return { data: null, error: null };
  return supabase.from('sop_acknowledgment').insert(payload);
}

export async function fetchFotoProgressHariIni(pengawasId: string) {
  const tanggal = todayDateString();
  const { data, error } = await supabase
    .from('foto_progress_harian')
    .select('*')
    .eq('pengawas_id', pengawasId)
    .eq('tanggal', tanggal)
    .order('slot')
    .order('urutan_foto');
  return { data: data ?? [], error };
}

export async function fetchAbsensiHariIni(pengawasId: string) {
  const tanggal = todayDateString();
  const { data } = await supabase
    .from('absensi_harian')
    .select('*')
    .eq('pengawas_id', pengawasId)
    .eq('tanggal', tanggal)
    .maybeSingle();
  return data;
}

export async function fetchLaporanHariIni(pengawasId: string) {
  const tanggal = todayDateString();
  const { data } = await supabase
    .from('laporan_progress')
    .select('*')
    .eq('pengawas_id', pengawasId)
    .eq('tanggal', tanggal)
    .maybeSingle();
  return data;
}

export async function deleteFotoProgress(fotoId: string) {
  return supabase.from('foto_progress_harian').delete().eq('id', fotoId);
}

export async function uploadFotoSlot(params: {
  pengawasId: string;
  pengawasNama: string;
  slot: SlotNumber;
  urutanFoto: number;
  localUri: string;
  latitude: number | null;
  longitude: number | null;
}) {
  const validation = await validateSlotUploadServer(params.slot);
  if (!validation.valid) {
    return { error: validation.reason ?? 'Di luar jam slot' };
  }

  const serverNow = await getServerNow();
  const tanggal = todayDateString(serverNow);
  const ext = 'jpg';
  const storagePath = `${params.pengawasId}/${tanggal}/slot${params.slot}_${params.urutanFoto}.${ext}`;

  const uploaded = await uploadToStorage('foto-progress', storagePath, params.localUri);
  if ('error' in uploaded) {
    return { error: uploaded.error };
  }

  const row: TablesInsert<'foto_progress_harian'> = {
    pengawas_id: params.pengawasId,
    tanggal,
    slot: params.slot,
    urutan_foto: params.urutanFoto,
    foto_url: uploaded.publicUrl,
    latitude: params.latitude,
    longitude: params.longitude,
    captured_at: serverNow.toISOString(),
  };

  const { data, error } = await supabase
    .from('foto_progress_harian')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    return { error: error.message };
  }
  return { data };
}

export function groupFotoIdsBySlot(fotos: FotoProgress[]) {
  const slot1 = fotos.filter((f) => f.slot === 1).map((f) => f.id);
  const slot2 = fotos.filter((f) => f.slot === 2).map((f) => f.id);
  const slot3 = fotos.filter((f) => f.slot === 3).map((f) => f.id);
  return { slot1, slot2, slot3 };
}

export async function submitKehadiranDanLaporan(params: {
  pengawasId: string;
  selfieUri: string;
  latitude: number | null;
  longitude: number | null;
  fotos: FotoProgress[];
}) {
  const serverNow = await getServerNow();
  const tanggal = todayDateString(serverNow);
  const ext = 'jpg';
  const selfiePath = `${params.pengawasId}/${tanggal}/selfie.${ext}`;

  const uploaded = await uploadToStorage(
    'foto-selfie-absensi',
    selfiePath,
    params.selfieUri,
  );
  if ('error' in uploaded) {
    return { error: uploaded.error };
  }

  const absensiPayload: TablesInsert<'absensi_harian'> = {
    pengawas_id: params.pengawasId,
    tanggal,
    selfie_url: uploaded.publicUrl,
    latitude: params.latitude,
    longitude: params.longitude,
    status: 'hadir',
    submit_at: serverNow.toISOString(),
  };

  const { data: absensi, error: absensiError } = await supabase
    .from('absensi_harian')
    .insert(absensiPayload)
    .select('*')
    .single();

  if (absensiError) {
    return { error: absensiError.message };
  }

  const { slot1, slot2, slot3 } = groupFotoIdsBySlot(params.fotos);
  const laporanPayload: TablesInsert<'laporan_progress'> = {
    pengawas_id: params.pengawasId,
    tanggal,
    absensi_id: absensi.id,
    selfie_url: uploaded.publicUrl,
    slot1_foto_ids: slot1,
    slot2_foto_ids: slot2,
    slot3_foto_ids: slot3,
    status: 'draft',
    deskripsi: null,
    kendala: null,
    rekomendasi: null,
  };

  const { data: laporan, error: laporanError } = await supabase
    .from('laporan_progress')
    .insert(laporanPayload)
    .select('*')
    .single();

  if (laporanError) {
    return { error: laporanError.message };
  }

  return { absensi, laporan };
}

export async function saveLaporanDraft(
  laporanId: string,
  fields: Pick<TablesInsert<'laporan_progress'>, 'deskripsi' | 'kendala' | 'rekomendasi'>,
) {
  return supabase
    .from('laporan_progress')
    .update({
      ...fields,
      status: 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', laporanId)
    .select('*')
    .single();
}

export async function kirimLaporanKeAdmin(laporanId: string) {
  return supabase
    .from('laporan_progress')
    .update({
      status: 'terkirim',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', laporanId)
    .select('*')
    .single();
}

export async function insertLokasiTracking(
  pengawasId: string,
  latitude: number,
  longitude: number,
  akurasi?: number | null,
) {
  const payload: TablesInsert<'lokasi_tracking'> = {
    pengawas_id: pengawasId,
    latitude,
    longitude,
    akurasi: akurasi ?? null,
    timestamp: new Date().toISOString(),
  };
  return supabase.from('lokasi_tracking').insert(payload);
}

export async function fetchRiwayat30Hari(pengawasId: string) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  const startStr = start.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

  const [absensiRes, laporanRes, fotoRes] = await Promise.all([
    supabase
      .from('absensi_harian')
      .select('*')
      .eq('pengawas_id', pengawasId)
      .gte('tanggal', startStr)
      .order('tanggal', { ascending: false }),
    supabase
      .from('laporan_progress')
      .select('*')
      .eq('pengawas_id', pengawasId)
      .gte('tanggal', startStr)
      .order('tanggal', { ascending: false }),
    supabase
      .from('foto_progress_harian')
      .select('*')
      .eq('pengawas_id', pengawasId)
      .gte('tanggal', startStr),
  ]);

  return {
    absensi: absensiRes.data ?? [],
    laporan: laporanRes.data ?? [],
    fotos: fotoRes.data ?? [],
  };
}

export async function fetchRiwayatDetail(pengawasId: string, tanggal: string) {
  const [absensi, laporan, fotos] = await Promise.all([
    supabase
      .from('absensi_harian')
      .select('*')
      .eq('pengawas_id', pengawasId)
      .eq('tanggal', tanggal)
      .maybeSingle(),
    supabase
      .from('laporan_progress')
      .select('*')
      .eq('pengawas_id', pengawasId)
      .eq('tanggal', tanggal)
      .maybeSingle(),
    supabase
      .from('foto_progress_harian')
      .select('*')
      .eq('pengawas_id', pengawasId)
      .eq('tanggal', tanggal)
      .order('slot')
      .order('urutan_foto'),
  ]);

  return {
    absensi: absensi.data,
    laporan: laporan.data,
    fotos: fotos.data ?? [],
  };
}
