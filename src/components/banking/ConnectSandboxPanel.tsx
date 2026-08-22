import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { PurePulseTheme } from '../../theme/theme';
import { ConnectSandboxStatus } from '../../types';
import { createConnectSandboxOnboardingLink } from '../../services/api';

interface Props {
  status: ConnectSandboxStatus;
  onRefresh: () => Promise<void>;
}

const STATUS_COPY: Record<ConnectSandboxStatus['status'], { title: string; body: string; color: string }> = {
  not_started: { title: 'Payout setup not started', body: 'Create a test recipient and complete Stripe-hosted onboarding.', color: PurePulseTheme.colors.textSecondary },
  onboarding_required: { title: 'Action required', body: 'Continue Stripe onboarding to provide the remaining information.', color: PurePulseTheme.colors.warning },
  verification_pending: { title: 'Verification pending', body: 'Stripe is reviewing the sandbox recipient details.', color: PurePulseTheme.colors.warning },
  ready: { title: 'Ready for test transfers', body: 'The recipient transfer capability is active in the sandbox.', color: PurePulseTheme.colors.success },
  restricted: { title: 'Payouts restricted', body: 'Open onboarding to review and resolve Stripe requirements.', color: PurePulseTheme.colors.danger },
};

export const ConnectSandboxPanel: React.FC<Props> = ({ status, onRefresh }) => {
  const [opening, setOpening] = useState(false);
  const copy = STATUS_COPY[status.status];

  const openOnboarding = async () => {
    setOpening(true);
    try {
      const link = await createConnectSandboxOnboardingLink();
      const result = await WebBrowser.openAuthSessionAsync(link.url, 'purepulse://stripe-connect');
      if (result.type === 'success') {
        const returnedForRefresh = result.url.includes('result=refresh');
        if (returnedForRefresh) {
          const refreshedLink = await createConnectSandboxOnboardingLink();
          await WebBrowser.openAuthSessionAsync(refreshedLink.url, 'purepulse://stripe-connect');
        }
      }
      await onRefresh();
    } catch (error) {
      Alert.alert('Connect sandbox unavailable', error instanceof Error ? error.message : 'Unable to open Stripe onboarding.');
    } finally {
      setOpening(false);
    }
  };

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.icon}><Ionicons name="swap-horizontal" size={20} color={PurePulseTheme.colors.accentCyan} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Stripe Connect payouts</Text>
          <Text style={[styles.status, { color: copy.color }]}>{copy.title}</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>SANDBOX</Text></View>
      </View>
      <Text style={styles.body}>{copy.body}</Text>
      {status.requirementsDue.length > 0 && (
        <Text style={styles.requirements}>{status.requirementsDue.length} Stripe requirement{status.requirementsDue.length === 1 ? '' : 's'} remaining</Text>
      )}
      {status.warning && <Text style={styles.warning}>{status.warning}</Text>}
      {status.status !== 'ready' && (
        <TouchableOpacity style={[styles.button, (!status.enabled || opening) && styles.disabled]} onPress={openOnboarding} disabled={!status.enabled || opening}>
          {opening ? <ActivityIndicator color="#FFF" /> : <><Ionicons name="open-outline" size={17} color="#FFF" /><Text style={styles.buttonText}>{status.status === 'not_started' ? 'Start test onboarding' : 'Continue test onboarding'}</Text></>}
        </TouchableOpacity>
      )}
      {status.status === 'ready' && (
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}><Ionicons name="refresh" size={16} color={PurePulseTheme.colors.accentCyan} /><Text style={styles.refreshText}>Refresh Stripe status</Text></TouchableOpacity>
      )}
      {!status.enabled && <Text style={styles.disabledText}>Enable the Connect sandbox on the server to begin.</Text>}
      <Text style={styles.privacy}>Identity and bank details are entered directly on Stripe. PurePulse never receives or stores them.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: { backgroundColor: PurePulseTheme.colors.cardBg, borderRadius: PurePulseTheme.radii.lg, padding: 14, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(6,182,212,0.13)', alignItems: 'center', justifyContent: 'center' },
  title: { color: PurePulseTheme.colors.textPrimary, fontSize: 15, fontWeight: '800' },
  status: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  badge: { backgroundColor: 'rgba(6,182,212,0.13)', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: PurePulseTheme.colors.accentCyan, fontSize: 9, fontWeight: '900' },
  body: { color: PurePulseTheme.colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 11 },
  requirements: { color: PurePulseTheme.colors.warning, fontSize: 11, fontWeight: '700', marginTop: 8 },
  warning: { color: PurePulseTheme.colors.warning, fontSize: 10, lineHeight: 14, marginTop: 8 },
  button: { backgroundColor: PurePulseTheme.colors.accentCyan, borderRadius: 10, paddingVertical: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  buttonText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  disabledText: { color: PurePulseTheme.colors.textMuted, fontSize: 10, marginTop: 8 },
  refreshButton: { marginTop: 10, paddingVertical: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  refreshText: { color: PurePulseTheme.colors.accentCyan, fontSize: 12, fontWeight: '700' },
  privacy: { color: PurePulseTheme.colors.textMuted, fontSize: 9, lineHeight: 13, marginTop: 9 },
});
