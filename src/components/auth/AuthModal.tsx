import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurePulseTheme } from '../../theme/theme';
import { signInWithGoogle, signInWithApple } from '../../services/auth';
import { claimMobilePairCode } from '../../services/api';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AuthModal: React.FC<Props> = ({ visible, onClose, onLoginSuccess }) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [pairCodeInput, setPairCodeInput] = useState('');
  const [claimingPairCode, setClaimingPairCode] = useState(false);
  const [showPairInput, setShowPairInput] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoadingProvider('google');
      await signInWithGoogle();
      setLoadingProvider(null);
      onLoginSuccess();
    } catch (err: any) {
      setLoadingProvider(null);
      Alert.alert('Google Sign-In Error', err?.message || 'Failed to complete Google Sign-In.');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoadingProvider('apple');
      await signInWithApple();
      setLoadingProvider(null);
      onLoginSuccess();
    } catch (err: any) {
      setLoadingProvider(null);
      Alert.alert('Apple Sign-In Error', err?.message || 'Failed to complete Apple Sign-In.');
    }
  };

  const handleClaimPairCode = async () => {
    if (!pairCodeInput.trim()) {
      Alert.alert('Missing Code', 'Please enter your 6-digit pair code (e.g. PX-4892) generated in your web dashboard.');
      return;
    }

    try {
      setClaimingPairCode(true);
      const res = await claimMobilePairCode(pairCodeInput.trim());
      setClaimingPairCode(false);

      if (res.success) {
        Alert.alert('Account Linked! 🎉', 'Your affiliate account has been successfully linked to this app!', [
          { text: 'Great!', onPress: onLoginSuccess }
        ]);
      } else {
        Alert.alert('Linking Failed', res.error || 'Invalid or expired pair code.');
      }
    } catch (err: any) {
      setClaimingPairCode(false);
      Alert.alert('Error', err?.message || 'Failed to claim pair code.');
    }
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.authCard}>
          {/* Header */}
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="pulse" size={24} color="#FFF" />
            </View>
            <Text style={styles.brandTitle}>PurePulse Partner Hub</Text>
            <Text style={styles.brandSub}>Sign in to access live huddles, affiliate banking & instant payouts.</Text>
          </View>

          {/* OAuth Buttons */}
          <View style={styles.btnContainer}>
            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              disabled={loadingProvider !== null}
            >
              {loadingProvider === 'google' ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={18} color="#EA4335" />
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Apple Sign-In Button */}
            <TouchableOpacity
              style={styles.appleBtn}
              onPress={handleAppleSignIn}
              disabled={loadingProvider !== null}
            >
              {loadingProvider === 'apple' ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={20} color="#FFF" />
                  <Text style={styles.appleBtnText}>Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Pair Code Option */}
            {showPairInput ? (
              <View style={styles.pairCodeContainer}>
                <Text style={styles.pairCodeLabel}>Enter 6-Digit Web Pair Code (e.g. PX-4892):</Text>
                <TextInput
                  style={styles.pairInput}
                  placeholder="PX-4892"
                  placeholderTextColor={PurePulseTheme.colors.textMuted}
                  value={pairCodeInput}
                  onChangeText={setPairCodeInput}
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <TouchableOpacity style={styles.pairSubmitBtn} onPress={handleClaimPairCode} disabled={claimingPairCode}>
                  {claimingPairCode ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.pairSubmitText}>Link Account Now</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.pairToggleBtn} onPress={() => setShowPairInput(true)}>
                <Ionicons name="key-outline" size={16} color={PurePulseTheme.colors.primaryLight} />
                <Text style={styles.pairToggleText}>Have a 6-digit pair code from web?</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Secure SSL Footer */}
          <View style={styles.footerRow}>
            <Ionicons name="shield-checkmark" size={14} color={PurePulseTheme.colors.success} />
            <Text style={styles.footerText}>256-Bit Encrypted OAuth via Supabase Auth</Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderRadius: PurePulseTheme.radii.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorderActive,
  },
  brandRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: PurePulseTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    ...PurePulseTheme.typography.h2,
    fontSize: 20,
    marginBottom: 4,
    textAlign: 'center',
  },
  brandSub: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  btnContainer: {
    gap: 12,
    marginBottom: 20,
  },
  googleBtn: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: PurePulseTheme.radii.md,
    gap: 10,
  },
  googleBtnText: {
    color: '#1F2937',
    fontWeight: '700',
    fontSize: 14,
  },
  appleBtn: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: PurePulseTheme.radii.md,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  appleBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  pairToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  pairToggleText: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  pairCodeContainer: {
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    padding: 12,
    borderRadius: PurePulseTheme.radii.md,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  pairCodeLabel: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  pairInput: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.primaryLight,
    marginBottom: 10,
  },
  pairSubmitBtn: {
    backgroundColor: PurePulseTheme.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  pairSubmitText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  footerText: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  closeBtnText: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 12,
  }
});
