export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  partnerCode: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'PurePulse Black Card';
  tierProgress: number; // 0 to 100
  referralLink: string;
  joinedDate: string;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  content: string;
  timestamp: string;
  likesCount: number;
  hasLiked?: boolean;
}

export interface HuddleRoomInfo {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  participantsCount: number;
  isLive: boolean;
  jitsiRoomUrl: string;
  category: 'Deal Coaching' | 'Affiliate Success' | 'Impromptu Q&A' | 'Founder Office Hours';
}

export interface ForumPost {
  id: string;
  title: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  content: string;
  repliesCount: number;
  likesCount: number;
  timestamp: string;
}

export interface BankingAccount {
  availableBalance: number;
  pendingCommissions: number;
  lifetimeEarnings: number;
  activeClientsCount: number;
  monthlyRecurring: number;
  linkClicksCount: number;
  stripeConnected: boolean;
  stripeAccountId?: string;
  cardUnlocked: boolean;
  nextTierGoal: string;
}

export interface PayoutTransaction {
  id: string;
  amount: number;
  status: 'Completed' | 'Processing' | 'Pending';
  date: string;
  destination: string;
}

export interface SocialAsset {
  id: string;
  title: string;
  dimensions: '1:1 Square' | '9:16 Story' | '16:9 Banner';
  defaultHook: string;
  previewUrl: string;
}

export interface PrintableAsset {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  previewType: 'Dark Neon' | 'Clean Light' | 'Local ROI' | 'Tear-Off Poster';
}
