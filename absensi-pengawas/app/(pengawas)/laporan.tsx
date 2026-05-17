import { Redirect } from 'expo-router';
import { usePengawasStore } from '@/lib/store/pengawasStore';

export default function PengawasLaporanScreen() {
  const { absensiHariIni, laporanHariIni } = usePengawasStore();

  if (absensiHariIni || laporanHariIni) {
    return <Redirect href="/(pengawas)/lengkapi-laporan" />;
  }

  return <Redirect href="/(pengawas)/beranda" />;
}
