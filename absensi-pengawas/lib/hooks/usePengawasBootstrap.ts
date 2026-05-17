import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import {
  fetchAbsensiHariIni,
  fetchActiveSop,
  fetchFotoProgressHariIni,
  fetchLaporanHariIni,
  fetchSlotConfig,
  hasAcknowledgedSopToday,
} from '@/lib/pengawas/api';
import { startPengawasTracking, stopPengawasTracking } from '@/lib/pengawas/tracking';
import { usePengawasStore } from '@/lib/store/pengawasStore';
import { useAuth } from './useAuth';

export function usePengawasBootstrap() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const {
    setSopReady,
    setSopVisible,
    setActiveSop,
    setSlotConfig,
    setFotosHariIni,
    setAbsensiHariIni,
    setLaporanHariIni,
    setTrackingActive,
  } = usePengawasStore();

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [{ config }, fotos, absensi, laporan, sop] = await Promise.all([
        fetchSlotConfig(),
        fetchFotoProgressHariIni(user.id),
        fetchAbsensiHariIni(user.id),
        fetchLaporanHariIni(user.id),
        fetchActiveSop(),
      ]);

      setSlotConfig(config);
      setFotosHariIni(fotos.data);
      setAbsensiHariIni(absensi);
      setLaporanHariIni(laporan);
      setActiveSop(sop);

      if (sop) {
        const acknowledged = await hasAcknowledgedSopToday(user.id, sop.id);
        setSopReady(acknowledged);
        setSopVisible(!acknowledged);
      } else {
        setSopReady(true);
        setSopVisible(false);
      }

      if (absensi) {
        await stopPengawasTracking();
        setTrackingActive(false);
      } else {
        const acknowledged = sop
          ? await hasAcknowledgedSopToday(user.id, sop.id)
          : true;
        if (acknowledged) {
          await startPengawasTracking(user.id);
          setTrackingActive(true);
        }
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Gagal memuat data',
        text2: 'Periksa koneksi internet Anda',
      });
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    setSlotConfig,
    setFotosHariIni,
    setAbsensiHariIni,
    setLaporanHariIni,
    setActiveSop,
    setSopReady,
    setSopVisible,
    setTrackingActive,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { loading, refresh };
}
