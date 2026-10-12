-- ============================================================================
-- PROCEDURAL VECTOR ART PLAYGROUND - SUPABASE DATABASE AUTH SCHEMA
-- Run this complete script in your Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Enable pgcrypto extension for secure bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create the users table in public schema to store accounts
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure full_name column exists if public.users was already created earlier
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '';

-- Index on lowercase email for fast query lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (LOWER(email));

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Clean up any previous function signatures to avoid parameter conflicts
DROP FUNCTION IF EXISTS public.register_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.register_user(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.login_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.login_user(TEXT, TEXT, TEXT);

-- 5. Secure RPC function for User Registration with full_name
CREATE OR REPLACE FUNCTION public.register_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_id UUID;
  v_created_at TIMESTAMPTZ;
  v_clean_email TEXT;
  v_clean_name TEXT;
BEGIN
  v_clean_email := LOWER(TRIM(user_email));
  v_clean_name := COALESCE(TRIM(user_full_name), '');

  -- Validation
  IF v_clean_email IS NULL OR v_clean_email = '' OR POSITION('@' IN v_clean_email) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Please enter a valid email address.');
  END IF;

  IF LENGTH(user_password) < 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Password must be at least 6 characters.');
  END IF;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE LOWER(TRIM(email)) = v_clean_email) THEN
    RETURN jsonb_build_object('success', false, 'error', 'An account with this email already exists. Please log in.');
  END IF;

  -- Insert user with salted bcrypt hash and full name
  INSERT INTO public.users (email, password_hash, full_name)
  VALUES (v_clean_email, crypt(user_password, gen_salt('bf', 10)), v_clean_name)
  RETURNING id, created_at INTO v_new_id, v_created_at;

  RETURN jsonb_build_object(
    'success', true,
    'user', jsonb_build_object(
      'id', v_new_id,
      'email', v_clean_email,
      'full_name', v_clean_name,
      'created_at', v_created_at
    )
  );
END;
$$;

-- 6. Secure RPC function for User Login returning full_name
CREATE OR REPLACE FUNCTION public.login_user(
  user_email TEXT,
  user_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user RECORD;
  v_clean_email TEXT;
BEGIN
  v_clean_email := LOWER(TRIM(user_email));

  -- Look up user by lowercase email
  BEGIN
    SELECT id, email, password_hash, COALESCE(full_name, '') AS full_name, created_at INTO v_user
    FROM public.users
    WHERE LOWER(TRIM(email)) = v_clean_email;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback in case full_name column doesn't exist yet
    SELECT id, email, password_hash, '' AS full_name, created_at INTO v_user
    FROM public.users
    WHERE LOWER(TRIM(email)) = v_clean_email;
  END;

  IF v_user.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email or password.');
  END IF;

  -- Safe verify password using bcrypt crypt()
  BEGIN
    IF v_user.password_hash = crypt(user_password, v_user.password_hash) THEN
      RETURN jsonb_build_object(
        'success', true,
        'user', jsonb_build_object(
          'id', v_user.id,
          'email', v_user.email,
          'full_name', v_user.full_name,
          'created_at', v_user.created_at
        )
      );
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Invalid email or password.');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email or password.');
  END;
END;
$$;

-- 7. Grant API execution permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_user(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.login_user(TEXT, TEXT) TO anon, authenticated;
