import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurePulseTheme } from '../../theme/theme';
import { samplePrintableAssets } from '../../services/mockData';
import { PrintableAsset } from '../../types';

export const PrintableAssetsHub: React.FC = () => {
  const [selectedPrint, setSelectedPrint] = useState<PrintableAsset>(samplePrintableAssets[0]);

  const handlePrint = () => {
    Alert.alert(
      '🖨️ Ready to Print Flyer',
      `Generating high-resolution PDF for "${selectedPrint.title}" (Letter 8.5x11) with QR code & Partner Code MATTY193.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentList} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Printable Assets Hub</Text>
      <Text style={styles.headerSub}>Hang flyers in cafes, universities, and co-working spaces. Hand out cards to local business owners.</Text>

      {/* Asset Selection Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.assetSelectorRibbon}>
        {samplePrintableAssets.map((asset) => (
          <TouchableOpacity
            key={asset.id}
            style={[styles.assetChip, selectedPrint.id === asset.id && styles.assetChipActive]}
            onPress={() => setSelectedPrint(asset)}
          >
            <Text style={[styles.assetChipTitle, selectedPrint.id === asset.id && styles.assetChipTitleActive]}>
              {asset.title}
            </Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>{asset.badge}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* High Res Flyer Mock Preview */}
      <View style={styles.previewFrame}>
        <View style={styles.frameHeader}>
          <Text style={styles.frameTitle}>LIVE FLYER PREVIEW (FULL PAGE LETTER)</Text>
          <TouchableOpacity style={styles.printActionBtn} onPress={handlePrint}>
            <Ionicons name="print" size={16} color="#FFF" />
            <Text style={styles.printActionText}>Print Flyer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.flyerMock}>
          <View style={styles.flyerBrandRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="pulse" size={20} color={PurePulseTheme.colors.primaryLight} />
              <Text style={styles.flyerBrandName}>PurePulse</Text>
            </View>
            <Text style={styles.flyerBrandSub}>WEB DESIGN & DEVELOPMENT</Text>
          </View>

          <Text style={styles.flyerHookText}>YOUR NEXT WEBSITE SHOULD</Text>
          <Text style={styles.flyerMainHeading}>MOVE PEOPLE FORWARD.</Text>

          <View style={styles.flyerDivider} />

          <View style={styles.flyerPointsList}>
            <Text style={styles.pointText}>• $150 Deposit to Launch</Text>
            <Text style={styles.pointText}>• Full Mobile Responsiveness & Security Included</Text>
            <Text style={styles.pointText}>• Ongoing Updates & Maintenance</Text>
          </View>

          {/* QR & Code Box */}
          <View style={styles.qrBox}>
            <View style={styles.qrGraphic}>
              <Ionicons name="qr-code" size={48} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.qrLabel}>SCAN OR VISIT</Text>
              <Text style={styles.qrUrl}>purepulse.one/pricing</Text>
              <Text style={styles.qrCodeTag}>Use Partner Code: MATTY193</Text>
            </View>
          </View>
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
  headerTitle: {
    ...PurePulseTheme.typography.h2,
    fontSize: 20,
  },
  headerSub: {
    ...PurePulseTheme.typography.caption,
    marginTop: 2,
    marginBottom: 14,
  },
  assetSelectorRibbon: {
    maxHeight: 70,
    marginBottom: 16,
  },
  assetChip: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: PurePulseTheme.radii.md,
    marginRight: 10,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
    minWidth: 140,
  },
  assetChipActive: {
    borderColor: PurePulseTheme.colors.primaryLight,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
  assetChipTitle: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  assetChipTitleActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgePillText: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 9,
    fontWeight: '700',
  },
  previewFrame: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderRadius: PurePulseTheme.radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  frameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  frameTitle: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    flex: 1,
  },
  printActionBtn: {
    backgroundColor: PurePulseTheme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: PurePulseTheme.radii.sm,
    gap: 6,
  },
  printActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  flyerMock: {
    backgroundColor: '#0F172A',
    borderRadius: PurePulseTheme.radii.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  flyerBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  flyerBrandName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  flyerBrandSub: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },
  flyerHookText: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  flyerMainHeading: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  flyerDivider: {
    height: 2,
    backgroundColor: PurePulseTheme.colors.primary,
    marginVertical: 16,
    width: 60,
  },
  flyerPointsList: {
    gap: 8,
    marginBottom: 20,
  },
  pointText: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  qrBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: PurePulseTheme.radii.md,
    gap: 14,
  },
  qrGraphic: {
    width: 60,
    height: 60,
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLabel: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  qrUrl: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  qrCodeTag: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  }
});
