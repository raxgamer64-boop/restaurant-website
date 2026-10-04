-- Run this ONCE in Supabase SQL Editor.
-- It creates the settings row used by the one-file website.
create table if not exists public.restaurant_settings (
  id integer primary key,
  phone text not null default '',
  whatsapp text not null default '',
  upi_id text not null default '',
  upi_name text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.restaurant_settings (id,phone,whatsapp,upi_id,upi_name)
values (1,'9546320565','9546320565','9546320565-2@ibl','Datta Restaurant')
on conflict (id) do update set phone=excluded.phone, whatsapp=excluded.whatsapp, upi_id=excluded.upi_id, upi_name=excluded.upi_name;

alter table public.restaurant_settings enable row level security;

drop policy if exists "public can read restaurant settings" on public.restaurant_settings;
create policy "public can read restaurant settings"
on public.restaurant_settings for select
using (true);

drop policy if exists "admins can manage restaurant settings" on public.restaurant_settings;
create policy "admins can manage restaurant settings"
on public.restaurant_settings for all
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);
