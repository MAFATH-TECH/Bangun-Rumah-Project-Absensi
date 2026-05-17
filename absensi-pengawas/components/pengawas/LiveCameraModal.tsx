import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/ui/Button';
import {
  captureWatermarkedPhoto,
  formatWatermarkKoordinat,
  type WatermarkMeta,
} from '@/lib/utils/photoWatermark';
import { getServerNow } from '@/lib/pengawas/serverTime';

type LiveCameraModalProps = {
  visible: boolean;
  facing?: 'front' | 'back';
  pengawasNama: string;
  title: string;
  onClose: () => void;
  onConfirm: (uri: string, lat: number | null, lng: number | null) => Promise<void>;
};

export function LiveCameraModal({
  visible,
  facing = 'back',
  pengawasNama,
  title,
  onClose,
  onConfirm,
}: LiveCameraModalProps) {
  const cameraRef = useRef<CameraView>(null);
  const shotRef = useRef<View>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [rawUri, setRawUri] = useState<string | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [meta, setMeta] = useState<WatermarkMeta | null>(null);
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  });
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setRawUri(null);
      setPreviewUri(null);
      setMeta(null);
    }
  }, [visible]);

  useEffect(() => {
    if (visible && !permission?.granted) {
      void requestPermission();
    }
  }, [visible, permission?.granted, requestPermission]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: false,
      });
      if (!photo?.uri) {
        Toast.show({ type: 'error', text1: 'Gagal mengambil foto' });
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat: number | null = null;
      let lng: number | null = null;
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
      setCoords({ lat, lng });

      const serverNow = await getServerNow();
      const tanggalJam = serverNow.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'medium',
      });
      setMeta({
        nama: pengawasNama,
        tanggalJam,
        koordinat: formatWatermarkKoordinat(lat, lng),
      });
      setRawUri(photo.uri);
    } finally {
      setCapturing(false);
    }
  };

  useEffect(() => {
    if (!rawUri || !meta) return;
    const timer = setTimeout(async () => {
      const watermarked = await captureWatermarkedPhoto(shotRef);
      setPreviewUri(watermarked ?? rawUri);
    }, 300);
    return () => clearTimeout(timer);
  }, [rawUri, meta]);

  const handleUsePhoto = async () => {
    const uri = previewUri ?? rawUri;
    if (!uri) return;
    setUploading(true);
    try {
      await onConfirm(uri, coords.lat, coords.lng);
      onClose();
    } catch {
      Toast.show({ type: 'error', text1: 'Gagal memproses foto' });
    } finally {
      setUploading(false);
    }
  };

  const width = Dimensions.get('window').width - 32;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View className="flex-1 bg-black">
        <Text className="pt-14 text-center text-lg font-bold text-white">{title}</Text>

        {!permission?.granted ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="mb-4 text-center text-white">
              Izin kamera diperlukan untuk foto live
            </Text>
            <Button label="Izinkan Kamera" onPress={requestPermission} />
          </View>
        ) : rawUri && meta ? (
          <View className="flex-1 items-center justify-center px-4">
            <View
              ref={shotRef}
              collapsable={false}
              style={{ width, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}
            >
              <Image source={{ uri: rawUri }} style={{ width, height: width * 1.2 }} />
              <View style={styles.watermark}>
                <Text style={styles.wmText}>{meta.nama}</Text>
                <Text style={styles.wmText}>{meta.tanggalJam}</Text>
                <Text style={styles.wmText}>{meta.koordinat}</Text>
              </View>
            </View>
            {previewUri ? (
              <Text className="mt-3 text-center text-sm text-emerald-300">
                Gunakan foto ini?
              </Text>
            ) : null}
            <View className="mt-4 w-full gap-2">
              <Button
                label="Gunakan Foto Ini"
                onPress={handleUsePhoto}
                loading={uploading}
                variant="success"
              />
              <Button label="Ambil Ulang" variant="secondary" onPress={() => setRawUri(null)} />
            </View>
          </View>
        ) : (
          <View className="flex-1">
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing} />
            <View className="absolute bottom-10 left-0 right-0 items-center px-6">
              <Text className="mb-3 text-center text-xs text-white/80">
                Hanya foto live — galeri dinonaktifkan
              </Text>
              <Button
                label={capturing ? 'Memproses...' : 'Ambil Foto'}
                onPress={takePhoto}
                loading={capturing}
              />
              <Button label="Batal" variant="secondary" className="mt-2" onPress={onClose} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  watermark: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 10,
  },
  wmText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
