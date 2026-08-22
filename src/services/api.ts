import { supabase } from './auth';
import {
  UserProfile,
  ChannelMessage,
  HuddleRoomInfo,
  BankingAccount,
  PayoutTransaction,
  IssuingProvisionRequest,
  IssuingStatus,
  IssuingTransaction,
  ConnectSandboxStatus,
  AffiliateDirectoryEntry,
  DirectMessage,
  ForumPost,
  ForumComment,
} from '../types';

const DEFAULT_AVATAR = 'https://login.purepulse.one/assets/default-avatar.png';
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://login.purepulse.one').replace(/\/$/, '');

async function authenticatedApi<T>(path: string, init?: RequestInit): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Authentication required');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => null) as (T & { error?: string }) | null;
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status})`);
  if (!body) throw new Error('The server returned an empty response');
  return body;
}

// Fetch Current User Profile from Supabase or Auth state
export async function getCurrentUserProfile(): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  // Query Supabase affiliates table
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (affiliate) {
    return {
      id: affiliate.id,
      name: affiliate.name || user.email?.split('@')[0] || 'Partner',
      email: affiliate.email || user.email || '',
      avatarUrl: affiliate.avatar_url || DEFAULT_AVATAR,
      partnerCode: affiliate.referral_code,
      tier: affiliate.tier || 'Silver',
      tierProgress: affiliate.tier_progress ?? 0,
      referralLink: `https://login.purepulse.one/ref/${affiliate.referral_code}`,
      joinedDate: new Date(affiliate.created_at).toISOString().split('T')[0],
    };
  }

  throw new Error('No affiliate account is linked to this login');
}

// Fetch Channel Messages from Supabase
export async function fetchChannelMessages(channelId: string): Promise<ChannelMessage[]> {
  const { data, error } = await supabase
    .from('channel_messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) {
    return [];
  }

  return data.map(msg => ({
    id: msg.id,
    channelId: msg.channel_id,
    senderName: msg.sender_name || 'Partner',
    senderAvatar: msg.sender_avatar || DEFAULT_AVATAR,
    senderRole: msg.sender_role || 'Affiliate',
    content: msg.content,
    timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    likesCount: msg.likes_count || 0,
    hasLiked: false,
  }));
}

// Send a New Channel Message
export async function sendChannelMessage(channelId: string, content: string, senderName: string, senderAvatar: string): Promise<ChannelMessage | null> {
  const profile = await getCurrentUserProfile();
  const { data, error } = await supabase
    .from('channel_messages')
    .insert([
      {
        channel_id: channelId,
        sender_id: profile.id,
        content,
        sender_name: senderName,
        sender_avatar: senderAvatar,
        sender_role: 'Partner',
        likes_count: 0,
      }
    ])
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    channelId: data.channel_id,
    senderName: data.sender_name,
    senderAvatar: data.sender_avatar,
    senderRole: data.sender_role,
    content: data.content,
    timestamp: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    likesCount: 0,
  };
}

// Subscribe to Realtime Channel Messages
export function subscribeToChannelMessages(channelId: string, onNewMessage: (msg: ChannelMessage) => void) {
  return supabase
    .channel(`channel_${channelId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'channel_messages', filter: `channel_id=eq.${channelId}` },
      (payload) => {
        const msg = payload.new;
        onNewMessage({
          id: msg.id,
          channelId: msg.channel_id,
          senderName: msg.sender_name || 'Partner',
          senderAvatar: msg.sender_avatar || DEFAULT_AVATAR,
          senderRole: msg.sender_role || 'Partner',
          content: msg.content,
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          likesCount: msg.likes_count || 0,
        });
      }
    )
    .subscribe();
}

// Fetch Huddle Rooms from Supabase
export async function fetchHuddleRooms(): Promise<HuddleRoomInfo[]> {
  const { data, error } = await supabase
    .from('huddle_rooms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(room => ({
    id: room.id,
    title: room.title,
    hostName: room.host_name || 'Host',
    hostAvatar: room.host_avatar || DEFAULT_AVATAR,
    participantsCount: room.participants_count || 1,
    isLive: room.is_live,
    jitsiRoomUrl: room.jitsi_room_url,
    category: room.category || 'Deal Coaching',
    hostId: room.host_id,
  }));
}

export async function createHuddleRoom(title: string, category: HuddleRoomInfo['category']): Promise<HuddleRoomInfo> {
  const profile = await getCurrentUserProfile();
  if (!profile.email.toLowerCase().endsWith('@purepulse.one')) {
    throw new Error('Only verified @purepulse.one team members can create huddles.');
  }
  const roomSlug = `PurePulse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data, error } = await supabase.from('huddle_rooms').insert({
    title: title.trim(),
    host_id: profile.id,
    host_name: profile.name,
    host_avatar: profile.avatarUrl,
    participants_count: 1,
    is_live: true,
    jitsi_room_url: `https://meet.jit.si/${roomSlug}`,
    category,
  }).select().single();
  if (error) throw error;
  return {
    id: data.id, title: data.title, hostName: data.host_name, hostAvatar: data.host_avatar,
    participantsCount: data.participants_count, isLive: data.is_live, jitsiRoomUrl: data.jitsi_room_url,
    category: data.category, hostId: data.host_id,
  };
}

