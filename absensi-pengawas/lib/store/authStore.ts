import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import supabase from '@/lib/supabase';
import { Profile } from '@/lib/types';

type AuthState = {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: string | null;
    role: Profile['role'] | null;
  }>;
  signOut: () => Promise<void>;
  loadSession: () => Promise<void>;
  updateProfile: (payload: Partial<Profile>) => Promise<{ error: string | null }>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
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

        if (error) return null;
        return data as Profile;
      },
      setSessionState: async (session) => {
        if (!session) {
          set({ session: null, user: null, profile: null });
          return;
        }

        const profile = await get().fetchProfile(session.user.id);
        set({
          session,
          user: session.user,
          profile,
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

        const profile = await get().fetchProfile(data.user.id);
        set({
          session: data.session,
          user: data.user,
          profile,
          isLoading: false,
        });

        return {
          error: null,
          role: profile?.role ?? null,
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
