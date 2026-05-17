import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { HeaderBar } from '@/components/shared/HeaderBar';
import { useAuth } from '@/lib/hooks/useAuth';
import { fetchRiwayat30Hari } from '@/lib/pengawas/api';
import type { AbsensiHarian, LaporanProgress } from '@/lib/pengawas/api';
import { todayDateString } from '@/lib/pengawas/dateUtils';

type DayStatus = 'hadir_terkirim' | 'hadir_draft' | 'tidak_hadir';

function resolveStatus(
  tanggal: string,
  absensiMap: Map<string, AbsensiHarian>,
  laporanMap: Map<string, LaporanProgress>,
): DayStatus {
  const absensi = absensiMap.get(tanggal);
  const laporan = laporanMap.get(tanggal);
  if (!absensi || absensi.status !== 'hadir') return 'tidak_hadir';
  if (laporan?.status === 'terkirim') return 'hadir_terkirim';
  return 'hadir_draft';
}

const STATUS_UI: Record<
  DayStatus,
  { icon: string; label: string; className: string }
> = {
  hadir_terkirim: {
    icon: '✅',
    label: 'Hadir + Laporan Terkirim',
    className: 'bg-emerald-50 border-emerald-200',
  },
  hadir_draft: {
    icon: '⚠️',
    label: 'Hadir + Laporan Draft',
    className: 'bg-amber-50 border-amber-200',
  },
  tidak_hadir: {
    icon: '❌',
    label: 'Tidak Hadir',
    className: 'bg-red-50 border-red-200',
  },
};

export default function PengawasRiwayatScreen() {
  const { user } = useAuth();
  const [absensi, setAbsensi] = useState<AbsensiHarian[]>([]);
  const [laporan, setLaporan] = useState<LaporanProgress[]>([]);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const data = await fetchRiwayat30Hari(user.id);
    setAbsensi(data.absensi);
    setLaporan(data.laporan);
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const days = useMemo(() => {
    const result: string[] = [];
    const end = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(end);
      d.setDate(end.getDate() - i);
      result.push(
        d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }),
      );
    }
    return result;
  }, []);

  const absensiMap = useMemo(
    () => new Map(absensi.map((a) => [a.tanggal, a])),
    [absensi],
  );
  const laporanMap = useMemo(
    () => new Map(laporan.map((l) => [l.tanggal, l])),
    [laporan],
  );

  return (
    <View className="flex-1 bg-slate-50">
      <HeaderBar title="Riwayat" subtitle="30 hari terakhir" />
      <ScrollView className="flex-1 px-4 pb-24">
        {days.map((tanggal) => {
          const status = resolveStatus(tanggal, absensiMap, laporanMap);
          const ui = STATUS_UI[status];
          const isToday = tanggal === todayDateString();
          return (
            <Pressable
              key={tanggal}
              onPress={() =>
                router.push({
                  pathname: '/(pengawas)/riwayat/[tanggal]',
                  params: { tanggal },
                })
              }
              className={`mb-3 rounded-xl border p-4 ${ui.className}`}
            >
              <Text className="font-bold text-slate-900">
                {isToday ? 'Hari ini — ' : ''}
                {new Date(`${tanggal}T12:00:00`).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Text className="mt-1 text-sm text-slate-700">
                {ui.icon} {ui.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
