import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { HeaderBar } from '@/components/shared/HeaderBar';
import { LaporanLengkapiForm } from '@/components/pengawas/LaporanLengkapiForm';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePengawasRefresh } from '@/lib/hooks/usePengawasRefresh';
import { fetchFotoProgressHariIni, fetchLaporanHariIni } from '@/lib/pengawas/api';
import type { FotoProgress, LaporanProgress } from '@/lib/pengawas/api';

export default function LengkapiLaporanScreen() {
  const { user } = useAuth();
  const refresh = usePengawasRefresh();
  const [laporan, setLaporan] = useState<LaporanProgress | null>(null);
  const [fotos, setFotos] = useState<FotoProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    void (async () => {
      setLoading(true);
      const [l, f] = await Promise.all([
        fetchLaporanHariIni(user.id),
        fetchFotoProgressHariIni(user.id),
      ]);
      setLaporan(l);
      setFotos(f.data);
      setLoading(false);
    })();
  }, [user?.id]);

  if (!loading && !laporan) {
    return <Redirect href="/(pengawas)/beranda" />;
  }

  if (loading || !laporan) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <Text className="text-slate-600">Memuat laporan...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <HeaderBar title="Lengkapi Laporan" />
      <LaporanLengkapiForm
        laporan={laporan}
        fotos={fotos}
        selfieUrl={laporan.selfie_url}
        onSaved={() => {
          void refresh();
          void fetchLaporanHariIni(user!.id).then(setLaporan);
        }}
      />
    </View>
  );
}
