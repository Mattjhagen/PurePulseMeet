# PurePulse Partner Hub - Mobile Application (iOS & Android)

Welcome to the **PurePulse Partner Hub** mobile codebase! This cross-platform mobile application is built with **Expo / React Native**, **Supabase (Auth, Postgres, Realtime WebSockets)**, **Stripe Connect Express**, and **Jitsi Meet**.

---

## 📱 Features & Capabilities

- **📹 Live Video & Audio Coaching Huddles:** Embedded Jitsi Meet video rooms (`https://meet.jit.si/`) with mic/camera toggles, hand raising, and live founder Q&A.
- **💬 Real-Time Channels & Direct Messages:** Slack-style channels (`#wins-and-success`, `#general`, `#coaching-deals`, `#announcements`) powered by Supabase Realtime WebSockets.
- **💳 DoorDash-Style Affiliate Banking:** Interactive metallic partner debit card, accrued MRR counter, pending commissions, and 1-tap Stripe instant cashout drawer.
- **🏆 5-Tier Partner Gamification:** Tier progression ladder (Bronze ➔ Silver ➔ Gold ➔ Platinum ➔ PurePulse Black Card) with milestone progress bars.
- **🎨 Social Campaign & Asset Studio:** Custom 1:1, 9:16 vertical, and 16:9 graphic previews with 1-click copy outreach scripts and partner referral link (`MATTY193`).
- **📄 Printable Asset Hub:** Full-page Letter 8.5x11 flyer templates, business cards, and tear-off posters featuring unique partner QR codes.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework:** React Native 0.76.6 / Expo SDK 52
- **Backend & Auth:** Supabase Auth (Google OAuth & Apple Sign-In) + Postgres DB
- **Realtime Sync:** Supabase Realtime WebSocket Subscriptions (`postgres_changes`)
- **Payments & Payouts:** Stripe Connect Express
- **Video Meetings:** React Native WebView + Jitsi Meet (`meet.jit.si`)
- **CI/CD Build System:** Expo Application Services (EAS Build & Submit)

---

## ⚙️ Backend & Database Wiring Guide

### 1. Supabase Database Schema
The app connects to Supabase instance: `https://cucksfwkdmrkeiwmdlut.supabase.co`.

Execute the following database migration (`027_purepulse_meet_and_gamification.sql`) inside your Supabase SQL Editor:

```sql
-- 1. Extend affiliates table
ALTER TABLE public.affiliates
ADD COLUMN IF NOT EXISTS tier text DEFAULT 'Silver',
ADD COLUMN IF NOT EXISTS tier_progress integer DEFAULT 45,
ADD COLUMN IF NOT EXISTS available_balance numeric DEFAULT 450.00,
ADD COLUMN IF NOT EXISTS pending_commissions numeric DEFAULT 125.00,
ADD COLUMN IF NOT EXISTS lifetime_earnings numeric DEFAULT 2480.00,
ADD COLUMN IF NOT EXISTS monthly_recurring numeric DEFAULT 840.00,
ADD COLUMN IF NOT EXISTS active_clients integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS link_clicks integer DEFAULT 342,
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Create huddle_rooms table
CREATE TABLE IF NOT EXISTS public.huddle_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  host_name text NOT NULL,
  host_avatar text,
  participants_count integer DEFAULT 1,
  is_live boolean DEFAULT true,
  jitsi_room_url text NOT NULL,
  category text DEFAULT 'Deal Coaching',
  created_at timestamptz DEFAULT now()
);

-- 3. Create channel_messages table
CREATE TABLE IF NOT EXISTS public.channel_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL,
  sender_name text NOT NULL,
  sender_avatar text,
  sender_role text DEFAULT 'Partner',
  content text NOT NULL,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Create payout_transactions table
CREATE TABLE IF NOT EXISTS public.payout_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES public.affiliates(id),
  amount numeric NOT NULL,
  status text DEFAULT 'Completed',
  destination text DEFAULT 'Stripe Instant Cashout',
  created_at timestamptz DEFAULT now()
);

-- 5. Enable Realtime on Chat & Huddles
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.huddle_rooms;
```

---

## 🔐 OAuth Configuration (Google & Apple)

### 🍏 Apple Sign-In (Supabase Auth Setup)
1. Go to **Supabase Dashboard** ➔ **Auth** ➔ **Providers** ➔ **Apple**.
2. Set **Services ID**: `one.purepulse.partner.sid`
3. Set **Apple Team ID**: `WZMXKCK98R`
4. Set **Key ID**: `7Q56FF5CGW`
5. Paste the generated Apple Client Secret JWT (generated via `node scripts/generate_apple_secret.js`).

### 🌐 Google OAuth
1. Go to **Google Cloud Console** ➔ **OAuth 2.0 Client IDs**.
2. Add Authorized Redirect URI: `https://cucksfwkdmrkeiwmdlut.supabase.co/auth/v1/callback`.
3. In Supabase Dashboard, paste **Client ID** & **Client Secret**.

---

## 💳 Stripe Connect Express Instant Cashouts

To wire real-time instant cashouts:
1. In `purepulse-admin`, set up a Next.js API route `/api/stripe/create-connect-account` to generate Stripe Connect onboarding links for affiliates.
2. When an affiliate taps **Instant Cashout** in the app, the app triggers a transfer via Stripe API (`stripe.transfers.create` or `stripe.payouts.create` with `method: 'instant'`).
3. Store completed payout records in `public.payout_transactions` table to update the mobile ledger in real-time.

---

## 🚀 Building & Submitting with EAS CLI

### 1. Build Standalone Direct-Install Android APK
```bash
eas build --platform android --profile preview
```

### 2. Build Production iOS (.ipa) & Android (.aab)
```bash
EXPO_NO_CAPABILITY_SYNC=1 eas build --platform all --profile production
```

### 3. Submit to Apple App Store Connect
```bash
eas submit --platform ios
```

---

## 📄 License & Ownership
Copyright © 2026 PurePulse Inc. All rights reserved.
