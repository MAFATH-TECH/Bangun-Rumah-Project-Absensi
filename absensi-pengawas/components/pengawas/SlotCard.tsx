import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import type { FotoProgress } from '@/lib/pengawas/api';
import { MAX_FOTO_PER_SLOT, type SlotNumber } from '@/lib/pengawas/constants';
import { formatJamRange } from '@/lib/pengawas/dateUtils';
import { getServerNow } from '@/lib/pengawas/serverTime';
import {
  getSlotUiStatus,
  slotAvailabilityLabel,
  type SlotConfig,
} from '@/lib/pengawas/slotUtils';

type SlotCardProps = {
  config: SlotConfig;
  fotos: FotoProgress[];
  absensiSubmitted: boolean;
  onUploadPress: (slot: SlotNumber) => void;
  onDeleteFoto: (fotoId: string) => void;
};

const STATUS_LABEL: Record<string, string> = {
  waiting: 'Menunggu Waktu',
  active: 'Waktunya Upload!',
  done: 'Selesai ✓',
  locked: 'Terkunci',
};

export function SlotCard({
  config,
  fotos,
  absensiSubmitted,
  onUploadPress,
  onDeleteFoto,
}: SlotCardProps) {
  const slot = config.slot as SlotNumber;
  const [now, setNow] = useState(new Date());
  const pulse = useSharedValue(1);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    void getServerNow().then(setNow);
  }, []);

  const status = getSlotUiStatus(slot, config, now, fotos.length, absensiSubmitted);
  const canUpload = status === 'active' && fotos.length < MAX_FOTO_PER_SLOT;
  const canDelete = status === 'done' && !absensiSubmitted;

  useEffect(() => {
    if (status === 'active') {
      pulse.value = withRepeat(
        withSequence(withTiming(1.03, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        true,
      );
    } else {
      pulse.value = 1;
    }
  }, [status, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const borderClass =
    status === 'active'
      ? 'border-emerald-500 bg-emerald-50'
      : status === 'done'
        ? 'border-teal-500 bg-teal-50'
        : 'border-slate-200 bg-white';

  return (
    <Animated.View
      style={status === 'active' ? animatedStyle : undefined}
      className={`mb-4 rounded-2xl border-2 p-4 ${borderClass}`}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-slate-900">
            Slot {slot} — {config.nama_slot}
          </Text>
          <Text className="text-sm text-slate-600">
            {formatJamRange(config.jam_mulai, config.jam_selesai)}
          </Text>
        </View>
        <Text
          className={`text-sm font-semibold ${
            status === 'active'
              ? 'text-emerald-700'
              : status === 'done'
                ? 'text-teal-700'
                : 'text-slate-500'
          }`}
        >
          {STATUS_LABEL[status]}
        </Text>
      </View>

      <Text className="mb-3 text-xs text-slate-500">
        {fotos.length}/{MAX_FOTO_PER_SLOT} foto
      </Text>

      {fotos.length > 0 ? (
        <View className="mb-3 flex-row flex-wrap gap-2">
          {fotos.map((foto) => (
            <View key={foto.id} className="relative">
              <Image
                source={{ uri: foto.foto_url }}
                className="h-20 w-20 rounded-lg"
                resizeMode="cover"
              />
              {canDelete ? (
                <Pressable
                  onPress={() => onDeleteFoto(foto.id)}
                  className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5"
                >
                  <Text className="text-xs text-white">×</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {status === 'waiting' || status === 'locked' ? (
        <Text className="mb-2 text-xs text-slate-500">
          {slotAvailabilityLabel(status, config)}
        </Text>
      ) : null}

      <Button
        label={canUpload ? 'Ambil Foto Live' : 'Tombol Nonaktif'}
        onPress={() => onUploadPress(slot)}
        disabled={!canUpload}
        variant={canUpload ? 'success' : 'secondary'}
      />
    </Animated.View>
  );
}
