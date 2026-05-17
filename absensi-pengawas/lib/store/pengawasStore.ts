import { create } from 'zustand';
import type { FotoProgress, LaporanProgress, AbsensiHarian } from '@/lib/pengawas/api';
import type { SlotConfig } from '@/lib/pengawas/slotUtils';
import type { SopPengawas } from '@/lib/pengawas/api';

type PengawasState = {
  sopReady: boolean;
  sopVisible: boolean;
  activeSop: SopPengawas | null;
  slotConfig: SlotConfig[];
  fotosHariIni: FotoProgress[];
  absensiHariIni: AbsensiHarian | null;
  laporanHariIni: LaporanProgress | null;
  trackingActive: boolean;
  setSopReady: (ready: boolean) => void;
  setSopVisible: (visible: boolean) => void;
  setActiveSop: (sop: SopPengawas | null) => void;
  setSlotConfig: (config: SlotConfig[]) => void;
  setFotosHariIni: (fotos: FotoProgress[]) => void;
  setAbsensiHariIni: (absensi: AbsensiHarian | null) => void;
  setLaporanHariIni: (laporan: LaporanProgress | null) => void;
  setTrackingActive: (active: boolean) => void;
  reset: () => void;
};

const initial = {
  sopReady: false,
  sopVisible: false,
  activeSop: null,
  slotConfig: [],
  fotosHariIni: [],
  absensiHariIni: null,
  laporanHariIni: null,
  trackingActive: false,
};

export const usePengawasStore = create<PengawasState>((set) => ({
  ...initial,
  setSopReady: (sopReady) => set({ sopReady }),
  setSopVisible: (sopVisible) => set({ sopVisible }),
  setActiveSop: (activeSop) => set({ activeSop }),
  setSlotConfig: (slotConfig) => set({ slotConfig }),
  setFotosHariIni: (fotosHariIni) => set({ fotosHariIni }),
  setAbsensiHariIni: (absensiHariIni) => set({ absensiHariIni }),
  setLaporanHariIni: (laporanHariIni) => set({ laporanHariIni }),
  setTrackingActive: (trackingActive) => set({ trackingActive }),
  reset: () => set(initial),
}));
