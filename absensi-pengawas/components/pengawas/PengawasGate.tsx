import { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SOPModal } from './SOPModal';
import { usePengawasBootstrap } from '@/lib/hooks/usePengawasBootstrap';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePengawasStore } from '@/lib/store/pengawasStore';

type PengawasGateProps = {
  children: ReactNode;
};

export function PengawasGate({ children }: PengawasGateProps) {
  const { user } = useAuth();
  const { loading, refresh } = usePengawasBootstrap();
  const { sopReady, sopVisible, activeSop } = usePengawasStore();

  if (loading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <>
      <SOPModal
        visible={sopVisible && !sopReady}
        sop={activeSop}
        pengawasId={user.id}
        onAcknowledged={() => void refresh()}
      />
      {sopReady ? children : (
        <View className="flex-1 bg-slate-50" />
      )}
    </>
  );
}
