-- Jalankan di Supabase SQL Editor jika belum ada di remote
create or replace function public.get_server_now()
returns timestamptz
language sql
stable
security definer
set search_path = public
as $$
  select now();
$$;

grant execute on function public.get_server_now() to authenticated;

create or replace function public.validate_slot_upload(p_slot integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_cfg public.konfigurasi_slot%rowtype;
  v_start timestamptz;
  v_end timestamptz;
  v_tz text := 'Asia/Jakarta';
begin
  select * into v_cfg from public.konfigurasi_slot where slot = p_slot limit 1;
  if not found then
    return jsonb_build_object('valid', false, 'reason', 'Konfigurasi slot tidak ditemukan');
  end if;

  v_start := (date_trunc('day', v_now at time zone v_tz) + v_cfg.jam_mulai::time) at time zone v_tz;
  v_end := (date_trunc('day', v_now at time zone v_tz) + v_cfg.jam_selesai::time) at time zone v_tz;

  if v_now < v_start or v_now > v_end then
    return jsonb_build_object(
      'valid', false,
      'reason', format('Di luar jam slot (%s–%s)', v_cfg.jam_mulai, v_cfg.jam_selesai),
      'server_now', v_now,
      'jam_mulai', v_cfg.jam_mulai,
      'jam_selesai', v_cfg.jam_selesai
    );
  end if;

  return jsonb_build_object('valid', true, 'server_now', v_now);
end;
$$;

grant execute on function public.validate_slot_upload(integer) to authenticated;
