-- ====================================================================
-- SUPABASE SQL SCHEMA FOR CRB STATUS CHECKER & PAYSTACK WEBHOOK
-- ====================================================================

-- 1. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  email TEXT,
  amount NUMERIC NOT NULL DEFAULT 100,
  currency TEXT NOT NULL DEFAULT 'KES',
  reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index for faster lookup by reference and phone
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_phone ON public.payments(phone);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous users to insert payments (for client app logging)
CREATE POLICY "Allow public insert to payments" 
  ON public.payments 
  FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- 5. Allow anonymous users to read payments (for Admin dashboard & validation)
CREATE POLICY "Allow public read access to payments" 
  ON public.payments 
  FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- ====================================================================
-- PAYSTACK WEBHOOK FUNCTION (SUPABASE EDGE FUNCTION / DATABASE WEBHOOK)
-- ====================================================================
-- When Paystack triggers live webhook for event 'charge.success',
-- it inserts the transaction into the payments table automatically.
--
-- LIVE WEBHOOK URL to paste into Paystack Dashboard:
-- https://jonjgoqndmblrqbzncqu.supabase.co/functions/v1/paystack-webhook
-- ====================================================================
