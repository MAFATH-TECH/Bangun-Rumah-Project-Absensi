import { LiveCameraModal } from './LiveCameraModal';

type SelfieVerificationModalProps = {
  visible: boolean;
  pengawasNama: string;
  onClose: () => void;
  onConfirm: (uri: string, lat: number | null, lng: number | null) => Promise<void>;
};

export function SelfieVerificationModal({
  visible,
  pengawasNama,
  onClose,
  onConfirm,
}: SelfieVerificationModalProps) {
  return (
    <LiveCameraModal
      visible={visible}
      facing="front"
      pengawasNama={pengawasNama}
      title="Selfie Verifikasi Kehadiran"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
