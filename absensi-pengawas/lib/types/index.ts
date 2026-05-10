export type UserRole = 'pengawas' | 'logistik' | 'admin';
export type SesiAbsensi = 'pagi' | 'siang' | 'sore';
export type StatusAbsensi = 'hadir' | 'terlambat' | 'absen';
export type StatusTransaksi = 'pending' | 'disetujui' | 'ditolak';

export interface Profile {
  id: string;
  email: string;
  nama_lengkap: string;
  no_hp?: string | null;
  role: UserRole;
  proyek_id?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Proyek {
  id: string;
  nama_proyek: string;
  alamat: string;
  deskripsi?: string | null;
  center_latitude: number;
  center_longitude: number;
  radius_geofencing_meter: number;
  aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface Absensi {
  id: string;
  user_id: string;
  proyek_id: string;
  tanggal: string;
  sesi: SesiAbsensi;
  jam_absen: string;
  status: StatusAbsensi;
  foto_absensi_url: string;
  latitude: number;
  longitude: number;
  jarak_meter: number;
  laporan_harian?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FotoLaporan {
  id: string;
  absensi_id: string;
  user_id: string;
  file_url: string;
  file_path: string;
  caption?: string | null;
  created_at: string;
}

export interface TransaksiLogistik {
  id: string;
  user_id: string;
  proyek_id: string;
  tanggal_transaksi: string;
  nama_toko?: string | null;
  nama_material: string;
  kategori_material: string;
  satuan: string;
  jumlah: number;
  harga_satuan: number;
  total_harga: number;
  catatan?: string | null;
  status: StatusTransaksi;
  catatan_admin?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FotoNota {
  id: string;
  transaksi_id: string;
  user_id: string;
  file_url: string;
  file_path: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id?: string | null;
  actor_role?: UserRole | null;
  action: 'INSERT' | 'UPDATE';
  table_name: string;
  record_id: string;
  summary?: string | null;
  payload?: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardStats {
  tanggal: string;
  total_pengawas: number;
  total_logistik: number;
  total_admin: number;
  total_absensi: number;
  total_hadir: number;
  total_terlambat: number;
  total_absen: number;
  total_transaksi: number;
  total_pending: number;
  total_disetujui: number;
  total_ditolak: number;
  total_pengeluaran: number;
}
