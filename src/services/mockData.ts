import { UserProfile, BankingAccount, ChannelMessage, HuddleRoomInfo, ForumPost, PayoutTransaction, SocialAsset, PrintableAsset } from '../types';

export const initialUserProfile: UserProfile = {
  id: 'user_matty_193',
  name: 'Matty Hagen',
  email: 'matty@purepulse.one',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  partnerCode: 'MATTY193',
  tier: 'Silver',
  tierProgress: 65,
  referralLink: 'https://login.purepulse.one/ref/MATTY193',
  joinedDate: 'August 2026',
};

export const initialBankingAccount: BankingAccount = {
  availableBalance: 450.00,
  pendingCommissions: 150.00,
  lifetimeEarnings: 1850.00,
  activeClientsCount: 3,
  monthlyRecurring: 450.00,
  linkClicksCount: 142,
  stripeConnected: true,
  stripeAccountId: 'acct_1PurePulsePartner',
  cardUnlocked: false,
  nextTierGoal: 'Reach 5 Active Clients to unlock PurePulse Gold Tier & Physical Black Debit Card',
};

export const sampleHuddles: HuddleRoomInfo[] = [
  {
    id: 'huddle-1',
    title: 'Daily Founder Deal Coaching & Objection Handling',
    hostName: 'Matty Hagen (Founder)',
    hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    participantsCount: 8,
    isLive: true,
    jitsiRoomUrl: 'https://meet.jit.si/PurePulseCoaching-DailyHuddle',
    category: 'Founder Office Hours'
  },
  {
    id: 'huddle-2',
    title: 'High-Converting Cold Outreach Scripting',
    hostName: 'Sarah Vance (Top Affiliate)',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    participantsCount: 4,
    isLive: true,
    jitsiRoomUrl: 'https://meet.jit.si/PurePulseCoaching-Scripting',
    category: 'Affiliate Success'
  },
  {
    id: 'huddle-3',
    title: 'Closing $150/mo Business Website Clients',
    hostName: 'Alex Rivera',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    participantsCount: 0,
    isLive: false,
    jitsiRoomUrl: 'https://meet.jit.si/PurePulseCoaching-ClosingDeals',
    category: 'Deal Coaching'
  }
];

export const sampleChannelMessages: ChannelMessage[] = [
  {
    id: 'msg-1',
    channelId: 'wins-and-success',
    senderName: 'Sarah Vance',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    senderRole: 'Gold Partner',
    content: '🚀 Just closed another local dentist on the $150/mo plan using the Signature Dark Neon flyer! That makes 6 active clients this month!',
    timestamp: '10:42 AM',
    likesCount: 12,
    hasLiked: true,
  },
  {
    id: 'msg-2',
    channelId: 'wins-and-success',
    senderName: 'Matty Hagen',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    senderRole: 'Founder',
    content: 'LFG Sarah!! 🔥 Commission payout sent directly to your Stripe account. Keep crushing it!',
    timestamp: '10:45 AM',
    likesCount: 9,
    hasLiked: false,
  },
  {
    id: 'msg-3',
    channelId: 'general',
    senderName: 'David K.',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    senderRole: 'Silver Partner',
    content: 'Hey everyone, hopping into the Jitsi Huddle in 5 mins if anyone wants to roleplay objection handling for local retail clients!',
    timestamp: '11:15 AM',
    likesCount: 4,
    hasLiked: false,
  }
];

export const sampleForumPosts: ForumPost[] = [
  {
    id: 'forum-1',
    title: 'How I Pitch $150 Deposit Websites to Coffee Shops & Cafes',
    authorName: 'Sarah Vance',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    category: 'Sales Strategy',
    content: 'Coffee shop owners hate huge upfront software fees. I walk in with the 10-Tab Tear-Off Poster, leave my card, and mention zero upfront maintenance worry...',
    repliesCount: 18,
    likesCount: 34,
    timestamp: '2 hours ago'
  },
  {
    id: 'forum-2',
    title: 'Top 3 Answers to "Can I update the content myself on vibeCodes?"',
    authorName: 'Matty Hagen',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    category: 'Objection Handling',
    content: 'Yes! VibeCodes allows full self-serve updates or PurePulse fully manages updates for them under the monthly plan.',
    repliesCount: 7,
    likesCount: 21,
    timestamp: '1 day ago'
  }
];

export const samplePayoutLedger: PayoutTransaction[] = [
  {
    id: 'tx-1092',
    amount: 300.00,
    status: 'Completed',
    date: 'Aug 15, 2026',
    destination: 'Stripe Direct Deposit (••4892)'
  },
  {
    id: 'tx-1088',
    amount: 150.00,
    status: 'Completed',
    date: 'Aug 01, 2026',
    destination: 'Stripe Instant Cashout (Debit Card)'
  }
];

export const sampleSocialAssets: SocialAsset[] = [
  {
    id: 'asset-1',
    title: '1:1 Square - Instagram / Feed',
    dimensions: '1:1 Square',
    defaultHook: 'Professional Websites Built for $150 Deposit.',
    previewUrl: 'https://login.purepulse.one/assets/social-1x1.png'
  },
  {
    id: 'asset-2',
    title: '9:16 Story - TikTok / Reels / Stories',
    dimensions: '9:16 Story',
    defaultHook: 'Is Your Business Website Losing Mobile Customers?',
    previewUrl: 'https://login.purepulse.one/assets/social-9x16.png'
  },
  {
    id: 'asset-3',
    title: '16:9 Banner - Twitter / LinkedIn',
    dimensions: '16:9 Banner',
    defaultHook: 'Agency-Quality Websites Without the $5,000 Upfront Price.',
    previewUrl: 'https://login.purepulse.one/assets/social-16x9.png'
  }
];

export const samplePrintableAssets: PrintableAsset[] = [
  {
    id: 'print-1',
    title: 'Signature Dark Neon',
    subtitle: 'High-contrast cyber look with QR & mascot',
    badge: 'Popular',
    previewType: 'Dark Neon'
  },
  {
    id: 'print-2',
    title: 'Studio Clean Light',
    subtitle: 'Minimalist white agency layout for cafes',
    badge: 'Clean',
    previewType: 'Clean Light'
  },
  {
    id: 'print-3',
    title: 'Local Business ROI',
    subtitle: 'Direct pitch: $150 deposit, zero headaches',
    badge: 'Direct Pitch',
    previewType: 'Local ROI'
  },
  {
    id: 'print-4',
    title: '10-Tab Tear-Off Poster',
    subtitle: 'Tear-away slips with QR & code for community boards',
    badge: 'High Conversion',
    previewType: 'Tear-Off Poster'
  }
];
