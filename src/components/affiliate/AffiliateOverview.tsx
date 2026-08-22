import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import { PurePulseTheme } from '../../theme/theme';
import { UserProfile } from '../../types';
import { getCurrentUserProfile } from '../../services/api';

export const AffiliateOverview: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const u = await getCurrentUserProfile();
    setProfile(u);
    setLoading(false);
  };

  const copyReferralLink = async () => {
    if (!profile) return;
    await Clipboard.setStringAsync(profile.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPartnerCode = async () => {
    if (!profile) return;
    await Clipboard.setStringAsync(profile.partnerCode);
    Alert.alert('Copied!', `Partner code ${profile.partnerCode} copied to clipboard.`);
  };

  const openTestLink = async () => {
    if (!profile) return;
    await WebBrowser.openBrowserAsync(profile.referralLink);
  };

  if (loading || !profile) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={PurePulseTheme.colors.primaryLight} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentList} showsVerticalScrollIndicator={false}>
      {/* Top Banner Offer */}
      <View style={styles.promoBanner}>
        <View style={{ flex: 1 }}>
          <View style={styles.promoBadge}>
            <Text style={styles.promoBadgeText}>🎯 PARTNER PERK</Text>
          </View>
          <Text style={styles.promoTitle}>Refer 1 Client This Month = Free Business Plan ($49/mo value)</Text>
          <Text style={styles.promoSub}>Partners with 1+ active referrals receive complimentary access to vibeCodes.space Business Plan.</Text>
        </View>
      </View>

      {/* Referral Link & Partner Code Box */}
      <View style={styles.linkBox}>
        <View style={styles.linkBoxHeader}>
          <Text style={styles.boxLabel}>YOUR UNIQUE REFERRAL LINK</Text>
          <TouchableOpacity onPress={openTestLink} style={styles.testLinkBtn}>
            <Text style={styles.testLinkText}>Test Link ↗</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkRow}>
          <Text style={styles.linkUrlText} numberOfLines={1}>
            {profile.referralLink}
          </Text>
          <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnActive]} onPress={copyReferralLink}>
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color="#FFF" />
            <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy Link'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.codeDivider} />

        <View style={styles.codeRow}>
          <View>
            <Text style={styles.boxLabel}>PARTNER CODE</Text>
            <Text style={styles.partnerCodeVal}>{profile.partnerCode}</Text>
          </View>
          <TouchableOpacity style={styles.copyCodeBtn} onPress={copyPartnerCode}>
            <Ionicons name="copy-outline" size={16} color={PurePulseTheme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Launch Shortcuts */}
      <Text style={styles.sectionHeader}>Marketing & Promotion Hubs</Text>
      
      <View style={styles.shortcutGrid}>
        <View style={styles.shortcutCard}>
          <View style={styles.shortcutIconWrap}>
            <Ionicons name="print-outline" size={22} color={PurePulseTheme.colors.primaryLight} />
          </View>
          <Text style={styles.shortcutTitle}>Print Marketing Flyers</Text>
          <Text style={styles.shortcutSub}>Download & print full-page flyers, business cards & tear-off posters.</Text>
        </View>

        <View style={styles.shortcutCard}>
          <View style={styles.shortcutIconWrap}>
            <Ionicons name="share-social-outline" size={22} color={PurePulseTheme.colors.accentBlue} />
          </View>
          <Text style={styles.shortcutTitle}>Social Campaign Studio</Text>
          <Text style={styles.shortcutSub}>Generate custom visual graphics & 1-click pre-written copy.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurePulseTheme.colors.background,
  },
  contentList: {
    padding: 16,
    paddingBottom: 32,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBanner: {
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    padding: 16,
    borderRadius: PurePulseTheme.radii.lg,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorderActive,
    marginBottom: 16,
  },
  promoBadge: {
    backgroundColor: PurePulseTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  promoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  promoTitle: {
    ...PurePulseTheme.typography.h3,
    fontSize: 15,
    color: '#FFF',
    marginBottom: 4,
  },
  promoSub: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  linkBox: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderRadius: PurePulseTheme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
    marginBottom: 16,
  },
  linkBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  boxLabel: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  testLinkBtn: {},
  testLinkText: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    padding: 8,
    borderRadius: PurePulseTheme.radii.md,
    gap: 8,
  },
  linkUrlText: {
    flex: 1,
    color: '#FFF',
    fontSize: 12,
    paddingLeft: 6,
  },
  copyBtn: {
    backgroundColor: PurePulseTheme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  copyBtnActive: {
    backgroundColor: PurePulseTheme.colors.success,
  },
  copyBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  codeDivider: {
    height: 1,
    backgroundColor: PurePulseTheme.colors.cardBorder,
    marginVertical: 12,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerCodeVal: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  copyCodeBtn: {
    padding: 8,
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    borderRadius: 8,
  },
  sectionHeader: {
    ...PurePulseTheme.typography.h3,
    fontSize: 16,
    marginBottom: 12,
  },
  shortcutGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: PurePulseTheme.colors.cardBg,
    padding: 16,
    borderRadius: PurePulseTheme.radii.lg,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  shortcutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  shortcutTitle: {
    ...PurePulseTheme.typography.h3,
    fontSize: 14,
    marginBottom: 4,
  },
  shortcutSub: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  }
});
