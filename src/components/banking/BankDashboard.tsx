import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurePulseTheme } from '../../theme/theme';
import { VirtualCardView } from './VirtualCardView';
import { TierProgression } from './TierProgression';
import { StripePayoutModal } from './StripePayoutModal';
import { IssuingProvisionModal } from './IssuingProvisionModal';
import { PayoutTransaction, BankingAccount, IssuingStatus, IssuingTransaction, UserProfile } from '../../types';
import {
  fetchBankingAccount,
  fetchIssuingStatus,
  fetchIssuingTransactions,
  fetchPayoutTransactions,
  getCurrentUserProfile,
} from '../../services/api';

export const BankDashboard: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [account, setAccount] = useState<BankingAccount | null>(null);
  const [ledger, setLedger] = useState<PayoutTransaction[]>([]);
  const [issuing, setIssuing] = useState<IssuingStatus | null>(null);
  const [cardTransactions, setCardTransactions] = useState<IssuingTransaction[]>([]);
  const [payoutModalVisible, setPayoutModalVisible] = useState(false);
  const [provisionModalVisible, setProvisionModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadBankingData();
  }, []);

  const loadBankingData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [user, bankData, txHistory, issuingStatus, issuingTransactions] = await Promise.all([
        getCurrentUserProfile(),
        fetchBankingAccount(),
        fetchPayoutTransactions(),
        fetchIssuingStatus(),
        fetchIssuingTransactions(),
      ]);
      setProfile(user);
      setAccount(bankData);
      setLedger(txHistory);
      setIssuing(issuingStatus);
      setCardTransactions(issuingTransactions);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load banking data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={PurePulseTheme.colors.primaryLight} />
      </View>
    );
  }

  if (loadError || !profile || !account || !issuing) {
    return <View style={styles.centerBox}><Ionicons name="alert-circle-outline" size={32} color={PurePulseTheme.colors.warning} /><Text style={styles.errorText}>{loadError || 'Banking information is unavailable.'}</Text><TouchableOpacity style={styles.retryButton} onPress={loadBankingData}><Text style={styles.retryText}>Try again</Text></TouchableOpacity></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentList} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>PurePulse Partner Bank</Text>
          <Text style={styles.headerSub}>DoorDash-style Instant Cashout & Stripe Payouts</Text>
        </View>
        <TouchableOpacity style={styles.cashoutBtn} onPress={() => setPayoutModalVisible(true)}>
          <Ionicons name="flash" size={16} color="#FFF" />
          <Text style={styles.cashoutBtnText}>Cash Out</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Card Component */}
      <VirtualCardView profile={profile} issuing={issuing} />

      <View style={styles.issuingPanel}>
        <View style={styles.issuingHeading}>
          <View style={{ flex: 1 }}>
            <Text style={styles.issuingTitle}>Stripe Issuing sandbox</Text>
            <Text style={styles.issuingSub}>
              {issuing.account
                ? `Your test card is ${issuing.account.card_status}. Real funds are never used.`
                : issuing.eligible
                  ? 'You are approved to create an inactive virtual test card.'
                  : 'Card access requires administrator approval.'}
            </Text>
          </View>
          <View style={styles.sandboxBadge}><Text style={styles.sandboxBadgeText}>TEST</Text></View>
        </View>
        {!issuing.account && issuing.eligible && (
          <TouchableOpacity
            style={[styles.createCardButton, !issuing.provisioningEnabled && styles.disabledButton]}
            onPress={() => setProvisionModalVisible(true)}
            disabled={!issuing.provisioningEnabled}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFF" />
            <Text style={styles.createCardText}>{issuing.provisioningEnabled ? 'Create sandbox card' : 'Provisioning temporarily disabled'}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.walletNotice}>Apple Pay and Google Wallet provisioning are unavailable in Stripe sandboxes.</Text>
      </View>

      {/* Metric Counters Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>ACCRUING MRR</Text>
          <Text style={styles.metricValue}>${account.monthlyRecurring.toFixed(2)}/mo</Text>
          <Text style={styles.metricSub}>{account.activeClientsCount} Paying Clients</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PENDING COMMISSIONS</Text>
          <Text style={styles.metricValue}>${account.pendingCommissions.toFixed(2)}</Text>
          <Text style={styles.metricSub}>Clears 1st of month</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>LIFETIME PAID OUT</Text>
          <Text style={styles.metricValue}>${account.lifetimeEarnings.toFixed(2)}</Text>
          <Text style={styles.metricSub}>Stripe Express</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>LINK CLICKS</Text>
          <Text style={styles.metricValue}>{account.linkClicksCount}</Text>
          <Text style={styles.metricSub}>3.2% Conversion</Text>
        </View>
      </View>

      {/* Tier Gamification Ladder */}
      <TierProgression profile={profile} account={account} />

      <View style={styles.ledgerSection}>
        <Text style={styles.ledgerTitle}>Recent Card Activity</Text>
        {cardTransactions.length === 0 ? <Text style={styles.emptyLedgerText}>No sandbox card transactions yet.</Text> : cardTransactions.map(tx => (
          <View key={tx.id} style={styles.ledgerRow}>
            <View style={styles.cardTxIcon}><Ionicons name="card-outline" size={20} color={PurePulseTheme.colors.primaryLight} /></View>
            <View style={{ flex: 1 }}><Text style={styles.txDestination}>{tx.merchantName}</Text><Text style={styles.txDate}>{tx.date} · {tx.status}</Text></View>
            <Text style={styles.cardTxAmount}>{tx.currency} {Math.abs(tx.amount).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Payout History Ledger */}
      <View style={styles.ledgerSection}>
        <Text style={styles.ledgerTitle}>Recent Payout History</Text>
        {ledger.length === 0 ? (
          <Text style={styles.emptyLedgerText}>No payout transactions yet.</Text>
        ) : (
          ledger.map((tx: PayoutTransaction) => (
            <View key={tx.id} style={styles.ledgerRow}>
              <View style={styles.txIconContainer}>
                <Ionicons name="arrow-up-circle-outline" size={22} color={PurePulseTheme.colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txDestination}>{tx.destination}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.txAmount}>+${tx.amount.toFixed(2)}</Text>
                <Text style={styles.txStatus}>{tx.status}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Stripe Cashout Modal */}
      <StripePayoutModal
        visible={payoutModalVisible}
        onClose={() => setPayoutModalVisible(false)}
        availableBalance={account.availableBalance}
        onCashoutSuccess={() => loadBankingData()}
      />
      <IssuingProvisionModal visible={provisionModalVisible} onClose={() => setProvisionModalVisible(false)} onProvisioned={loadBankingData} />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    ...PurePulseTheme.typography.h2,
    fontSize: 20,
  },
  headerSub: {
    ...PurePulseTheme.typography.caption,
    marginTop: 2,
  },
  cashoutBtn: {
    backgroundColor: PurePulseTheme.colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: PurePulseTheme.radii.md,
    gap: 4,
  },
  cashoutBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: PurePulseTheme.colors.cardBg,
    padding: 14,
    borderRadius: PurePulseTheme.radii.lg,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  metricLabel: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 4,
  },
  metricSub: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 11,
  },
  ledgerSection: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderRadius: PurePulseTheme.radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
    marginTop: 8,
  },
  ledgerTitle: {
    ...PurePulseTheme.typography.h3,
    fontSize: 15,
    marginBottom: 12,
  },
  emptyLedgerText: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 12,
    paddingVertical: 12,
  },
  errorText: { color: PurePulseTheme.colors.textSecondary, fontSize: 13, textAlign: 'center', marginVertical: 12, paddingHorizontal: 28 },
  retryButton: { backgroundColor: PurePulseTheme.colors.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#FFF', fontWeight: '700' },
  issuingPanel: { backgroundColor: PurePulseTheme.colors.cardBg, borderRadius: PurePulseTheme.radii.lg, padding: 14, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder, marginBottom: 12 },
  issuingHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  issuingTitle: { color: PurePulseTheme.colors.textPrimary, fontSize: 15, fontWeight: '800' },
  issuingSub: { color: PurePulseTheme.colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
  sandboxBadge: { backgroundColor: 'rgba(245,158,11,0.16)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sandboxBadgeText: { color: PurePulseTheme.colors.warning, fontSize: 10, fontWeight: '900' },
  createCardButton: { marginTop: 12, backgroundColor: PurePulseTheme.colors.primary, paddingVertical: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  createCardText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  disabledButton: { opacity: 0.45 },
  walletNotice: { color: PurePulseTheme.colors.textMuted, fontSize: 10, lineHeight: 14, marginTop: 10 },
  cardTxIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(124,58,237,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cardTxAmount: { color: PurePulseTheme.colors.textPrimary, fontSize: 12, fontWeight: '700' },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: PurePulseTheme.colors.cardBorder,
  },
  txIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  txDestination: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  txDate: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
  },
  txAmount: {
    color: PurePulseTheme.colors.success,
    fontSize: 14,
    fontWeight: '700',
  },
  txStatus: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 10,
  }
});
