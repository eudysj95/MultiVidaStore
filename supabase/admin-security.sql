-- Endurecimiento de RLS para el admin de MultiVidaStore.
-- Ejecutar en Supabase → SQL Editor.
--
-- IMPORTANTE: después de ejecutarlo, cerrá sesión y volvé a entrar
-- en el admin para que el JWT incluya app_metadata.role = 'admin'.
-- Sin ese paso, las escrituras van a fallar con error de RLS.

-- 1) Marcar al usuario admin con el rol.
--    Reemplazá 'TU_EMAIL_ADMIN' por el email con el que entrás al panel.
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'TU_EMAIL_ADMIN';

-- 2) Productos: borrar policies de escritura y recrearlas solo para admin.
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'products'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  loop
    execute format('drop policy if exists %I on public.products', pol.policyname);
  end loop;
end $$;

create policy "Admin can insert products"
  on public.products
  for insert
  to authenticated
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admin can update products"
  on public.products
  for update
  to authenticated
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admin can delete products"
  on public.products
  for delete
  to authenticated
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 3) Categorías: mismo criterio.
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
  loop
    execute format('drop policy if exists %I on public.categories', pol.policyname);
  end loop;
end $$;

create policy "Admin can insert categories"
  on public.categories
  for insert
  to authenticated
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admin can update categories"
  on public.categories
  for update
  to authenticated
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admin can delete categories"
  on public.categories
  for delete
  to authenticated
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- 4) Storage: solo admin puede subir, reemplazar o borrar imágenes.
drop policy if exists "Admins can upload product images" on storage.objects;
drop policy if exists "Admins can update product images" on storage.objects;
drop policy if exists "Admins can delete product images" on storage.objects;

create policy "Admins can upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

create policy "Admins can update product images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  )
  with check (
    bucket_id = 'product-images'
    and auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

create policy "Admins can delete product images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

-- 5) Verificación rápida: debería listar las policies nuevas.
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('products', 'categories')
  and cmd in ('INSERT', 'UPDATE', 'DELETE', 'ALL')
order by tablename, cmd;
