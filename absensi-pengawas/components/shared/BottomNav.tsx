import { router, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { UserRole } from '@/lib/types';

type BottomNavProps = {
  role: UserRole;
};

type NavItem = {
  label: string;
  href: string;
};

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  pengawas: [
    { label: 'Beranda', href: '/(pengawas)/beranda' },
    { label: 'Absensi', href: '/(pengawas)/absensi' },
    { label: 'Laporan', href: '/(pengawas)/lengkapi-laporan' },
    { label: 'Riwayat', href: '/(pengawas)/riwayat' },
  ],
  logistik: [
    { label: 'Beranda', href: '/(logistik)/beranda' },
    { label: 'Tambah', href: '/(logistik)/tambah-transaksi' },
    { label: 'Riwayat', href: '/(logistik)/riwayat' },
  ],
  admin: [
    { label: 'Dashboard', href: '/(admin)/dashboard' },
    { label: 'Pengawas', href: '/(admin)/pengawas' },
    { label: 'Logistik', href: '/(admin)/logistik' },
    { label: 'Peta', href: '/(admin)/peta' },
  ],
};

const ACTIVE_COLOR: Record<UserRole, string> = {
  pengawas: '#0d9488',
  logistik: '#2563eb',
  admin: '#7c3aed',
};

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE[role];
  const activeColor = ACTIVE_COLOR[role];

  return (
    <View className="flex-row justify-between border-t border-slate-200 bg-white px-4 py-3">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Pressable
            key={item.href}
            onPress={() => router.replace(item.href as never)}
            className="flex-1 items-center"
          >
            <Text
              style={{
                color: isActive ? activeColor : '#64748b',
                fontWeight: isActive ? '700' : '500',
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
