import { useCallback, useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/ui/Button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { acknowledgeSop } from '@/lib/pengawas/api';
import type { SopPengawas } from '@/lib/pengawas/api';
import { usePengawasStore } from '@/lib/store/pengawasStore';

type SOPModalProps = {
  visible: boolean;
  sop: SopPengawas | null;
  pengawasId: string;
  onAcknowledged: () => void;
};

export function SOPModal({ visible, sop, pengawasId, onAcknowledged }: SOPModalProps) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const contentHeight = useRef(0);
  const { setSopReady, setSopVisible } = usePengawasStore();

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      const padding = 24;
      const atEnd =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - padding;
      if (atEnd) setScrolledToEnd(true);
    },
    [],
  );

  const handleContentSizeChange = useCallback((_w: number, h: number) => {
    contentHeight.current = h;
  }, []);

  const handleAcknowledge = async () => {
    if (!sop) return;
    setSubmitting(true);
    const { error } = await acknowledgeSop(pengawasId, sop.id);
    setSubmitting(false);
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Gagal menyimpan persetujuan SOP',
        text2: error.message,
      });
      return;
    }
    setSopReady(true);
    setSopVisible(false);
    Toast.show({ type: 'success', text1: 'SOP telah disetujui' });
    onAcknowledged();
  };

  if (!sop) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-white pt-14">
        <Text className="px-5 text-2xl font-bold text-slate-900">{sop.judul}</Text>
        <Text className="px-5 pb-3 text-sm text-slate-500">
          Scroll sampai bawah untuk melanjutkan
        </Text>
        <ScrollView
          className="flex-1 px-5"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
        >
          <Text className="pb-32 text-base leading-7 text-slate-800">{sop.konten}</Text>
        </ScrollView>
        <View className="border-t border-slate-200 bg-white px-5 pb-8 pt-4">
          <Button
            label="Saya Mengerti & Lanjutkan"
            onPress={handleAcknowledge}
            disabled={!scrolledToEnd}
            loading={submitting}
          />
          {!scrolledToEnd ? (
            <Text className="mt-2 text-center text-xs text-slate-500">
              Tombol aktif setelah Anda membaca seluruh SOP
            </Text>
          ) : null}
        </View>
      </View>
      <LoadingOverlay visible={submitting} message="Menyimpan..." />
    </Modal>
  );
}
