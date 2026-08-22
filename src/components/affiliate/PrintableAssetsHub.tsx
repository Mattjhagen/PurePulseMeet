import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { PurePulseTheme } from '../../theme/theme';
import { getCurrentUserProfile } from '../../services/api';

const templates = [
  { id: 'neon', title: 'Neon launch flyer', description: 'High-contrast letter-size flyer.', icon: 'flash-outline' as const },
  { id: 'clean', title: 'Clean business flyer', description: 'Simple design for offices and cafés.', icon: 'document-text-outline' as const },
  { id: 'local', title: 'Local business flyer', description: 'Focused on local business outcomes.', icon: 'storefront-outline' as const },
  { id: 'tabs', title: 'Tear-off poster', description: 'Letter-size poster with referral tabs.', icon: 'cut-outline' as const },
];

export const PrintableAssetsHub: React.FC = () => {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => { getCurrentUserProfile().then((profile) => setCode(profile.partnerCode)).catch((error) => Alert.alert('Flyers unavailable', error.message)); }, []);
  if (!code) return <View style={styles.center}><ActivityIndicator color={PurePulseTheme.colors.primaryLight} /></View>;

  const urlFor = (template: string) => `https://login.purepulse.one/affiliates/print/${encodeURIComponent(code)}?template=${template}`;
  const open = async (template: string) => { await WebBrowser.openBrowserAsync(urlFor(template), { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET }); };
  const share = async (template: string) => { await Share.share({ title: 'PurePulse affiliate flyer', message: `Open and print my PurePulse flyer: ${urlFor(template)}`, url: urlFor(template) }); };

  return <View style={styles.root}><Text style={styles.title}>Printable Assets</Text><Text style={styles.subtitle}>Each flyer is generated from your real affiliate code. Open it inside the app to print, save, or share.</Text><View style={styles.list}>{templates.map((template) => <View key={template.id} style={styles.card}><View style={styles.icon}><Ionicons name={template.icon} size={24} color={PurePulseTheme.colors.primaryLight} /></View><View style={styles.info}><Text style={styles.cardTitle}>{template.title}</Text><Text style={styles.description}>{template.description}</Text><Text style={styles.code}>Referral code: {code}</Text></View><View style={styles.actions}><TouchableOpacity accessibilityLabel={`Open and print ${template.title}`} onPress={() => open(template.id)} style={styles.primary}><Ionicons name="print-outline" size={18} color="#fff" /><Text style={styles.primaryText}>Open</Text></TouchableOpacity><TouchableOpacity accessibilityLabel={`Share ${template.title}`} onPress={() => share(template.id)} style={styles.share}><Ionicons name="share-social-outline" size={20} color={PurePulseTheme.colors.primaryLight} /></TouchableOpacity></View></View>)}</View></View>;
};

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: PurePulseTheme.colors.background, padding: 16 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: PurePulseTheme.colors.background }, title: { ...PurePulseTheme.typography.h2, fontSize: 20 }, subtitle: { ...PurePulseTheme.typography.caption, marginTop: 4, marginBottom: 16, lineHeight: 18 }, list: { gap: 12 }, card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, backgroundColor: PurePulseTheme.colors.cardBg, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder, gap: 11 }, icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(124,58,237,0.15)' }, info: { flex: 1, minWidth: 0 }, cardTitle: { color: PurePulseTheme.colors.textPrimary, fontSize: 14, fontWeight: '800' }, description: { color: PurePulseTheme.colors.textSecondary, fontSize: 11, lineHeight: 15, marginTop: 2 }, code: { color: PurePulseTheme.colors.primaryLight, fontSize: 10, marginTop: 5 }, actions: { gap: 7, alignItems: 'stretch' }, primary: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: PurePulseTheme.colors.primary, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9 }, primaryText: { color: '#fff', fontSize: 11, fontWeight: '800' }, share: { alignItems: 'center', justifyContent: 'center', padding: 7, borderRadius: 9, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder }, });
