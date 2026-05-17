import { Text, View } from 'react-native';
import { usePengawasStore } from '@/lib/store/pengawasStore';

export function LokasiIndicator() {
  const { trackingActive, absensiHariIni } = usePengawasStore();

  if (absensiHariIni) {
    return (
      <View className="mb-4 rounded-xl bg-slate-100 px-4 py-3">
        <Text className="text-sm text-slate-600">Pelacakan GPS dihentikan setelah absensi</Text>
      </View>
    );
  }

  return (
    <View className="mb-4 rounded-xl bg-teal-50 px-4 py-3">
      <Text className="text-sm font-medium text-teal-800">
        {trackingActive ? '📍 GPS aktif — kirim setiap 5 menit' : 'Memulai pelacakan GPS...'}
      </Text>
    </View>
  );
}
