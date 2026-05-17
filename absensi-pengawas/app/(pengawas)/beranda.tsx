import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { HeaderBar } from '@/components/shared/HeaderBar';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { LiveCameraModal } from '@/components/pengawas/LiveCameraModal';
import { SelfieVerificationModal } from '@/components/pengawas/SelfieVerificationModal';
import { SlotCard } from '@/components/pengawas/SlotCard';
import { LokasiIndicator } from '@/components/pengawas/LokasiIndicator';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePengawasRefresh } from '@/lib/hooks/usePengawasRefresh';
import {
  deleteFotoProgress,
  submitKehadiranDanLaporan,
  uploadFotoSlot,
} from '@/lib/pengawas/api';
import type { SlotNumber } from '@/lib/pengawas/constants';
import { getPengawasDisplayName } from '@/lib/pengawas/displayName';
import { stopPengawasTracking } from '@/lib/pengawas/tracking';
import { usePengawasStore } from '@/lib/store/pengawasStore';
import supabase from '@/lib/supabase';
import type { Tables } from '@/types/supabase';

export default function PengawasBerandaScreen() {
  const { user } = useAuth();
  const refresh = usePengawasRefresh();
  const {
    slotConfig,
    fotosHariIni,
    absensiHariIni,
    setTrackingActive,
  } = usePengawasStore();

  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [activeSlot, setActiveSlot] = useState<SlotNumber | null>(null);
  const [selfieOpen, setSelfieOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const pengawasNama = getPengawasDisplayName(profile);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
  }, [user?.id]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const fotosBySlot = useMemo(() => {
    const map: Record<number, typeof fotosHariIni> = { 1: [], 2: [], 3: [] };
    for (const f of fotosHariIni) {
      map[f.slot]?.push(f);
    }
    return map;
  }, [fotosHariIni]);

  const slot1Ok = (fotosBySlot[1]?.length ?? 0) >= 1;
  const slot2Ok = (fotosBySlot[2]?.length ?? 0) >= 1;
  const slot3Ok = (fotosBySlot[3]?.length ?? 0) >= 1;
  const canSubmit = slot1Ok && slot2Ok && slot3Ok && !absensiHariIni;

  const nextUrutan = (slot: SlotNumber) => (fotosBySlot[slot]?.length ?? 0) + 1;

  const handleUpload = async (
    uri: string,
    lat: number | null,
    lng: number | null,
  ) => {
    if (!user?.id || !activeSlot) return;
    setBusy(true);
    const result = await uploadFotoSlot({
      pengawasId: user.id,
      pengawasNama,
      slot: activeSlot,
      urutanFoto: nextUrutan(activeSlot),
      localUri: uri,
      latitude: lat,
      longitude: lng,
    });
    setBusy(false);
    if ('error' in result && result.error) {
      Toast.show({ type: 'error', text1: 'Upload ditolak', text2: result.error });
      return;
    }
    Toast.show({ type: 'success', text1: 'Foto berhasil diupload' });
    setActiveSlot(null);
    await refresh();
  };

  const handleDelete = async (fotoId: string) => {
    setBusy(true);
    const { error } = await deleteFotoProgress(fotoId);
    setBusy(false);
    if (error) {
      Toast.show({ type: 'error', text1: 'Gagal menghapus foto', text2: error.message });
      return;
    }
    await refresh();
  };

  const handleSelfieConfirm = async (
    uri: string,
    lat: number | null,
    lng: number | null,
  ) => {
    if (!user?.id) return;
    setBusy(true);
    const result = await submitKehadiranDanLaporan({
      pengawasId: user.id,
      selfieUri: uri,
      latitude: lat,
      longitude: lng,
      fotos: fotosHariIni,
    });
    setBusy(false);
    if ('error' in result && result.error) {
      Toast.show({ type: 'error', text1: 'Submit gagal', text2: result.error });
      return;
    }
    await stopPengawasTracking();
    setTrackingActive(false);
    Toast.show({ type: 'success', text1: 'Kehadiran tercatat', text2: 'Lengkapi laporan Anda' });
    setSelfieOpen(false);
    await refresh();
    router.push('/(pengawas)/lengkapi-laporan');
  };

  return (
    <View className="flex-1 bg-slate-50">
      <HeaderBar title="Beranda Pengawas" subtitle="Upload foto progress per slot" />
      <ScrollView className="flex-1 px-4 pb-28" showsVerticalScrollIndicator={false}>
        <LokasiIndicator />
        <Text className="mb-4 text-sm text-slate-600">
          Hadir & laporan progress otomatis setelah 3 slot foto + selfie verifikasi.
        </Text>

        {slotConfig.map((cfg) => (
          <SlotCard
            key={cfg.slot}
            config={cfg}
            fotos={fotosBySlot[cfg.slot] ?? []}
            absensiSubmitted={Boolean(absensiHariIni)}
            onUploadPress={(slot) => setActiveSlot(slot)}
            onDeleteFoto={handleDelete}
          />
        ))}

        {absensiHariIni ? (
          <View className="rounded-xl bg-teal-50 p-4">
            <Text className="font-semibold text-teal-800">✓ Kehadiran hari ini sudah dikirim</Text>
            <Button
              label="Lengkapi / Lihat Laporan"
              className="mt-3"
              onPress={() => router.push('/(pengawas)/lengkapi-laporan')}
            />
          </View>
        ) : (
          <Button
            label="Submit & Buat Laporan"
            disabled={!canSubmit}
            onPress={() => setSelfieOpen(true)}
          />
        )}

        {!canSubmit && !absensiHariIni ? (
          <Text className="mt-2 text-center text-xs text-slate-500">
            Minimal 1 foto per slot (Pagi, Siang, Sore) untuk mengaktifkan submit
          </Text>
        ) : null}
      </ScrollView>

      <LiveCameraModal
        visible={activeSlot !== null}
        pengawasNama={pengawasNama}
        title={`Foto Live — Slot ${activeSlot ?? ''}`}
        onClose={() => setActiveSlot(null)}
        onConfirm={handleUpload}
      />

      <SelfieVerificationModal
        visible={selfieOpen}
        pengawasNama={pengawasNama}
        onClose={() => setSelfieOpen(false)}
        onConfirm={handleSelfieConfirm}
      />

      <LoadingOverlay visible={busy} />
    </View>
  );
}
