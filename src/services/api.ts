import { supabase } from './auth';
import { UserProfile, ChannelMessage, HuddleRoomInfo, ForumPost, BankingAccount, PayoutTransaction } from '../types';

// Fetch Current User Profile from Supabase or Auth state
export async function getCurrentUserProfile(): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      id: 'guest',
      name: 'PurePulse Partner',
      email: 'partner@purepulse.one',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      partnerCode: 'MATTY193',
      tier: 'Silver',
      tierProgress: 45,
      referralLink: 'https://login.purepulse.one/ref/MATTY193',
      joinedDate: new Date().toISOString().split('T')[0],
    };
  }

  // Query Supabase affiliates table
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (affiliate) {
    return {
      id: affiliate.id,
      name: affiliate.name || user.email?.split('@')[0] || 'Partner',
      email: affiliate.email || user.email || '',
      avatarUrl: affiliate.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      partnerCode: affiliate.ref_code || 'MATTY193',
      tier: affiliate.tier || 'Silver',
      tierProgress: affiliate.tier_progress || 50,
      referralLink: `https://login.purepulse.one/ref/${affiliate.ref_code || 'MATTY193'}`,
      joinedDate: affiliate.created_at ? new Date(affiliate.created_at).toISOString().split('T')[0] : '2026-01-01',
    };
  }

  return {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Partner',
    email: user.email || '',
    avatarUrl: user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    partnerCode: 'MATTY193',
    tier: 'Bronze',
    tierProgress: 20,
    referralLink: 'https://login.purepulse.one/ref/MATTY193',
    joinedDate: new Date().toISOString().split('T')[0],
  };
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
    senderAvatar: msg.sender_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    senderRole: msg.sender_role || 'Affiliate',
    content: msg.content,
    timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    likesCount: msg.likes_count || 0,
    hasLiked: false,
  }));
}

// Send a New Channel Message
export async function sendChannelMessage(channelId: string, content: string, senderName: string, senderAvatar: string): Promise<ChannelMessage | null> {
  const { data, error } = await supabase
    .from('channel_messages')
    .insert([
      {
        channel_id: channelId,
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
          senderAvatar: msg.sender_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
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

  if (error || !data || data.length === 0) {
    return [
      {
        id: 'huddle-1',
        title: 'Global Founder Pitch & Sales Huddle',
        hostName: 'Matty Hagen',
        hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        participantsCount: 14,
        isLive: true,
        jitsiRoomUrl: 'https://meet.jit.si/PurePulseGlobalHuddle',
        category: 'Founder Office Hours',
      },
      {
        id: 'huddle-2',
        title: 'High-Converting Objection Handling Workshop',
        hostName: 'Sarah Jenkins',
        hostAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        participantsCount: 8,
        isLive: false,
        jitsiRoomUrl: 'https://meet.jit.si/PurePulseObjectionCoaching',
        category: 'Deal Coaching',
      }
    ];
  }

  return data.map(room => ({
    id: room.id,
    title: room.title,
    hostName: room.host_name || 'Host',
    hostAvatar: room.host_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    participantsCount: room.participants_count || 1,
    isLive: room.is_live,
    jitsiRoomUrl: room.jitsi_room_url || `https://meet.jit.si/PurePulseRoom_${room.id}`,
    category: room.category || 'Deal Coaching',
  }));
}

// Fetch Banking Account & Payout Summary
export async function fetchBankingAccount(): Promise<BankingAccount> {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (affiliate) {
      return {
        availableBalance: affiliate.available_balance || 450.00,
        pendingCommissions: affiliate.pending_commissions || 125.00,
        lifetimeEarnings: affiliate.lifetime_earnings || 2480.00,
        activeClientsCount: affiliate.active_clients || 12,
        monthlyRecurring: affiliate.monthly_recurring || 840.00,
        linkClicksCount: affiliate.link_clicks || 342,
        stripeConnected: true,
        stripeAccountId: affiliate.stripe_account_id || 'acct_123456789',
        cardUnlocked: true,
        nextTierGoal: 'Earn $160 more MRR to unlock Gold Tier & 30% payout bonus',
      };
    }
  }

  return {
    availableBalance: 450.00,
    pendingCommissions: 125.00,
    lifetimeEarnings: 2480.00,
    activeClientsCount: 12,
    monthlyRecurring: 840.00,
    linkClicksCount: 342,
    stripeConnected: true,
    stripeAccountId: 'acct_123456789',
    cardUnlocked: true,
    nextTierGoal: 'Earn $160 more MRR to unlock Gold Tier & 30% payout bonus',
  };
}

// Fetch Payout Transactions from Supabase
export async function fetchPayoutTransactions(): Promise<PayoutTransaction[]> {
  const { data, error } = await supabase
    .from('payout_transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    return [
      { id: 'tx-1', amount: 350.00, status: 'Completed', date: 'Today, 2:15 PM', destination: 'Debit Card •••• 2345' },
      { id: 'tx-2', amount: 120.00, status: 'Completed', date: 'Aug 18, 2026', destination: 'Direct Deposit •••• 8901' },
      { id: 'tx-3', amount: 480.00, status: 'Completed', date: 'Aug 10, 2026', destination: 'Debit Card •••• 2345' },
    ];
  }

  return data.map(tx => ({
    id: tx.id,
    amount: tx.amount,
    status: tx.status || 'Completed',
    date: new Date(tx.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    destination: tx.destination || 'Direct Deposit',
  }));
}
