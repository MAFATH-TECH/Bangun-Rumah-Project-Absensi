import { AuthError } from '@supabase/supabase-js';

const INVALID_REFRESH_TOKEN_PATTERNS = [
  'invalid refresh token',
  'refresh token not found',
  'refresh_token_not_found',
];

export const UNCONFIRMED_EMAIL_HELP =
  'Email ini sudah terdaftar tetapi belum aktif. Buka Supabase Dashboard → Authentication → Users, hapus akun dengan email tersebut, pastikan "Confirm email" dimatikan, lalu daftar ulang.';

export function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error) return false;

  const message =
    error instanceof AuthError
      ? error.message
      : error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : '';

  const normalized = message.toLowerCase();
  return INVALID_REFRESH_TOKEN_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function isAlreadyRegisteredError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('already registered') || normalized.includes('user already registered');
}

export function isEmailNotConfirmedError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('email not confirmed') ||
    normalized.includes('email_not_confirmed') ||
    normalized.includes('not confirmed')
  );
}

export function mapSignUpError(message: string): string {
  const normalized = message.toLowerCase();

  if (isAlreadyRegisteredError(message)) {
    return 'Email ini sudah terdaftar. Silakan login.';
  }

  if (isEmailNotConfirmedError(message)) {
    return UNCONFIRMED_EMAIL_HELP;
  }

  if (normalized.includes('invalid email')) {
    return 'Format email tidak valid.';
  }

  if (normalized.includes('password should be')) {
    return 'Password minimal 6 karakter.';
  }

  if (normalized.includes('rate limit') || normalized.includes('too many')) {
    return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
  }

  return `Gagal mendaftar: ${message}`;
}

export function mapAuthErrorMessage(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Email atau password salah.';
  }

  if (isAlreadyRegisteredError(message)) {
    return 'Email ini sudah terdaftar.';
  }

  if (isEmailNotConfirmedError(message)) {
    return UNCONFIRMED_EMAIL_HELP;
  }

  return message;
}
