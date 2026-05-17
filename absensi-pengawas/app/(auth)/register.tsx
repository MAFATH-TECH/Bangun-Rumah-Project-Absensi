import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/authStore';
import { Profile } from '@/lib/types';

const roleRouteMap: Record<Profile['role'], string> = {
  pengawas: '/(pengawas)/beranda',
  logistik: '/(logistik)/beranda',
  admin: '/(admin)/dashboard',
};

const registerSchema = z
  .object({
    nama_lengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    no_hp: z.string().optional(),
    role: z.enum(['pengawas', 'logistik', 'admin']),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi password tidak sama',
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const ROLE_OPTIONS: Array<{ label: string; value: Profile['role'] }> = [
  { label: 'Pengawas', value: 'pengawas' },
  { label: 'Logistik', value: 'logistik' },
  { label: 'Admin', value: 'admin' },
];

export default function RegisterScreen() {
  const { signUp, isLoading, session, profile } = useAuthStore();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nama_lengkap: '',
      email: '',
      no_hp: '',
      role: 'pengawas',
      password: '',
      confirmPassword: '',
    },
  });

  const selectedRole = watch('role');
  const rootError = errors.root?.message;

  const onSubmit = async (values: RegisterFormValues) => {
    clearErrors('root');

    const result = await signUp({
      email: values.email,
      password: values.password,
      nama_lengkap: values.nama_lengkap,
      no_hp: values.no_hp,
      role: values.role,
    });

    if (result.error) {
      setError('root', { message: result.error });
      return;
    }

    if (result.role) {
      router.replace(roleRouteMap[result.role] as never);
    }
  };

  if (session && profile?.role) {
    return <Redirect href={roleRouteMap[profile.role] as never} />;
  }

  return (
    <View className="flex-1 justify-center bg-black px-6">
      <View className="mb-6 items-center">
        <Text className="text-2xl font-bold text-white">Buat Akun Baru</Text>
        <Text className="mt-1 text-sm text-yellow-200">Daftar lalu langsung masuk ke aplikasi</Text>
      </View>

      <View className="rounded-2xl border border-yellow-400 bg-white p-5">
        {rootError ? (
          <View className="mb-3 rounded-lg bg-red-100 p-3">
            <Text className="text-[13px] leading-[18px] text-red-800">{rootError}</Text>
          </View>
        ) : null}

        <Text className="mb-2 text-sm font-medium text-black">Nama Lengkap</Text>
        <Controller
          control={control}
          name="nama_lengkap"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder="Nama lengkap"
              placeholderTextColor="#6b7280"
              className="rounded-xl border border-yellow-500 bg-white px-4 py-3 text-black"
            />
          )}
        />
        {errors.nama_lengkap?.message ? (
          <Text className="mt-1 text-xs text-red-400">{errors.nama_lengkap.message}</Text>
        ) : null}

        <Text className="mb-2 mt-4 text-sm font-medium text-black">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              placeholder="nama@email.com"
              placeholderTextColor="#6b7280"
              className="rounded-xl border border-yellow-500 bg-white px-4 py-3 text-black"
            />
          )}
        />
        {errors.email?.message ? (
          <Text className="mt-1 text-xs text-red-400">{errors.email.message}</Text>
        ) : null}

        <Text className="mb-2 mt-4 text-sm font-medium text-black">No. HP (opsional)</Text>
        <Controller
          control={control}
          name="no_hp"
          render={({ field: { onChange, value } }) => (
            <TextInput
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#6b7280"
              className="rounded-xl border border-yellow-500 bg-white px-4 py-3 text-black"
            />
          )}
        />

        <Text className="mb-2 mt-4 text-sm font-medium text-black">Role</Text>
        <Controller
          control={control}
          name="role"
          render={({ field: { onChange } }) => (
            <View className="flex-row gap-2">
              {ROLE_OPTIONS.map((option) => {
                const isActive = selectedRole === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => onChange(option.value)}
                    className={`flex-1 rounded-xl border px-3 py-2 ${
                      isActive ? 'border-yellow-500 bg-yellow-100' : 'border-slate-300 bg-white'
                    }`}
                  >
                    <Text className={`text-center ${isActive ? 'text-black' : 'text-slate-700'}`}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        <Text className="mb-2 mt-4 text-sm font-medium text-black">Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              secureTextEntry
              value={value}
              onChangeText={onChange}
              placeholder="Minimal 6 karakter"
              placeholderTextColor="#6b7280"
              className="rounded-xl border border-yellow-500 bg-white px-4 py-3 text-black"
            />
          )}
        />
        {errors.password?.message ? (
          <Text className="mt-1 text-xs text-red-400">{errors.password.message}</Text>
        ) : null}

        <Text className="mb-2 mt-4 text-sm font-medium text-black">Konfirmasi Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <TextInput
              secureTextEntry
              value={value}
              onChangeText={onChange}
              placeholder="Ulangi password"
              placeholderTextColor="#6b7280"
              className="rounded-xl border border-yellow-500 bg-white px-4 py-3 text-black"
            />
          )}
        />
        {errors.confirmPassword?.message ? (
          <Text className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</Text>
        ) : null}

        <Pressable
          disabled={isLoading}
          onPress={handleSubmit(onSubmit)}
          className="mt-6 items-center rounded-xl bg-yellow-400 px-4 py-3 disabled:opacity-70"
        >
          {isLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="font-semibold text-black">Daftar</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.replace('/(auth)/login')} className="mt-4 items-center py-2">
          <Text className="text-sm text-black">
            Sudah punya akun? <Text className="font-semibold text-yellow-600">Masuk</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
