# PurePulse Meet & Partner Banking App

An all-in-one cross-platform mobile application (built with Expo, React Native, and TypeScript) for **PurePulse** affiliates combining:
- 🎥 **Teams & Slack-Style Collaboration Hub**: Live audio/video meeting rooms (powered by Jitsi Meet), group chat channels, strategy forums, and 1-on-1 coaching DMs.
- 💳 **DoorDash/Uber-Style Affiliate Banking**: Pilot-inspired financial dashboard, tier progression gamification (Bronze to Black Card), interactive debit card preview, and Stripe Connect Express instant payouts.
- 🎨 **Affiliate Studio & Marketing Hub**: Unique referral link generator (`MATTY193`), 1:1 / 9:16 / 16:9 social graphic studio with custom headline hooks, pre-written high-converting copy, and printable flyer previews.

---

## 🚀 Features Implemented

### 1. Teams & Coaching Huddles Hub
- **Jitsi Meet Live Rooms**: Impromptu video/audio coaching huddles (`JitsiHuddleRoom.tsx`) with room controls (Mute, Camera toggle, Raise Hand, Leave Room).
- **Slack-Style Group Channels**: Realtime chat feeds for `#wins-and-success`, `#general`, `#coaching-deals`, and `#announcements` (`ChannelFeed.tsx`).
- **Coaching DMs & Strategy Forum**: Direct 1-on-1 messaging with coaches/founders and threaded strategy boards for objection handling.

### 2. Gamified Partner Banking & Payouts (Pilot-Inspired)
- **Financial Command Center**: Real-time counters for Available Cashout Balance, Accruing MRR, Pending Commissions, and Lifetime Paid Out (`BankDashboard.tsx`).
- **Interactive Partner Card**: Dynamic virtual debit card view (`VirtualCardView.tsx`) featuring tier status, partner code, metallic foil gradient background, and chip graphic.
- **Tier Progression Gamification**: 5-tier ladder (Bronze -> Silver -> Gold -> Platinum -> PurePulse Black Card) with milestone progress bars and perk unlocks (`TierProgression.tsx`).
- **Stripe Connect Cashout Drawer**: 1-tap instant debit card cashouts (1-5 min) & standard direct deposit setup (`StripePayoutModal.tsx`).

### 3. PurePulse Affiliate & Campaign Studio
- **Referral Link & Code Hub**: 1-tap copy for unique referral link (`https://login.purepulse.one/ref/MATTY193`), test link launcher, and active client MRR tracking (`AffiliateOverview.tsx`).
- **Social Campaign Studio**: Dynamic 1:1 Square, 9:16 Story, and 16:9 Banner graphic previews with editable headline hooks (`SocialCampaignStudio.tsx`).
- **1-Click Pre-Written Copy**: High-converting social post scripts ready to copy and share.
- **Printable Assets Hub**: Full-page Letter 8.5x11 flyer previews for Signature Dark Neon, Studio Clean Light, Local Business ROI, and 10-Tab Tear-Off Posters (`PrintableAssetsHub.tsx`).

---

## 🛠️ Getting Started & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI (`npm install -g expo-cli` or `npx expo`)
- Expo Go app on your iOS or Android device (or Xcode Simulator / Android Studio Emulator)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Mattjhagen/PurePulseMeet.git
cd PurePulseMeet

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npx expo start
```

- Press `i` to launch in iOS Simulator
- Press `a` to launch in Android Emulator
- Press `w` to open web preview in browser

---

## 📋 What You Need to Do on Your End (Production Checklist)

To connect the app to your live backend infrastructure, follow these steps:

### 1. Supabase Setup (Database, Realtime & Auth)
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Create `.env` file in root:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run SQL migration script for tables: `channel_messages`, `direct_messages`, `forum_posts`, and `huddle_rooms`.

### 2. Stripe Connect Express Integration (Affiliate Payouts)
1. Activate **Stripe Connect** in your Stripe Dashboard (`dashboard.stripe.com/connect`).
2. Set account type to **Express** (recommended so Stripe securely handles affiliate KYC and 1099 tax forms).
3. Set your publishable key in `.env`:
   ```env
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   ```
4. Deploy a serverless endpoint (Vercel / Supabase Edge Functions) to handle `/api/create-express-account` and `/api/payout`.

### 3. Jitsi Meet Server Configuration
- By default, the app connects to public Jitsi Meet rooms (`https://meet.jit.si/PurePulseCoaching-...`).
- If you run your own self-hosted Jitsi instance or 8x8 Jitsi as a Service (JaaS), update `jitsiRoomUrl` in `src/components/community/JitsiHuddleRoom.tsx`.

### 4. Push Notifications (Expo + FCM / APNs)
1. Configure **Expo Notifications** in `app.json` with your Apple Developer Team ID and Firebase Cloud Messaging server key.
2. Test push alerts for channel mentions, new DMs, and instant payout confirmations.

### 5. Resend Email Notifications
- Add your `RESEND_API_KEY` to send instant email receipts whenever an affiliate triggers a cashout or achieves a new tier level.

---

## 🔮 Future Feature Roadmap

- [ ] **Native LiveKit / WebRTC SDK Migration**: Support background audio streaming so affiliates can listen to live coaching huddles while using other apps.
- [ ] **Physical Card Issuing via Stripe Issuing**: Allow Gold+ partners to request an official physical metallic PurePulse Black Debit Card mailed to their address.
- [ ] **Leaderboards & Monthly Contests**: Live leaderboard tab ranking top affiliates by MRR generated each month with cash prize pools.
- [ ] **In-App Deep Linking**: Support `purepulse://huddle/<id>` links so push notifications launch users directly into a live coaching room.
