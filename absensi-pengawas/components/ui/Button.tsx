import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

type ButtonProps = ComponentProps<typeof Pressable> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
  className?: string;
};

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-teal-600',
  secondary: 'bg-slate-200',
  danger: 'bg-red-600',
  success: 'bg-emerald-600',
};

const VARIANT_TEXT: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'text-white',
  secondary: 'text-slate-800',
  danger: 'text-white',
  success: 'text-white',
};

export function Button({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={`rounded-xl px-4 py-3 ${VARIANT_CLASS[variant]} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      onPress={onPress}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#0f172a' : '#fff'} />
      ) : (
        <Text className={`text-center text-base font-semibold ${VARIANT_TEXT[variant]}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
