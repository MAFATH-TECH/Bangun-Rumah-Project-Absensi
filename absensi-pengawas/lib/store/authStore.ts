import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import supabase from '@/lib/supabase';
import { Profile, UserRole } from '@/lib/types';
import type { Tables } from '@/types/supabase';

const resolveRole = (candidate: unknown): UserRole =>
  candidate === 'admin' || candidate === 'logistik' || candidate === 'pengawas'
    ? candidate
    : 'pengawas';

const mapDbProfile = (row: Tables<'profiles'>, email = ''): Profile => ({
  id: row.id,
  email,
  nama_lengkap: row.full_name,
  role: resolveRole(row.role),
  proyek_id: null,
  avatar_url: null,
  created_at: row.created_at ?? new Date().toISOString(),
  updated_at: row.updated_at ?? new Date().toISOString(),
});

type AuthState = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: string | null;
    role: Profile['role'] | null;
  }>;
  signUp: (payload: {
    email: string;
    password: string;
    nama_lengkap: string;
    role: UserRole;
    no_hp?: string;
  }) => Promise<{
    error: string | null;
    role: Profile['role'] | null;
    needsEmailVerification: boolean;
  }>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateProfile: (payload: Partial<Profile>) => Promise<{ error: string | null }>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  ensureProfile: (user: User) => Promise<Profile | null>;
  setSessionState: (session: Session | null) => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      fetchProfile: async (userId) => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !data) return null;
        return mapDbProfile(data, get().user?.email ?? '');
      },
      ensureProfile: async (user) => {
        const existingProfile = await get().fetchProfile(user.id);
        if (existingProfile) return existingProfile;

        const metadata = user.user_metadata ?? {};
        const metadataName =
          metadata.nama_lengkap ?? metadata.full_name ?? metadata.display_name ?? null;
        const metadataPhone = metadata.no_hp ?? metadata.phone ?? null;
        const fallbackRole: UserRole = resolveRole(metadata.role);

        const payload = {
          id: user.id,
          full_name: metadataName ?? user.email?.split('@')[0] ?? 'User Baru',
          role: fallbackRole,
        };

        const { data, error } = await supabase.from('profiles').upsert(payload).select('*').single();
        if (error || !data) return null;
        return mapDbProfile(data, user.email ?? '');
      },
      setSessionState: async (session) => {
        if (!session) {
          set({ session: null, user: null, profile: null });
          return;
        }

        const profile = await get().ensureProfile(session.user);
        const metadata = session.user.user_metadata ?? {};
        const roleFromMetadata = resolveRole(metadata.role);
        const fallbackProfile: Profile = {
          id: session.user.id,
          email: session.user.email ?? '',
          nama_lengkap:
            metadata.nama_lengkap ??
            metadata.full_name ??
            metadata.display_name ??
            session.user.email?.split('@')[0] ??
            'User Baru',
          no_hp: (metadata.no_hp ?? metadata.phone ?? null) as string | null,
          role: roleFromMetadata,
          proyek_id: null,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({
          session,
          user: session.user,
          profile: profile ?? fallbackProfile,
        });
      },
      signIn: async (email, password) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error || !data.session || !data.user) {
          set({ isLoading: false });
          return {
            error: error?.message ?? 'Gagal login. Silakan coba lagi.',
            role: null,
          };
        }

        const profile = await get().ensureProfile(data.user);
        const metadata = data.user.user_metadata ?? {};
        const roleFromMetadata = resolveRole(metadata.role);
        const fallbackProfile: Profile = {
          id: data.user.id,
          email: data.user.email ?? '',
          nama_lengkap:
            metadata.nama_lengkap ??
            metadata.full_name ??
            metadata.display_name ??
            data.user.email?.split('@')[0] ??
            'User Baru',
          no_hp: (metadata.no_hp ?? metadata.phone ?? null) as string | null,
          role: roleFromMetadata,
          proyek_id: null,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({
          session: data.session,
          user: data.user,
          profile: profile ?? fallbackProfile,
          isLoading: false,
        });

        return {
          error: null,
          role: profile?.role ?? roleFromMetadata,
        };
      },
      signUp: async ({ email, password, nama_lengkap, role, no_hp }) => {
        set({ isLoading: true });
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nama_lengkap,
              full_name: nama_lengkap,
              display_name: nama_lengkap,
              role,
              no_hp: no_hp?.trim() ? no_hp : null,
              phone: no_hp?.trim() ? no_hp : null,
            },
          },
        });

        if (error || !data.user) {
          set({ isLoading: false });
          return {
            error: error?.message ?? 'Gagal registrasi. Silakan coba lagi.',
            role: null,
            needsEmailVerification: false,
          };
        }

        if (!data.session) {
          set({ isLoading: false });
          return {
            error: null,
            role,
            needsEmailVerification: true,
          };
        }

        const ensuredProfile = await get().ensureProfile(data.user);
        if (!ensuredProfile) {
          set({ isLoading: false });
          return {
            error: 'Akun berhasil dibuat, tetapi profile gagal disiapkan. Coba login ulang.',
            role: null,
            needsEmailVerification: false,
          };
        }

        set({
          session: data.session,
          user: data.user,
          profile: ensuredProfile,
          isLoading: false,
        });

        return {
          error: null,
          role: ensuredProfile.role,
          needsEmailVerification: false,
        };
      },
      signOut: async () => {
        set({ isLoading: true });
        await supabase.auth.signOut();
        set({ user: null, profile: null, session: null, isLoading: false });
      },
      loadSession: async () => {
        set({ isLoading: true });
        const { data } = await supabase.auth.getSession();
        await get().setSessionState(data.session);
        set({ isLoading: false });
      },
      updateProfile: async (payload) => {
        const currentUser = get().user;
        if (!currentUser) {
          return { error: 'User belum login.' };
        }

        const dbPayload: Partial<Tables<'profiles'>> = {};
        if (payload.nama_lengkap) dbPayload.full_name = payload.nama_lengkap;
        if (payload.role) dbPayload.role = payload.role;

        const { data, error } = await supabase
          .from('profiles')
          .update(dbPayload)
          .eq('id', currentUser.id)
          .select('*')
          .single();

        if (error) {
          return { error: error.message };
        }

        set({ profile: mapDbProfile(data, currentUser.email ?? '') });
        return { error: null };
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
      }),
    },
  ),
);
