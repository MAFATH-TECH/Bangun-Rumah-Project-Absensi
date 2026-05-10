create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role user_role;
  selected_name text;
  selected_phone text;
begin
  selected_role :=
    case
      when new.raw_user_meta_data->>'role' in ('pengawas', 'logistik', 'admin')
        then (new.raw_user_meta_data->>'role')::user_role
      else 'pengawas'::user_role
    end;

  selected_name :=
    coalesce(
      new.raw_user_meta_data->>'nama_lengkap',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1),
      'User Baru'
    );

  selected_phone :=
    coalesce(
      new.raw_user_meta_data->>'no_hp',
      new.raw_user_meta_data->>'phone'
    );

  insert into public.profiles (id, email, nama_lengkap, no_hp, role)
  values (new.id, new.email, selected_name, selected_phone, selected_role)
  on conflict (id) do update
    set
      email = excluded.email,
      nama_lengkap = excluded.nama_lengkap,
      no_hp = excluded.no_hp,
      role = excluded.role,
      updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists trg_handle_new_auth_user on auth.users;
create trigger trg_handle_new_auth_user
after insert on auth.users
for each row execute function public.handle_new_auth_user();
