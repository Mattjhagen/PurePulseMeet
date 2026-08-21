import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { PurePulseTheme } from '../../theme/theme';
import { sampleSocialAssets } from '../../services/mockData';
import { SocialAsset } from '../../types';

export const SocialCampaignStudio: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<SocialAsset>(sampleSocialAssets[0]);
  const [customHeadline, setCustomHeadline] = useState(sampleSocialAssets[0].defaultHook);
  const [copiedCopy, setCopiedCopy] = useState(false);

  const headlineHooks = [
    'Professional Websites Built for $150 Deposit.',
    'Is Your Business Website Losing Mobile Customers?',
    'Agency-Quality Websites Without the $5,000 Upfront Price.',
    'Stop Worrying About Site Updates. Maintenance Included.',
  ];

  const prewrittenCopy = `🚀 Upgrade your business website with zero stress!
PurePulse builds high-performance, agency-grade websites for just a $150 deposit with ongoing maintenance included.

Use my partner link to check out live examples:
https://login.purepulse.one/ref/MATTY193 (Code: MATTY193)`;

  const copyScript = async () => {
    await Clipboard.setStringAsync(prewrittenCopy);
    setCopiedCopy(true);
    setTimeout(() => setCopiedCopy(false), 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentList} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Social Campaign Studio</Text>
      <Text style={styles.headerSub}>Generate customized graphics, copy pre-written high-converting posts, and track clicks.</Text>

      {/* Dimensions Selector */}
      <Text style={styles.sectionLabel}>1. SELECT GRAPHIC DIMENSIONS</Text>
      <View style={styles.dimensionRow}>
        {sampleSocialAssets.map((asset) => (
          <TouchableOpacity
            key={asset.id}
            style={[styles.dimensionBtn, selectedAsset.id === asset.id && styles.dimensionBtnActive]}
            onPress={() => {
              setSelectedAsset(asset);
              setCustomHeadline(asset.defaultHook);
            }}
          >
            <Text style={[styles.dimensionText, selectedAsset.id === asset.id && styles.dimensionTextActive]}>
              {asset.dimensions}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Graphic Preview Card */}
      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <View style={styles.brandLogoRow}>
            <Ionicons name="pulse" size={16} color={PurePulseTheme.colors.primaryLight} />
            <Text style={styles.brandText}>PurePulse</Text>
          </View>
          <Text style={styles.subText}>WEB DESIGN & MAINTENANCE</Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.glowBadge}>
            <Text style={styles.glowBadgeText}>✨ HIGH PERFORMANCE WEBSITES</Text>
          </View>
        </View>

        <Text style={styles.previewHeadline}>{customHeadline}</Text>

        <View style={styles.featureList}>
          <Text style={styles.featureItem}>✓ Custom design & clean code built to convert</Text>
          <Text style={styles.featureItem}>✓ Fully responsive & ultra-fast loading</Text>
          <Text style={styles.featureItem}>✓ $150 deposit to start — all plans include maintenance</Text>
        </View>

        <View style={styles.previewFooter}>
          <View>
            <Text style={styles.footerLabel}>Get Started at purepulse.one</Text>
            <Text style={styles.footerLink}>Partner Link: login.purepulse.one/ref/MATTY193</Text>
          </View>
          <View style={styles.codePill}>
            <Text style={styles.codePillText}>CODE: MATTY193</Text>
          </View>
        </View>
      </View>

      {/* Headline Hook Selector */}
      <Text style={styles.sectionLabel}>2. CHOOSE HEADLINE HOOK</Text>
      <View style={styles.hookList}>
        {headlineHooks.map((hook, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.hookChip, customHeadline === hook && styles.hookChipActive]}
            onPress={() => setCustomHeadline(hook)}
          >
            <Text style={[styles.hookText, customHeadline === hook && styles.hookTextActive]}>{hook}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pre-written Copy Box */}
      <Text style={styles.sectionLabel}>3. READY-TO-POST COPY (1-CLICK COPY)</Text>
      <View style={styles.copyBox}>
        <Text style={styles.copyBody}>{prewrittenCopy}</Text>
        <TouchableOpacity style={[styles.copyBtn, copiedCopy && styles.copyBtnActive]} onPress={copyScript}>
          <Ionicons name={copiedCopy ? 'checkmark' : 'copy-outline'} size={16} color="#FFF" />
          <Text style={styles.copyBtnText}>{copiedCopy ? 'Copied to Clipboard!' : 'Copy Script'}</Text>
        </TouchableOpacity>
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
  headerTitle: {
    ...PurePulseTheme.typography.h2,
    fontSize: 20,
  },
  headerSub: {
    ...PurePulseTheme.typography.caption,
    marginTop: 2,
    marginBottom: 16,
  },
  sectionLabel: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
  dimensionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dimensionBtn: {
    flex: 1,
    backgroundColor: PurePulseTheme.colors.cardBg,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: PurePulseTheme.radii.md,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  dimensionBtnActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderColor: PurePulseTheme.colors.primaryLight,
  },
  dimensionText: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  dimensionTextActive: {
    color: PurePulseTheme.colors.primaryLight,
  },
  previewCard: {
    backgroundColor: '#0F172A',
    borderRadius: PurePulseTheme.radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.4)',
    marginVertical: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 16,
  },
  subText: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
  badgeRow: {
    marginBottom: 10,
  },
  glowBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  glowBadgeText: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
  },
  previewHeadline: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 14,
  },
  featureList: {
    gap: 6,
    marginBottom: 16,
  },
  featureItem: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 12,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: PurePulseTheme.radii.md,
  },
  footerLabel: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 11,
  },
  footerLink: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 10,
  },
  codePill: {
    backgroundColor: PurePulseTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codePillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  hookList: {
    gap: 8,
  },
  hookChip: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    padding: 12,
    borderRadius: PurePulseTheme.radii.md,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  hookChipActive: {
    borderColor: PurePulseTheme.colors.primaryLight,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  hookText: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 12,
  },
  hookTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  copyBox: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderRadius: PurePulseTheme.radii.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  copyBody: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  copyBtn: {
    backgroundColor: PurePulseTheme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: PurePulseTheme.radii.md,
    gap: 6,
  },
  copyBtnActive: {
    backgroundColor: PurePulseTheme.colors.success,
  },
  copyBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  }
});
