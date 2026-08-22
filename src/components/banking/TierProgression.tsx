import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurePulseTheme } from '../../theme/theme';
import { UserProfile, BankingAccount } from '../../types';

interface Props {
  profile: UserProfile;
  account: BankingAccount;
}

export const TierProgression: React.FC<Props> = ({ profile, account }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="trophy-outline" size={18} color={PurePulseTheme.colors.warning} />
          <Text style={styles.title}>Affiliate progress</Text>
        </View>
        <View style={styles.currentTierBadge}>
          <Text style={styles.currentTierText}>{profile.tier.toUpperCase()}</Text>
        </View>
      </View>

      {/* Progress Bar Container */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressTextLeft}>{account.activeClientsCount} Active Client Referrals</Text>
          <Text style={styles.progressTextRight}>{Math.min(100, Math.max(0, profile.tierProgress))}% to Next Tier</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, profile.tierProgress))}%` }]} />
        </View>
        <Text style={styles.nextGoalSub}>{account.nextTierGoal}</Text>
      </View>

      <Text style={styles.disclaimer}>Tier names, requirements, and rewards are shown only when configured in PurePulseAdmin. No unapproved commission or card rewards are displayed.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderRadius: PurePulseTheme.radii.lg,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    ...PurePulseTheme.typography.h3,
    fontSize: 15,
  },
  currentTierBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentTierText: {
    color: PurePulseTheme.colors.warning,
    fontSize: 11,
    fontWeight: '800',
  },
  progressContainer: {
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    padding: 12,
    borderRadius: PurePulseTheme.radii.md,
    marginBottom: 14,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressTextLeft: {
    color: PurePulseTheme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  progressTextRight: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: PurePulseTheme.colors.primary,
    borderRadius: 4,
  },
  nextGoalSub: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  disclaimer: { color: PurePulseTheme.colors.textMuted, fontSize: 10, lineHeight: 15 },
  tierList: {
    gap: 8,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: PurePulseTheme.radii.md,
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
  },
  tierRowCurrent: {
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.primaryLight,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  tierName: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 13,
  },
  activeTag: {
    backgroundColor: PurePulseTheme.colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  activeTagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tierPerk: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
  },
  reqBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reqText: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  }
});
