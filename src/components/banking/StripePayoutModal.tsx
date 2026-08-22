import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurePulseTheme } from '../../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  availableBalance: number;
  onCashoutSuccess: (amount: number) => void;
}

export const StripePayoutModal: React.FC<Props> = ({ visible, onClose, availableBalance, onCashoutSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'instant' | 'standard'>('instant');

  const fee = payoutMethod === 'instant' ? availableBalance * 0.01 : 0;
  const netAmount = Math.max(0, availableBalance - fee);

  const executeCashout = async () => {
    if (availableBalance <= 0) {
      Alert.alert('No Available Funds', 'You currently have $0.00 available to cash out.');
      return;
    }

    setLoading(true);
    setLoading(false);
    Alert.alert(
      'Payout setup required',
      'Cashout is disabled until the server-side Stripe payout endpoint and webhook confirmation are configured. No funds were moved.'
    );
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="card-outline" size={22} color={PurePulseTheme.colors.success} />
              <Text style={styles.modalTitle}>Stripe Connect Cashout</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={PurePulseTheme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Balance Preview Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>READY FOR INSTANT CASHOUT</Text>
            <Text style={styles.balanceAmount}>${availableBalance.toFixed(2)}</Text>
            <View style={styles.stripeShieldRow}>
              <Ionicons name="shield-checkmark" size={14} color={PurePulseTheme.colors.success} />
              <Text style={styles.stripeShieldText}>Secured & Processed by Stripe Connect</Text>
            </View>
          </View>

          {/* Speed Selector */}
          <Text style={styles.selectorTitle}>Select Transfer Speed</Text>
          
          <TouchableOpacity
            style={[styles.speedOption, payoutMethod === 'instant' && styles.speedOptionActive]}
            onPress={() => setPayoutMethod('instant')}
          >
            <View style={styles.radioIcon}>
              {payoutMethod === 'instant' && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.speedName}>⚡ Instant Cashout (Debit Card)</Text>
              <Text style={styles.speedSub}>Available in 1-5 minutes • 1% fee</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.speedOption, payoutMethod === 'standard' && styles.speedOptionActive]}
            onPress={() => setPayoutMethod('standard')}
          >
            <View style={styles.radioIcon}>
              {payoutMethod === 'standard' && <View style={styles.radioDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.speedName}>🏦 Standard Direct Deposit</Text>
              <Text style={styles.speedSub}>1-2 business days • Free</Text>
            </View>
          </TouchableOpacity>

          {/* Cashout Button */}
          <TouchableOpacity
            style={[styles.cashoutSubmitBtn, (loading || availableBalance <= 0) && styles.cashoutSubmitBtnDisabled]}
            onPress={executeCashout}
            disabled={loading || availableBalance <= 0}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="flash" size={18} color="#FFF" />
                <Text style={styles.cashoutSubmitText}>
                  {availableBalance <= 0
                    ? 'No Funds Available'
                    : `Cash Out $${netAmount.toFixed(2)} Now`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderTopLeftRadius: PurePulseTheme.radii.xl,
    borderTopRightRadius: PurePulseTheme.radii.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...PurePulseTheme.typography.h3,
    fontSize: 17,
  },
  balanceCard: {
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    padding: 16,
    borderRadius: PurePulseTheme.radii.lg,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  balanceLabel: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    color: PurePulseTheme.colors.success,
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 4,
  },
  stripeShieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stripeShieldText: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 11,
  },
  selectorTitle: {
    ...PurePulseTheme.typography.h3,
    fontSize: 14,
    marginBottom: 10,
  },
  speedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    padding: 14,
    borderRadius: PurePulseTheme.radii.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  speedOptionActive: {
    borderColor: PurePulseTheme.colors.primaryLight,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  radioIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: PurePulseTheme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PurePulseTheme.colors.primaryLight,
  },
  speedName: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  speedSub: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  cashoutSubmitBtn: {
    backgroundColor: PurePulseTheme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: PurePulseTheme.radii.md,
    marginTop: 10,
    gap: 8,
  },
  cashoutSubmitBtnDisabled: {
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    opacity: 0.6,
  },
  cashoutSubmitText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  }
});
