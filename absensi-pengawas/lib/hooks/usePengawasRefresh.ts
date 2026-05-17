import { useCallback } from 'react';
import {
  fetchAbsensiHariIni,
  fetchFotoProgressHariIni,
  fetchLaporanHariIni,
  fetchSlotConfig,
} from '@/lib/pengawas/api';
import { usePengawasStore } from '@/lib/store/pengawasStore';
import { useAuth } from './useAuth';

export function usePengawasRefresh() {
  const { user } = useAuth();
  const {
    setSlotConfig,
    setFotosHariIni,
    setAbsensiHariIni,
    setLaporanHariIni,
  } = usePengawasStore();

  return useCallback(async () => {
    if (!user?.id) return;
    const [{ config }, fotos, absensi, laporan] = await Promise.all([
      fetchSlotConfig(),
      fetchFotoProgressHariIni(user.id),
      fetchAbsensiHariIni(user.id),
      fetchLaporanHariIni(user.id),
    ]);
    setSlotConfig(config);
    setFotosHariIni(fotos.data);
    setAbsensiHariIni(absensi);
    setLaporanHariIni(laporan);
  }, [user?.id, setSlotConfig, setFotosHariIni, setAbsensiHariIni, setLaporanHariIni]);
}
