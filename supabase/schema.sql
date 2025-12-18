-- ============================================
-- MELHOR LEAD - DATABASE SCHEMA
-- ============================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABELA: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  company_name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  search_quota INTEGER DEFAULT 10,
  searches_used INTEGER DEFAULT 0,
  quota_reset_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. TABELA: search_history
-- ============================================
CREATE TABLE IF NOT EXISTS search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_params JSONB NOT NULL,
  results_count INTEGER DEFAULT 0,
  execution_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- Row Level Security
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own searches" ON search_history;
CREATE POLICY "Users can view own searches"
  ON search_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own searches" ON search_history;
CREATE POLICY "Users can insert own searches"
  ON search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own searches" ON search_history;
CREATE POLICY "Users can delete own searches"
  ON search_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. TABELA: saved_companies (BONUS)
-- ============================================
CREATE TABLE IF NOT EXISTS saved_companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cnpj TEXT NOT NULL,
  company_data JSONB NOT NULL,
  tags TEXT[],
  notes TEXT,
  starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cnpj)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_saved_companies_user_id ON saved_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_companies_cnpj ON saved_companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_saved_companies_starred ON saved_companies(user_id, starred) WHERE starred = true;

-- RLS
ALTER TABLE saved_companies ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can manage own saved companies" ON saved_companies;
CREATE POLICY "Users can manage own saved companies"
  ON saved_companies FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 5. TRIGGER: Auto-criar profile
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar novo trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. FUNÇÃO: Reset Quota Mensal
-- ============================================
CREATE OR REPLACE FUNCTION public.reset_monthly_quotas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    searches_used = 0,
    quota_reset_date = NOW() + INTERVAL '1 month'
  WHERE quota_reset_date < NOW();
END;
$$;

-- ============================================
-- 7. STORAGE: Avatars Bucket
-- ============================================
-- Execute no Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true);

-- Storage Policy
-- CREATE POLICY "Avatar images are publicly accessible"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update own avatar"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own avatar"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
