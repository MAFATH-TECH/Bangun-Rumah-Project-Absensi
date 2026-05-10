import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, profile, session, isLoading } = useAuthStore();
  const role = profile?.role ?? null;

  return {
    user,
    profile,
    session,
    role,
    isLoading,
    isAuthenticated: Boolean(session && user),
    isPengawas: role === 'pengawas',
    isLogistik: role === 'logistik',
    isAdmin: role === 'admin',
  };
}
