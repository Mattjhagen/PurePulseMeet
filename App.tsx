import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { PurePulseTheme } from './src/theme/theme';
import { JitsiHuddleRoom } from './src/components/community/JitsiHuddleRoom';
import { ChannelFeed } from './src/components/community/ChannelFeed';
import { BankDashboard } from './src/components/banking/BankDashboard';
import { AffiliateOverview } from './src/components/affiliate/AffiliateOverview';
import { SocialCampaignStudio } from './src/components/affiliate/SocialCampaignStudio';
import { PrintableAssetsHub } from './src/components/affiliate/PrintableAssetsHub';
import { AuthModal } from './src/components/auth/AuthModal';
import { claimMobilePairCode, getCurrentUserProfile } from './src/services/api';
import { supabase } from './src/services/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<'huddles' | 'community' | 'banking' | 'affiliate' | 'campaigns' | 'printables'>('huddles');
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const syncSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(Boolean(session));
      if (session) {
        try {
          setAvatarUrl((await getCurrentUserProfile()).avatarUrl);
        } catch {
          setAvatarUrl(null);
        }
      }
      setAuthLoading(false);
    };
    syncSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
      setAuthLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const data = Linking.parse(event.url);
      if (data.queryParams?.code) {
        const code = data.queryParams.code as string;
        const res = await claimMobilePairCode(code);
        if (res.success) {
          Alert.alert('Account Linked! 🎉', 'Your affiliate account has been successfully linked!');
        } else {
          Alert.alert('Linking Error', res.error || 'Failed to claim pair code.');
        }
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  if (authLoading) {
    return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color={PurePulseTheme.colors.primaryLight} /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PurePulseTheme.colors.background} />

      {/* PurePulse App Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoIconBg}>
            <Ionicons name="pulse" size={20} color="#FFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>PurePulse</Text>
            <View style={styles.partnerTag}>
              <Ionicons name="sparkles" size={10} color={PurePulseTheme.colors.primaryLight} />
              <Text style={styles.partnerTagText}>PARTNER PORTAL</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.communityHeaderBtn}
            onPress={() => setActiveTab('huddles')}
          >
            <View style={styles.livePulseDot} />
            <Text style={styles.communityHeaderBtnText}>Join Huddles</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAuthModalVisible(true)} style={styles.userAvatarWrap}>
            {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.userAvatar} /> : <Ionicons name="person-circle" size={32} color={PurePulseTheme.colors.textMuted} />}
            <View style={styles.onlineBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tab View Controller */}
      {isLoggedIn ? <View style={styles.contentArea}>
        {activeTab === 'huddles' && <JitsiHuddleRoom />}
        {activeTab === 'community' && <ChannelFeed />}
        {activeTab === 'banking' && <BankDashboard />}
        {activeTab === 'affiliate' && <AffiliateOverview />}
        {activeTab === 'campaigns' && <SocialCampaignStudio />}
        {activeTab === 'printables' && <PrintableAssetsHub />}
      </View> : <View style={[styles.contentArea, styles.centered]}><Ionicons name="lock-closed" size={40} color={PurePulseTheme.colors.primaryLight} /><Text style={styles.signInTitle}>Affiliate sign-in required</Text><Text style={styles.signInBody}>Sign in with the account connected to your PurePulse affiliate dashboard.</Text><TouchableOpacity style={styles.signInButton} onPress={() => setAuthModalVisible(true)}><Text style={styles.signInButtonText}>Sign In</Text></TouchableOpacity></View>}

      {/* Bottom Navigation Tab Bar */}
      {isLoggedIn && <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('huddles')}
        >
          <Ionicons
            name={activeTab === 'huddles' ? 'videocam' : 'videocam-outline'}
            size={20}
            color={activeTab === 'huddles' ? PurePulseTheme.colors.primaryLight : PurePulseTheme.colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'huddles' && styles.tabLabelActive]}>Huddles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('community')}
        >
          <Ionicons
            name={activeTab === 'community' ? 'chatbubbles' : 'chatbubbles-outline'}
            size={20}
            color={activeTab === 'community' ? PurePulseTheme.colors.primaryLight : PurePulseTheme.colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'community' && styles.tabLabelActive]}>Channels</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('banking')}
        >
          <Ionicons
            name={activeTab === 'banking' ? 'card' : 'card-outline'}
            size={20}
            color={activeTab === 'banking' ? PurePulseTheme.colors.success : PurePulseTheme.colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'banking' && { color: PurePulseTheme.colors.success, fontWeight: '700' }]}>
            Banking
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('affiliate')}
        >
          <Ionicons
            name={activeTab === 'affiliate' ? 'stats-chart' : 'stats-chart-outline'}
            size={20}
            color={activeTab === 'affiliate' ? PurePulseTheme.colors.primaryLight : PurePulseTheme.colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'affiliate' && styles.tabLabelActive]}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('campaigns')}
        >
          <Ionicons
            name={activeTab === 'campaigns' ? 'share-social' : 'share-social-outline'}
            size={20}
            color={activeTab === 'campaigns' ? PurePulseTheme.colors.primaryLight : PurePulseTheme.colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'campaigns' && styles.tabLabelActive]}>Studio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab('printables')}
        >
          <Ionicons
            name={activeTab === 'printables' ? 'print' : 'print-outline'}
            size={20}
            color={activeTab === 'printables' ? PurePulseTheme.colors.primaryLight : PurePulseTheme.colors.textMuted}
          />
          <Text style={[styles.tabLabel, activeTab === 'printables' && styles.tabLabelActive]}>Flyers</Text>
        </TouchableOpacity>
      </View>}

      {/* Auth Modal for 1-Tap Google & Apple OAuth */}
      <AuthModal
        visible={authModalVisible || !isLoggedIn}
        onClose={() => isLoggedIn && setAuthModalVisible(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setAuthModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurePulseTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: PurePulseTheme.colors.cardBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: PurePulseTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  partnerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  partnerTagText: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 9,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  communityHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PurePulseTheme.colors.success,
  },
  communityHeaderBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  userAvatarWrap: {
    position: 'relative',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PurePulseTheme.colors.success,
    borderWidth: 1.5,
    borderColor: PurePulseTheme.colors.cardBg,
  },
  contentArea: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  signInTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 14 },
  signInBody: { color: PurePulseTheme.colors.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: 320 },
  signInButton: { backgroundColor: PurePulseTheme.colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  signInButtonText: { color: '#FFF', fontWeight: '700' },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: PurePulseTheme.colors.cardBg,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: PurePulseTheme.colors.cardBorder,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: PurePulseTheme.colors.primaryLight,
    fontWeight: '700',
  }
});
