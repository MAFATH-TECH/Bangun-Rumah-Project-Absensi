import { ActivityIndicator, Modal, Text, View } from 'react-native';

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export function LoadingOverlay({ visible, message = 'Memproses...' }: LoadingOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="items-center rounded-2xl bg-white px-8 py-6">
          <ActivityIndicator size="large" color="#0d9488" />
          <Text className="mt-3 text-base text-slate-700">{message}</Text>
        </View>
      </View>
    </Modal>
  );
}
