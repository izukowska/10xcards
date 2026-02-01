-- Seed file for development
-- Inserts test user for local development

-- Insert test user into auth.users table
-- This user matches the DEFAULT_USER_ID in src/db/supabase.client.ts
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change_token_current,
  email_change_token_new
) values (
  'efc8e5fc-cfa7-4b39-956f-6e135061e331'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  'izukowska@electrum.pl',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  '',
  '',
  ''
)
on conflict (id) do nothing;
