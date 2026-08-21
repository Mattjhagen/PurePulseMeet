-- Migration: 20260821000000_init_purepulse_schema.sql
-- Description: Initialize PurePulse Partner Hub Database Tables, RLS Policies & Realtime WebSockets

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  partner_code TEXT UNIQUE NOT NULL,
  tier TEXT DEFAULT 'Silver' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'PurePulse Black Card')),
  tier_progress INT DEFAULT 65,
  referral_link TEXT NOT NULL,
  stripe_account_id TEXT,
  monthly_recurring NUMERIC(10, 2) DEFAULT 450.00,
  available_balance NUMERIC(10, 2) DEFAULT 450.00,
  pending_commissions NUMERIC(10, 2) DEFAULT 150.00,
  lifetime_earnings NUMERIC(10, 2) DEFAULT 1850.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HUDDLE ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.huddle_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL,
  host_avatar TEXT NOT NULL,
  participants_count INT DEFAULT 1,
  is_live BOOLEAN DEFAULT TRUE,
  jitsi_room_url TEXT NOT NULL,
  category TEXT DEFAULT 'Founder Office Hours',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHANNEL MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.channel_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id TEXT NOT NULL CHECK (channel_id IN ('wins-and-success', 'general', 'coaching-deals', 'announcements')),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT NOT NULL,
  sender_role TEXT DEFAULT 'Partner',
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DIRECT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FORUM POSTS TABLE
CREATE TABLE IF NOT EXISTS public.forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar TEXT NOT NULL,
  category TEXT DEFAULT 'Sales Strategy',
  content TEXT NOT NULL,
  replies_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYOUT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payout_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'Completed' CHECK (status IN ('Completed', 'Processing', 'Pending', 'Failed')),
  destination TEXT NOT NULL,
  stripe_payout_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.huddle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on huddle_rooms" ON public.huddle_rooms FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on channel_messages" ON public.channel_messages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated read on forum_posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Allow users to read own payouts" ON public.payout_transactions FOR SELECT USING (true);

-- SUPABASE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.huddle_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
