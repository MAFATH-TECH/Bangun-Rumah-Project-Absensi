import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import {
  isAlreadyRegisteredError,
  isInvalidRefreshTokenError,
  mapAuthErrorMessage,
  mapSignUpError,
  UNCONFIRMED_EMAIL_HELP,
} from '@/lib/auth/errors';
import { clearLocalAuthSession } from '@/lib/auth/session';
import supabase from '@/lib/supabase';
import { Profile, UserRole } from '@/lib/types';

const resolveRole = (candidate: unknown): UserRole =>
  candidate === 'admin' || candidate === 'logistik' || candidate === 'pengawas'
    ? candidate
    : 'pengawas';

const isUserEmailConfirmed = (user: User) => Boolean(user.email_confirmed_at);

const applyAuthenticatedUser = async (
  get: () => AuthState,
  set: (partial: Partial<AuthState>) => void,
  user: User,
  session: Session,
  overrides?: Partial<Profile>,
) => {
  const profile = await get().ensureProfile(user);
  const resolvedRole = profile?.role ?? overrides?.role ?? resolveRole(user.user_metadata?.role);

  set({
    session,
    user,
    profile: profile ?? buildFallbackProfile(user, overrides),
  });

  return resolvedRole;
};

const buildFallbackProfile = (user: User, overrides?: Partial<Profile>): Profile => {
  const metadata = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? '',
    nama_lengkap:
      overrides?.nama_lengkap ??
      metadata.nama_lengkap ??
      metadata.full_name ??
      metadata.display_name ??
      user.email?.split('@')[0] ??
      'User Baru',
    no_hp: (overrides?.no_hp ?? metadata.no_hp ?? metadata.phone ?? null) as string | null,
    role: overrides?.role ?? resolveRole(metadata.role),
    proyek_id: null,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

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
  }>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateProfile: (payload: Partial<Profile>) => Promise<{ error: string | null }>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  ensureProfile: (user: User) => Promise<Profile | null>;
  setSessionState: (session: Session | null) => Promise<void>;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  session: null,
  isLoading: false,

  fetchProfile: async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) return null;
    return data as Profile;
  },

  ensureProfile: async (user) => {
    const existingProfile = await get().fetchProfile(user.id);
    if (existingProfile) return existingProfile;

    const metadata = user.user_metadata ?? {};
    const payload = {
      id: user.id,
      email: user.email ?? '',
      nama_lengkap:
        metadata.nama_lengkap ??
        metadata.full_name ??
        metadata.display_name ??
        user.email?.split('@')[0] ??
        'User Baru',
      no_hp: metadata.no_hp ?? metadata.phone ?? null,
      role: resolveRole(metadata.role),
    };

    const { data, error } = await supabase.from('profiles').upsert(payload).select('*').single();
    if (error) return null;
    return data as Profile;
  },

  setSessionState: async (session) => {
    if (!session) {
      set({ session: null, user: null, profile: null });
      return;
    }

    const profile = await get().ensureProfile(session.user);
    set({
      session,
      user: session.user,
      profile: profile ?? buildFallbackProfile(session.user),
    });
  },

  signIn: async (email, password) => {
    set({ isLoading: true });

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error || !data.session || !data.user) {
        return {
          error: mapAuthErrorMessage(error?.message ?? 'Gagal login. Silakan coba lagi.'),
          role: null,
        };
      }

      const role = await applyAuthenticatedUser(get, set, data.user, data.session);

      return { error: null, role };
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async ({ email, password, nama_lengkap, role, no_hp }) => {
    set({ isLoading: true });

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = nama_lengkap.trim();
    const trimmedPhone = no_hp?.trim() || null;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            nama_lengkap: trimmedName,
            full_name: trimmedName,
            display_name: trimmedName,
            role,
            no_hp: trimmedPhone,
            phone: trimmedPhone,
          },
        },
      });

      if (error) {
        if (isAlreadyRegisteredError(error.message)) {
          return { error: 'Email ini sudah terdaftar. Silakan login.', role: null };
        }
        return { error: mapSignUpError(error.message), role: null };
      }

      const profileOverrides = {
        nama_lengkap: trimmedName,
        no_hp: trimmedPhone,
        role,
        email: normalizedEmail,
      };

      // Supabase mengembalikan identities kosong jika email sudah pernah terdaftar.
      if (data.user && data.user.identities?.length === 0) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (loginError) {
          return { error: mapSignUpError(loginError.message), role: null };
        }

        if (!loginData.session || !loginData.user) {
          return { error: UNCONFIRMED_EMAIL_HELP, role: null };
        }

        const resolvedRole = await applyAuthenticatedUser(
          get,
          set,
          loginData.user,
          loginData.session,
          profileOverrides,
        );
        return { error: null, role: resolvedRole };
      }

      if (data.session && data.user) {
        const resolvedRole = await applyAuthenticatedUser(get, set, data.user, data.session, profileOverrides);
        return { error: null, role: resolvedRole };
      }

      if (data.user && !isUserEmailConfirmed(data.user)) {
        return { error: UNCONFIRMED_EMAIL_HELP, role: null };
      }

      if (data.user) {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (loginError) {
          return { error: mapSignUpError(loginError.message), role: null };
        }

        if (!loginData.session || !loginData.user) {
          return { error: 'Gagal masuk setelah registrasi. Silakan login manual.', role: null };
        }

        const resolvedRole = await applyAuthenticatedUser(
          get,
          set,
          loginData.user,
          loginData.session,
          profileOverrides,
        );
        return { error: null, role: resolvedRole };
      }

      return { error: 'Gagal membuat akun. Coba dengan email lain.', role: null };
    } catch {
      return { error: 'Terjadi kesalahan. Coba lagi.', role: null };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
    } catch (error) {
      if (!isInvalidRefreshTokenError(error)) {
        throw error;
      }
      await clearLocalAuthSession();
    }
    set({ user: null, profile: null, session: null, isLoading: false });
  },

  loadSession: async () => {
    set({ isLoading: true });
    await AsyncStorage.removeItem('auth-store').catch(() => undefined);

    try {
      const { data, error } = await supabase.auth.getSession();

      if (error && isInvalidRefreshTokenError(error)) {
        await clearLocalAuthSession();
        set({ session: null, user: null, profile: null });
        return;
      }

      await get().setSessionState(data.session);
    } catch (error) {
      if (isInvalidRefreshTokenError(error)) {
        await clearLocalAuthSession();
      }
      set({ session: null, user: null, profile: null });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (payload) => {
    const currentUser = get().user;
    if (!currentUser) {
      return { error: 'User belum login.' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', currentUser.id)
      .select('*')
      .single();

    if (error) {
      return { error: error.message };
    }

    set({ profile: data as Profile });
    return { error: null };
  },
}));
