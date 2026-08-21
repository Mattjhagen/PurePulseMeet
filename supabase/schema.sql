-- PurePulse Partner Hub Supabase Database Schema Migration
-- Execute this SQL script in your Supabase SQL Editor (https://app.supabase.com)

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Tied to Supabase Auth)
--------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------
-- 2. HUDDLE ROOMS TABLE (Live Jitsi Meetings)
--------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------
-- 3. CHANNEL MESSAGES TABLE (Slack/Teams Group Channels)
--------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------
-- 4. DIRECT MESSAGES TABLE (1-on-1 Private DMs)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 5. FORUM POSTS TABLE (Strategy & Objection Handling Boards)
--------------------------------------------------------------------------------
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

--------------------------------------------------------------------------------
-- 6. PAYOUT TRANSACTIONS TABLE (Stripe Connect Ledger)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payout_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'Completed' CHECK (status IN ('Completed', 'Processing', 'Pending', 'Failed')),
  destination TEXT NOT NULL,
  stripe_payout_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- 7. ENABLE ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.huddle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and insert data
CREATE POLICY "Allow public read access on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow authenticated read on huddle_rooms" ON public.huddle_rooms FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on huddle_rooms" ON public.huddle_rooms FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read on channel_messages" ON public.channel_messages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on channel_messages" ON public.channel_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated read on forum_posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on forum_posts" ON public.forum_posts FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to read own payouts" ON public.payout_transactions FOR SELECT USING (true);

--------------------------------------------------------------------------------
-- 8. SUPABASE REALTIME ENABLEMENT
--------------------------------------------------------------------------------
-- Enable WebSockets for live chat, DM updates, and huddle room status changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.huddle_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;

--------------------------------------------------------------------------------
-- 9. INITIAL DEMO SEED DATA
--------------------------------------------------------------------------------
INSERT INTO public.huddle_rooms (title, host_name, host_avatar, participants_count, is_live, jitsi_room_url, category) VALUES
('Daily Founder Deal Coaching & Objection Handling', 'Matty Hagen (Founder)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 8, true, 'https://meet.jit.si/PurePulseCoaching-DailyHuddle', 'Founder Office Hours'),
('High-Converting Cold Outreach Scripting', 'Sarah Vance (Top Affiliate)', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 4, true, 'https://meet.jit.si/PurePulseCoaching-Scripting', 'Affiliate Success');

INSERT INTO public.channel_messages (channel_id, sender_name, sender_avatar, sender_role, content, likes_count) VALUES
('wins-and-success', 'Sarah Vance', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'Gold Partner', '🚀 Just closed another local dentist on the $150/mo plan using the Signature Dark Neon flyer! That makes 6 active clients this month!', 12),
('wins-and-success', 'Matty Hagen', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Founder', 'LFG Sarah!! 🔥 Commission payout sent directly to your Stripe account. Keep crushing it!', 9),
('general', 'David K.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 'Silver Partner', 'Hey everyone, hopping into the Jitsi Huddle in 5 mins if anyone wants to roleplay objection handling for local retail clients!', 4);

INSERT INTO public.forum_posts (title, author_name, author_avatar, category, content, replies_count, likes_count) VALUES
('How I Pitch $150 Deposit Websites to Coffee Shops & Cafes', 'Sarah Vance', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 'Sales Strategy', 'Coffee shop owners hate huge upfront software fees. I walk in with the 10-Tab Tear-Off Poster, leave my card, and mention zero upfront maintenance worry...', 18, 34),
('Top 3 Answers to "Can I update the content myself on vibeCodes?"', 'Matty Hagen', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Objection Handling', 'Yes! VibeCodes allows full self-serve updates or PurePulse fully manages updates for them under the monthly plan.', 7, 21);
