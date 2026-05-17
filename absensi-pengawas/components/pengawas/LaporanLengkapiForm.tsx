import { useEffect } from 'react';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { Button } from '@/components/ui/Button';
import type { FotoProgress, LaporanProgress } from '@/lib/pengawas/api';
import { kirimLaporanKeAdmin, saveLaporanDraft } from '@/lib/pengawas/api';

const schema = z.object({
  deskripsi: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  kendala: z.string().optional(),
  rekomendasi: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type LaporanLengkapiFormProps = {
  laporan: LaporanProgress;
  fotos: FotoProgress[];
  selfieUrl?: string | null;
  readOnly?: boolean;
  onSaved: () => void;
};

function FotoSlotGrid({
  label,
  fotos,
}: {
  label: string;
  fotos: FotoProgress[];
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-slate-800">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {fotos.length === 0 ? (
          <Text className="text-sm text-slate-500">Tidak ada foto</Text>
        ) : (
          fotos.map((f) => (
            <Image
              key={f.id}
              source={{ uri: f.foto_url }}
              className="h-24 w-24 rounded-lg"
              resizeMode="cover"
            />
          ))
        )}
      </View>
    </View>
  );
}

export function LaporanLengkapiForm({
  laporan,
  fotos,
  selfieUrl,
  readOnly = false,
  onSaved,
}: LaporanLengkapiFormProps) {
  const isTerkirim = laporan.status === 'terkirim';
  const locked = readOnly || isTerkirim;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deskripsi: laporan.deskripsi ?? '',
      kendala: laporan.kendala ?? '',
      rekomendasi: laporan.rekomendasi ?? '',
    },
  });

  useEffect(() => {
    reset({
      deskripsi: laporan.deskripsi ?? '',
      kendala: laporan.kendala ?? '',
      rekomendasi: laporan.rekomendasi ?? '',
    });
  }, [laporan, reset]);

  const slot1 = fotos.filter((f) => f.slot === 1);
  const slot2 = fotos.filter((f) => f.slot === 2);
  const slot3 = fotos.filter((f) => f.slot === 3);

  const onDraft = async (values: FormValues) => {
    const { error } = await saveLaporanDraft(laporan.id, {
      deskripsi: values.deskripsi,
      kendala: values.kendala || null,
      rekomendasi: values.rekomendasi || null,
    });
    if (error) {
      Toast.show({ type: 'error', text1: 'Gagal simpan draft', text2: error.message });
      return;
    }
    Toast.show({ type: 'success', text1: 'Draft disimpan' });
    onSaved();
  };

  const onKirim = async (values: FormValues) => {
    const draftRes = await saveLaporanDraft(laporan.id, {
      deskripsi: values.deskripsi,
      kendala: values.kendala || null,
      rekomendasi: values.rekomendasi || null,
    });
    if (draftRes.error) {
      Toast.show({ type: 'error', text1: 'Gagal menyimpan', text2: draftRes.error.message });
      return;
    }
    const { error } = await kirimLaporanKeAdmin(laporan.id);
    if (error) {
      Toast.show({ type: 'error', text1: 'Gagal kirim ke admin', text2: error.message });
      return;
    }
    Toast.show({ type: 'success', text1: 'Laporan terkirim ke admin' });
    onSaved();
  };

  return (
    <ScrollView className="flex-1 px-4 pb-24" showsVerticalScrollIndicator={false}>
      <Text className="mb-1 mt-2 text-xl font-bold text-slate-900">Lengkapi Laporan</Text>
      <Text className="mb-4 text-sm text-slate-500">
        Foto progress tidak dapat diubah — hanya teks laporan
      </Text>

      <FotoSlotGrid label="Slot 1 — Pagi" fotos={slot1} />
      <FotoSlotGrid label="Slot 2 — Siang" fotos={slot2} />
      <FotoSlotGrid label="Slot 3 — Sore" fotos={slot3} />

      {selfieUrl ? (
        <View className="mb-4">
          <Text className="mb-2 font-semibold text-slate-800">Selfie Verifikasi</Text>
          <Image source={{ uri: selfieUrl }} className="h-32 w-32 rounded-xl" />
        </View>
      ) : null}

      <Text className="mb-1 font-medium text-slate-800">Deskripsi progress *</Text>
      <Controller
        control={control}
        name="deskripsi"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="mb-1 min-h-[100px] rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
            multiline
            editable={!locked}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Jelaskan progress pekerjaan hari ini..."
            textAlignVertical="top"
          />
        )}
      />
      {errors.deskripsi ? (
        <Text className="mb-3 text-sm text-red-600">{errors.deskripsi.message}</Text>
      ) : (
        <View className="mb-3" />
      )}

      <Text className="mb-1 font-medium text-slate-800">Kendala (opsional)</Text>
      <Controller
        control={control}
        name="kendala"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="mb-4 min-h-[80px] rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
            multiline
            editable={!locked}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value ?? ''}
            placeholder="Kendala yang dihadapi..."
            textAlignVertical="top"
          />
        )}
      />

      <Text className="mb-1 font-medium text-slate-800">Rekomendasi (opsional)</Text>
      <Controller
        control={control}
        name="rekomendasi"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="mb-6 min-h-[80px] rounded-xl border border-slate-300 bg-white p-3 text-slate-900"
            multiline
            editable={!locked}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value ?? ''}
            placeholder="Rekomendasi / tindak lanjut..."
            textAlignVertical="top"
          />
        )}
      />

      {!locked ? (
        <View className="gap-3">
          <Button
            label="Simpan Draft"
            variant="secondary"
            loading={isSubmitting}
            onPress={handleSubmit(onDraft)}
          />
          <Button
            label="Kirim ke Admin"
            loading={isSubmitting}
            onPress={handleSubmit(onKirim)}
          />
        </View>
      ) : (
        <View className="rounded-xl bg-slate-100 p-4">
          <Text className="text-center text-slate-600">
            Laporan sudah terkirim dan tidak dapat diedit
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
