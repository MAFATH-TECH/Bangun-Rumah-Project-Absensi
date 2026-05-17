import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { HeaderBar } from '@/components/shared/HeaderBar';
import { LaporanLengkapiForm } from '@/components/pengawas/LaporanLengkapiForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { fetchRiwayatDetail } from '@/lib/pengawas/api';
import type { AbsensiHarian, FotoProgress, LaporanProgress } from '@/lib/pengawas/api';

export default function RiwayatDetailScreen() {
  const { tanggal } = useLocalSearchParams<{ tanggal: string }>();
  const { user } = useAuth();
  const [absensi, setAbsensi] = useState<AbsensiHarian | null>(null);
  const [laporan, setLaporan] = useState<LaporanProgress | null>(null);
  const [fotos, setFotos] = useState<FotoProgress[]>([]);

  useEffect(() => {
    if (!user?.id || !tanggal) return;
    void fetchRiwayatDetail(user.id, tanggal).then((res) => {
      setAbsensi(res.absensi ?? null);
      setLaporan(res.laporan ?? null);
      setFotos(res.fotos);
    });
  }, [user?.id, tanggal]);

  return (
    <View className="flex-1 bg-slate-50">
      <HeaderBar title="Detail Riwayat" subtitle={tanggal} />
      {absensi ? (
        <View className="mx-4 mb-2 rounded-xl bg-teal-50 p-3">
          <Text className="font-semibold text-teal-900">
            Status: {absensi.status ?? '—'}
          </Text>
          <Text className="text-sm text-teal-800">
            Submit:{' '}
            {absensi.submit_at
              ? new Date(absensi.submit_at).toLocaleString('id-ID')
              : '—'}
          </Text>
        </View>
      ) : (
        <Text className="mx-4 mb-2 text-red-600">Tidak hadir / belum submit</Text>
      )}
      {laporan ? (
        <LaporanLengkapiForm
          laporan={laporan}
          fotos={fotos}
          selfieUrl={laporan.selfie_url ?? absensi?.selfie_url}
          readOnly
          onSaved={() => {}}
        />
      ) : (
        <Text className="px-4 text-slate-600">Belum ada laporan untuk tanggal ini.</Text>
      )}
    </View>
  );
}
