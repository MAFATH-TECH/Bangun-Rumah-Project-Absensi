create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('pengawas', 'logistik', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'sesi_absensi') then
    create type sesi_absensi as enum ('pagi', 'siang', 'sore');
  end if;

  if not exists (select 1 from pg_type where typname = 'status_absensi') then
    create type status_absensi as enum ('hadir', 'terlambat', 'absen');
  end if;

  if not exists (select 1 from pg_type where typname = 'status_transaksi') then
    create type status_transaksi as enum ('pending', 'disetujui', 'ditolak');
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nama_lengkap text not null,
  no_hp text,
  role user_role not null default 'pengawas',
  proyek_id uuid,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.proyek (
  id uuid primary key default gen_random_uuid(),
  nama_proyek text not null,
  alamat text not null,
  deskripsi text,
  center_latitude double precision not null,
  center_longitude double precision not null,
  radius_geofencing_meter integer not null default 500,
  aktif boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
  add constraint if not exists profiles_proyek_id_fkey
  foreign key (proyek_id)
  references public.proyek(id)
  on delete set null;

create table if not exists public.absensi (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  proyek_id uuid not null references public.proyek(id) on delete restrict,
  tanggal date not null default current_date,
  sesi sesi_absensi not null,
  jam_absen timestamptz not null default timezone('utc', now()),
  status status_absensi not null default 'hadir',
  foto_absensi_url text not null,
  latitude double precision not null,
  longitude double precision not null,
  jarak_meter double precision not null,
  laporan_harian text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.foto_laporan (
  id uuid primary key default gen_random_uuid(),
  absensi_id uuid not null references public.absensi(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_url text not null,
  file_path text not null,
  caption text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transaksi_logistik (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  proyek_id uuid not null references public.proyek(id) on delete restrict,
  tanggal_transaksi date not null default current_date,
  nama_toko text,
  nama_material text not null,
  kategori_material text not null,
  satuan text not null,
  jumlah numeric(12,2) not null check (jumlah > 0),
  harga_satuan numeric(14,2) not null check (harga_satuan >= 0),
  total_harga numeric(16,2) generated always as (jumlah * harga_satuan) stored,
  catatan text,
  status status_transaksi not null default 'pending',
  catatan_admin text,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.foto_nota (
  id uuid primary key default gen_random_uuid(),
  transaksi_id uuid not null references public.transaksi_logistik(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_url text not null,
  file_path text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role user_role,
  action text not null check (action in ('INSERT', 'UPDATE')),
  table_name text not null,
  record_id uuid not null,
  summary text,
  payload jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.current_user_role()
returns user_role
language sql
stable
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_proyek_updated_at on public.proyek;
create trigger trg_proyek_updated_at
before update on public.proyek
for each row execute function public.set_updated_at();

drop trigger if exists trg_absensi_updated_at on public.absensi;
create trigger trg_absensi_updated_at
before update on public.absensi
for each row execute function public.set_updated_at();

drop trigger if exists trg_transaksi_updated_at on public.transaksi_logistik;
create trigger trg_transaksi_updated_at
before update on public.transaksi_logistik
for each row execute function public.set_updated_at();

create or replace function public.log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role user_role;
begin
  select role into current_role
  from public.profiles
  where id = auth.uid();

  insert into public.activity_log (
    actor_id,
    actor_role,
    action,
    table_name,
    record_id,
    summary,
    payload
  )
  values (
    auth.uid(),
    current_role,
    tg_op,
    tg_table_name,
    new.id,
    tg_table_name || ' ' || lower(tg_op),
    to_jsonb(new)
  );

  return new;
end;
$$;

drop trigger if exists trg_log_profiles on public.profiles;
create trigger trg_log_profiles
after insert or update on public.profiles
for each row execute function public.log_activity();

drop trigger if exists trg_log_proyek on public.proyek;
create trigger trg_log_proyek
after insert or update on public.proyek
for each row execute function public.log_activity();

drop trigger if exists trg_log_absensi on public.absensi;
create trigger trg_log_absensi
after insert or update on public.absensi
for each row execute function public.log_activity();

drop trigger if exists trg_log_foto_laporan on public.foto_laporan;
create trigger trg_log_foto_laporan
after insert or update on public.foto_laporan
for each row execute function public.log_activity();

drop trigger if exists trg_log_transaksi on public.transaksi_logistik;
create trigger trg_log_transaksi
after insert or update on public.transaksi_logistik
for each row execute function public.log_activity();

drop trigger if exists trg_log_foto_nota on public.foto_nota;
create trigger trg_log_foto_nota
after insert or update on public.foto_nota
for each row execute function public.log_activity();

create or replace function public.enforce_admin_status_only_absensi()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() and (
    new.user_id is distinct from old.user_id or
    new.proyek_id is distinct from old.proyek_id or
    new.tanggal is distinct from old.tanggal or
    new.sesi is distinct from old.sesi or
    new.jam_absen is distinct from old.jam_absen or
    new.foto_absensi_url is distinct from old.foto_absensi_url or
    new.latitude is distinct from old.latitude or
    new.longitude is distinct from old.longitude or
    new.jarak_meter is distinct from old.jarak_meter or
    new.laporan_harian is distinct from old.laporan_harian
  ) then
    raise exception 'admin hanya boleh mengubah status absensi';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_admin_status_absensi_only on public.absensi;
create trigger trg_admin_status_absensi_only
before update on public.absensi
for each row execute function public.enforce_admin_status_only_absensi();

create or replace function public.enforce_admin_status_only_transaksi()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() and (
    new.user_id is distinct from old.user_id or
    new.proyek_id is distinct from old.proyek_id or
    new.tanggal_transaksi is distinct from old.tanggal_transaksi or
    new.nama_toko is distinct from old.nama_toko or
    new.nama_material is distinct from old.nama_material or
    new.kategori_material is distinct from old.kategori_material or
    new.satuan is distinct from old.satuan or
    new.jumlah is distinct from old.jumlah or
    new.harga_satuan is distinct from old.harga_satuan or
    new.catatan is distinct from old.catatan
  ) then
    raise exception 'admin hanya boleh mengubah status transaksi';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_admin_status_transaksi_only on public.transaksi_logistik;
create trigger trg_admin_status_transaksi_only
before update on public.transaksi_logistik
for each row execute function public.enforce_admin_status_only_transaksi();

create or replace function public.get_dashboard_stats(target_tanggal date)
returns table (
  tanggal date,
  total_pengawas bigint,
  total_logistik bigint,
  total_admin bigint,
  total_absensi bigint,
  total_hadir bigint,
  total_terlambat bigint,
  total_absen bigint,
  total_transaksi bigint,
  total_pending bigint,
  total_disetujui bigint,
  total_ditolak bigint,
  total_pengeluaran numeric
)
language sql
stable
as $$
  select
    target_tanggal as tanggal,
    (select count(*) from public.profiles where role = 'pengawas') as total_pengawas,
    (select count(*) from public.profiles where role = 'logistik') as total_logistik,
    (select count(*) from public.profiles where role = 'admin') as total_admin,
    (select count(*) from public.absensi where tanggal = target_tanggal) as total_absensi,
    (select count(*) from public.absensi where tanggal = target_tanggal and status = 'hadir') as total_hadir,
    (select count(*) from public.absensi where tanggal = target_tanggal and status = 'terlambat') as total_terlambat,
    (select count(*) from public.absensi where tanggal = target_tanggal and status = 'absen') as total_absen,
    (select count(*) from public.transaksi_logistik where tanggal_transaksi = target_tanggal) as total_transaksi,
    (select count(*) from public.transaksi_logistik where tanggal_transaksi = target_tanggal and status = 'pending') as total_pending,
    (select count(*) from public.transaksi_logistik where tanggal_transaksi = target_tanggal and status = 'disetujui') as total_disetujui,
    (select count(*) from public.transaksi_logistik where tanggal_transaksi = target_tanggal and status = 'ditolak') as total_ditolak,
    (
      select coalesce(sum(total_harga), 0)
      from public.transaksi_logistik
      where tanggal_transaksi = target_tanggal and status = 'disetujui'
    ) as total_pengeluaran;
$$;

alter table public.profiles enable row level security;
alter table public.proyek enable row level security;
alter table public.absensi enable row level security;
alter table public.foto_laporan enable row level security;
alter table public.transaksi_logistik enable row level security;
alter table public.foto_nota enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "profiles self select" on public.profiles;
create policy "profiles self select"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert"
on public.profiles
for insert
to authenticated
with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "proyek read for all authenticated" on public.proyek;
create policy "proyek read for all authenticated"
on public.proyek
for select
to authenticated
using (true);

drop policy if exists "proyek write admin only" on public.proyek;
create policy "proyek write admin only"
on public.proyek
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "absensi own select or admin" on public.absensi;
create policy "absensi own select or admin"
on public.absensi
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "absensi own insert" on public.absensi;
create policy "absensi own insert"
on public.absensi
for insert
to authenticated
with check (user_id = auth.uid() and public.current_user_role() = 'pengawas');

drop policy if exists "absensi own update or admin status" on public.absensi;
create policy "absensi own update or admin status"
on public.absensi
for update
to authenticated
using ((user_id = auth.uid() and public.current_user_role() = 'pengawas') or public.is_admin())
with check ((user_id = auth.uid() and public.current_user_role() = 'pengawas') or public.is_admin());

drop policy if exists "foto laporan own select or admin" on public.foto_laporan;
create policy "foto laporan own select or admin"
on public.foto_laporan
for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "foto laporan own insert" on public.foto_laporan;
create policy "foto laporan own insert"
on public.foto_laporan
for insert
to authenticated
with check (user_id = auth.uid() and public.current_user_role() = 'pengawas');

drop policy if exists "foto laporan own update" on public.foto_laporan;
create policy "foto laporan own update"
on public.foto_laporan
for update
to authenticated
using (user_id = auth.uid() and public.current_user_role() = 'pengawas')
with check (user_id = auth.uid() and public.current_user_role() = 'pengawas');

drop policy if exists "transaksi own select or admin" on public.transaksi_logistik;
create policy "transaksi own select or admin"
on public.transaksi_logistik
for select
to authenticated
using ((user_id = auth.uid() and public.current_user_role() = 'logistik') or public.is_admin());

drop policy if exists "transaksi own insert" on public.transaksi_logistik;
create policy "transaksi own insert"
on public.transaksi_logistik
for insert
to authenticated
with check (user_id = auth.uid() and public.current_user_role() = 'logistik');

drop policy if exists "transaksi own update or admin status" on public.transaksi_logistik;
create policy "transaksi own update or admin status"
on public.transaksi_logistik
for update
to authenticated
using ((user_id = auth.uid() and public.current_user_role() = 'logistik') or public.is_admin())
with check ((user_id = auth.uid() and public.current_user_role() = 'logistik') or public.is_admin());

drop policy if exists "foto nota own select or admin" on public.foto_nota;
create policy "foto nota own select or admin"
on public.foto_nota
for select
to authenticated
using ((user_id = auth.uid() and public.current_user_role() = 'logistik') or public.is_admin());

drop policy if exists "foto nota own insert" on public.foto_nota;
create policy "foto nota own insert"
on public.foto_nota
for insert
to authenticated
with check (user_id = auth.uid() and public.current_user_role() = 'logistik');

drop policy if exists "foto nota own update" on public.foto_nota;
create policy "foto nota own update"
on public.foto_nota
for update
to authenticated
using (user_id = auth.uid() and public.current_user_role() = 'logistik')
with check (user_id = auth.uid() and public.current_user_role() = 'logistik');

drop policy if exists "activity log admin read" on public.activity_log;
create policy "activity log admin read"
on public.activity_log
for select
to authenticated
using (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('foto-absensi', 'foto-absensi', true),
  ('foto-nota', 'foto-nota', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public read foto absensi" on storage.objects;
create policy "public read foto absensi"
on storage.objects
for select
to public
using (bucket_id = 'foto-absensi');

drop policy if exists "public read foto nota" on storage.objects;
create policy "public read foto nota"
on storage.objects
for select
to public
using (bucket_id = 'foto-nota');

drop policy if exists "authenticated upload foto absensi" on storage.objects;
create policy "authenticated upload foto absensi"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'foto-absensi');

drop policy if exists "authenticated upload foto nota" on storage.objects;
create policy "authenticated upload foto nota"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'foto-nota');