export function subscribeToHuddleRooms(onChange: () => void) {
  return supabase.channel('live_huddle_rooms').on(
    'postgres_changes', { event: '*', schema: 'public', table: 'huddle_rooms' }, onChange,
  ).subscribe();
}

export async function fetchAffiliateDirectory(): Promise<AffiliateDirectoryEntry[]> {
  const { data, error } = await supabase.rpc('list_affiliate_directory');
  if (error) throw error;
  return (data || []).map((entry: any) => ({
    id: entry.id,
    name: entry.name || 'Affiliate',
    avatarUrl: entry.avatar_url || DEFAULT_AVATAR,
    tier: entry.tier || 'Affiliate',
  }));
}

export async function fetchDirectMessages(otherAffiliateId: string): Promise<DirectMessage[]> {
  const profile = await getCurrentUserProfile();
  const { data, error } = await supabase.from('direct_messages').select('*')
    .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${otherAffiliateId}),and(sender_id.eq.${otherAffiliateId},receiver_id.eq.${profile.id})`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((message) => ({
    id: message.id, senderId: message.sender_id, receiverId: message.receiver_id,
    content: message.content, createdAt: message.created_at,
  }));
}

export async function sendDirectMessage(receiverId: string, content: string): Promise<void> {
  const profile = await getCurrentUserProfile();
  const { error } = await supabase.from('direct_messages').insert({
    sender_id: profile.id, receiver_id: receiverId, content: content.trim(),
  });
  if (error) throw error;
}

export function subscribeToDirectMessages(onMessage: (message: DirectMessage) => void) {
  return supabase.channel('affiliate_direct_messages').on(
    'postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' },
    ({ new: message }) => onMessage({
      id: message.id, senderId: message.sender_id, receiverId: message.receiver_id,
      content: message.content, createdAt: message.created_at,
    }),
  ).subscribe();
}

export async function fetchForumPosts(): Promise<ForumPost[]> {
  const { data, error } = await supabase.from('forum_posts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((post) => ({
    id: post.id, title: post.title, authorName: post.author_name || 'Affiliate',
    authorAvatar: post.author_avatar || DEFAULT_AVATAR, category: post.category || 'Community',
    content: post.content, repliesCount: post.replies_count || 0, likesCount: post.likes_count || 0,
    timestamp: new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
  }));
}

export async function createForumPost(title: string, content: string, category: string): Promise<void> {
  const profile = await getCurrentUserProfile();
  const { error } = await supabase.from('forum_posts').insert({
    title: title.trim(), content: content.trim(), category,
    author_id: profile.id, author_name: profile.name, author_avatar: profile.avatarUrl,
    replies_count: 0, likes_count: 0,
  });
  if (error) throw error;
}

export async function fetchForumComments(postId: string): Promise<ForumComment[]> {
  const { data, error } = await supabase.from('forum_comments').select('*').eq('post_id', postId).order('created_at');
  if (error) throw error;
  return (data || []).map((comment) => ({ id: comment.id, postId: comment.post_id, authorName: comment.author_name, authorAvatar: comment.author_avatar || DEFAULT_AVATAR, content: comment.content, timestamp: new Date(comment.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }));
}

export async function createForumComment(postId: string, content: string): Promise<void> {
  const profile = await getCurrentUserProfile();
  const { error } = await supabase.from('forum_comments').insert({ post_id: postId, author_id: profile.id, author_name: profile.name, author_avatar: profile.avatarUrl, content: content.trim() });
  if (error) throw error;
}

// Fetch Banking Account & Payout Summary
export async function fetchBankingAccount(): Promise<BankingAccount> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (affiliate) {
      return {
        availableBalance: Number(affiliate.available_balance ?? 0),
        pendingCommissions: Number(affiliate.pending_commissions ?? 0),
        lifetimeEarnings: Number(affiliate.lifetime_earnings ?? 0),
        activeClientsCount: Number(affiliate.active_clients ?? 0),
        monthlyRecurring: Number(affiliate.monthly_recurring ?? 0),
        linkClicksCount: Number(affiliate.clicks ?? 0),
        stripeConnected: Boolean(affiliate.payouts_enabled),
        stripeAccountId: affiliate.stripe_account_id || undefined,
        cardUnlocked: Boolean(affiliate.issuing_card_id),
        nextTierGoal: affiliate.next_tier_goal || 'Keep growing your active referrals to reach the next tier.',
      };
    }
  }

  throw new Error(user ? 'Affiliate banking account not found' : 'Authentication required');
}

// Fetch Payout Transactions from Supabase
export async function fetchPayoutTransactions(): Promise<PayoutTransaction[]> {
  const { data, error } = await supabase
    .from('payout_transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(tx => ({
    id: tx.id,
    amount: tx.amount,
    status: tx.status || 'Completed',
    date: new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    destination: tx.destination || 'Stripe payout',
  }));
}

export async function fetchIssuingStatus(): Promise<IssuingStatus> {
  const result = await authenticatedApi<{
    eligible: boolean;
    provisioning_enabled: boolean;
    account: IssuingStatus['account'];
  }>('/api/affiliates/issuing/status');

  return {
    eligible: result.eligible,
    provisioningEnabled: result.provisioning_enabled,
    account: result.account,
  };
}

export async function provisionIssuingCard(request: IssuingProvisionRequest): Promise<void> {
  await authenticatedApi('/api/affiliates/issuing/provision', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function fetchIssuingTransactions(): Promise<IssuingTransaction[]> {
  const { data, error } = await supabase
    .from('affiliate_issuing_transactions')
    .select('id, amount_cents, currency, merchant_name, merchant_category, status, type, created_at')
    .order('created_at', { ascending: false })
    .limit(25);

  if (error) throw error;
  return (data || []).map(tx => ({
    id: tx.id,
    amount: Number(tx.amount_cents || 0) / 100,
    currency: String(tx.currency || 'usd').toUpperCase(),
    merchantName: tx.merchant_name || 'Card transaction',
    merchantCategory: tx.merchant_category || undefined,
    status: tx.status,
    type: tx.type,
    date: new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
  }));
}

export async function fetchConnectSandboxStatus(): Promise<ConnectSandboxStatus> {
  const result = await authenticatedApi<{
    enabled: boolean;
    status: ConnectSandboxStatus['status'];
    transfers_enabled: boolean;
    requirements_due: string[];
    account: ConnectSandboxStatus['account'];
    last_synced_at?: string | null;
    warning?: string;
  }>('/api/affiliates/connect-sandbox/status');

  return {
    enabled: result.enabled,
    status: result.status,
    transfersEnabled: result.transfers_enabled,
    requirementsDue: result.requirements_due || [],
    account: result.account,
    lastSyncedAt: result.last_synced_at,
    warning: result.warning,
  };
}

export async function createConnectSandboxOnboardingLink(): Promise<{ url: string; expiresAt?: number }> {
  const result = await authenticatedApi<{ url: string; expires_at?: number }>(
    '/api/affiliates/connect-sandbox/onboard',
    { method: 'POST', body: JSON.stringify({}) },
  );
  return { url: result.url, expiresAt: result.expires_at };
}

// Claim Mobile Pair Code from Web Dashboard
export async function claimMobilePairCode(code: string): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Please log in with Google or Apple first.' };
  }

  const { data, error } = await supabase.rpc('claim_mobile_pair_code', {
    p_code: code.trim(),
  });

  if (error || !data || !data.success) {
    return { success: false, error: data?.error || error?.message || 'Invalid or expired pair code' };
  }

  return { success: true };
}
