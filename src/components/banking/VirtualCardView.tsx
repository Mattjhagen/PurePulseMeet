import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PurePulseTheme } from '../../theme/theme';
import { UserProfile } from '../../types';

interface Props {
  profile: UserProfile;
  availableBalance: number;
}

export const VirtualCardView: React.FC<Props> = ({ profile, availableBalance }) => {
  const getGradientForTier = (tier: string): readonly [string, string, ...string[]] => {
    switch (tier) {
      case 'PurePulse Black Card':
        return ['#111827', '#1F2937', '#581C87'];
      case 'Gold':
        return ['#D97706', '#F59E0B', '#B45309'];
      case 'Platinum':
        return ['#475569', '#94A3B8', '#334155'];
      case 'Silver':
      default:
        return ['#4C1D95', '#7C3AED', '#2563EB'];
    }
  };

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={getGradientForTier(profile.tier)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardContainer}
      >
        {/* Top Card Row */}
        <View style={styles.topRow}>
          <View style={styles.logoRow}>
            <Ionicons name="pulse" size={22} color="#FFF" />
            <Text style={styles.cardLogoText}>PurePulse</Text>
            <View style={styles.partnerBadge}>
              <Text style={styles.partnerBadgeText}>PARTNER CARD</Text>
            </View>
          </View>
          <Ionicons name="wifi-outline" size={20} color="rgba(255,255,255,0.7)" style={{ transform: [{ rotate: '90deg' }] }} />
        </View>

        {/* Chip & Balance */}
        <View style={styles.chipRow}>
          <View style={styles.chipGraphic}>
            <View style={styles.chipLineHorizontal} />
            <View style={styles.chipLineVertical} />
          </View>
          <View style={styles.balanceRight}>
            <Text style={styles.balanceLabel}>AVAILABLE FOR CASHOUT</Text>
            <Text style={styles.balanceAmount}>${availableBalance.toFixed(2)}</Text>
          </View>
        </View>

        {/* Cardholder Info */}
        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.cardHolderLabel}>CARDHOLDER</Text>
            <Text style={styles.cardHolderName}>{profile.name.toUpperCase()}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.partnerCodeLabel}>PARTNER CODE</Text>
            <Text style={styles.partnerCodeVal}>{profile.partnerCode}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginVertical: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardContainer: {
    borderRadius: 20,
    padding: 20,
    height: 200,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardLogoText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  partnerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  partnerBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipGraphic: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    position: 'relative',
    overflow: 'hidden',
  },
  chipLineHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  chipLineVertical: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  balanceRight: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolderLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    fontWeight: '600',
  },
  cardHolderName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  partnerCodeLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    fontWeight: '600',
  },
  partnerCodeVal: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  }
});
