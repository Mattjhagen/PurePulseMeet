import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurePulseTheme } from '../../theme/theme';
import { signInWithGoogle, signInWithApple } from '../../services/auth';

interface Props {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AuthModal: React.FC<Props> = ({ visible, onClose, onLoginSuccess }) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

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
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
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
