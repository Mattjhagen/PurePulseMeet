import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { PurePulseTheme } from '../../theme/theme';
import { HuddleRoomInfo } from '../../types';
import { createHuddleRoom, fetchHuddleRooms, getCurrentUserProfile, subscribeToHuddleRooms } from '../../services/api';

export const JitsiHuddleRoom: React.FC = () => {
  const [huddles, setHuddles] = useState<HuddleRoomInfo[]>([]);
  const [activeRoom, setActiveRoom] = useState<HuddleRoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    void loadHuddles();
    getCurrentUserProfile().then((profile) => setCanCreate(profile.email.toLowerCase().endsWith('@purepulse.one'))).catch(() => setCanCreate(false));
    const subscription = subscribeToHuddleRooms(() => { void loadHuddles(); });
    return () => { void subscription.unsubscribe(); };
  }, []);

  const loadHuddles = async () => {
    setLoading(true);
    const rooms = await fetchHuddleRooms();
    setHuddles(rooms);
    setLoading(false);
  };

  const startNewHuddle = async () => {
    if (!title.trim()) return;
    try {
      const room = await createHuddleRoom(title, 'Impromptu Q&A');
      setCreateOpen(false);
      setTitle('');
      setActiveRoom(room);
    } catch (error) {
      Alert.alert('Could not create huddle', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerTextCol}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>TEAMS & HUDDLES</Text>
          </View>
          <Text style={styles.bannerTitle}>Live Audio & Video Coaching</Text>
          <Text style={styles.bannerSub}>
            Huddle up with fellow affiliates, share live sales wins, and get 1-on-1 deal support.
          </Text>
        </View>
        <TouchableOpacity style={[styles.startHuddleBtn, !canCreate && styles.joinBtnDisabled]} onPress={() => setCreateOpen(true)} disabled={!canCreate}>
          <Ionicons name="videocam-outline" size={18} color="#FFF" />
          <Text style={styles.startHuddleText}>Start Huddle</Text>
        </TouchableOpacity>
      </View>
      {!canCreate && <Text style={styles.createNotice}>Joining is open to affiliates. Creating a huddle requires a verified @purepulse.one email.</Text>}

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={PurePulseTheme.colors.primaryLight} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>Live huddles</Text>
          {huddles.length === 0 && <View style={styles.centerBox}><Ionicons name="videocam-outline" size={42} color={PurePulseTheme.colors.textMuted} /><Text style={styles.createNotice}>No live huddles right now.</Text></View>}
          {huddles.map((room) => (
            <View key={room.id} style={[styles.roomCard, room.isLive && styles.roomCardLive]}>
              <View style={styles.roomHeader}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{room.category}</Text>
                </View>
                {room.isLive ? (
                  <View style={styles.pulseContainer}>
                    <Text style={styles.liveText}>● LIVE NOW</Text>
                  </View>
                ) : (
                  <Text style={styles.endedText}>Scheduled</Text>
                )}
              </View>

              <Text style={styles.roomTitle}>{room.title}</Text>

              <View style={styles.hostRow}>
                <Image source={{ uri: room.hostAvatar }} style={styles.hostAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.hostLabel}>Hosted by</Text>
                  <Text style={styles.hostName}>{room.hostName}</Text>
                </View>

                <View style={styles.participantTag}>
                  <Ionicons name="people-outline" size={14} color={PurePulseTheme.colors.textSecondary} />
                  <Text style={styles.participantCount}>{room.participantsCount} in room</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.joinBtn, !room.isLive && styles.joinBtnDisabled]}
                onPress={() => setActiveRoom(room)}
                disabled={!room.isLive}
              >
                <Ionicons name="enter-outline" size={18} color="#FFF" />
                <Text style={styles.joinBtnText}>
                  {room.isLive ? 'Join meeting' : 'Huddle ended'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Jitsi Meeting Modal */}
      {activeRoom && (
        <Modal animationType="slide" visible={!!activeRoom} onRequestClose={() => setActiveRoom(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{activeRoom.title}</Text>
                <Text style={styles.modalSub}>Jitsi Meet Room • {activeRoom.hostName}</Text>
              </View>
              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setActiveRoom(null)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Jitsi WebView */}
            <View style={styles.webviewWrapper}>
              <WebView
                source={{ uri: activeRoom.jitsiRoomUrl }}
                style={{ flex: 1 }}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                originWhitelist={['https://meet.jit.si*', 'https://*.jit.si*']}
                allowFileAccess={false}
                allowUniversalAccessFromFileURLs={false}
                mediaCapturePermissionGrantType="grant"
                setSupportMultipleWindows={false}
                mixedContentMode="never"
              />
            </View>

            <View style={styles.controlBar}>
              <TouchableOpacity
                style={[styles.controlBtn, styles.leaveBtn]}
                onPress={() => setActiveRoom(null)}
              >
                <Ionicons name="call" size={20} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
                <Text style={styles.controlLabel}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      <Modal transparent animationType="fade" visible={createOpen} onRequestClose={() => setCreateOpen(false)}>
        <View style={styles.createBackdrop}><View style={styles.createCard}><Text style={styles.modalTitle}>Create a live huddle</Text><Text style={styles.createNotice}>The meeting is saved to PurePulse and opens with real Jitsi controls.</Text><TextInput style={styles.createInput} value={title} onChangeText={setTitle} placeholder="Huddle title" placeholderTextColor={PurePulseTheme.colors.textMuted} maxLength={120} /><View style={styles.createActions}><TouchableOpacity onPress={() => setCreateOpen(false)}><Text style={styles.createNotice}>Cancel</Text></TouchableOpacity><TouchableOpacity style={styles.startHuddleBtn} onPress={startNewHuddle}><Ionicons name="videocam-outline" size={18} color="#fff" /><Text style={styles.startHuddleText}>Create</Text></TouchableOpacity></View></View></View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurePulseTheme.colors.background,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createNotice: { color: PurePulseTheme.colors.textMuted, fontSize: 12, textAlign: 'center', marginHorizontal: 20, marginBottom: 8 },
  createBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  createCard: { width: '100%', maxWidth: 460, borderRadius: 16, padding: 18, gap: 14, backgroundColor: PurePulseTheme.colors.cardBg, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder },
  createInput: { color: PurePulseTheme.colors.textPrimary, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder, borderRadius: 10, padding: 12 },
  createActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 18 },
  bannerContainer: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    margin: 16,
    padding: 16,
    borderRadius: PurePulseTheme.radii.lg,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorderActive,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PurePulseTheme.colors.primaryLight,
    marginRight: 6,
  },
  liveBadgeText: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
  },
  bannerTitle: {
    ...PurePulseTheme.typography.h3,
    fontSize: 16,
  },
  bannerSub: {
    ...PurePulseTheme.typography.caption,
    marginTop: 4,
  },
  startHuddleBtn: {
    backgroundColor: PurePulseTheme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: PurePulseTheme.radii.md,
    gap: 6,
  },
  startHuddleText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  scrollList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    ...PurePulseTheme.typography.h3,
    fontSize: 16,
    marginBottom: 12,
  },
  roomCard: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderRadius: PurePulseTheme.radii.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  roomCardLive: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  pulseContainer: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveText: {
    color: PurePulseTheme.colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  endedText: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
  },
  roomTitle: {
    ...PurePulseTheme.typography.h3,
    fontSize: 15,
    marginBottom: 12,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  hostLabel: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 10,
  },
  hostName: {
    color: PurePulseTheme.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  participantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  participantCount: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 11,
  },
  joinBtn: {
    backgroundColor: PurePulseTheme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: PurePulseTheme.radii.md,
    gap: 6,
  },
  joinBtnDisabled: {
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
  },
  joinBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: PurePulseTheme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: PurePulseTheme.colors.cardBorder,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalSub: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 12,
  },
  closeModalBtn: {
    padding: 6,
  },
  webviewWrapper: {
    flex: 1,
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: PurePulseTheme.colors.cardBorder,
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    minWidth: 70,
  },
  controlBtnMuted: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  leaveBtn: {
    backgroundColor: PurePulseTheme.colors.danger,
  },
  controlLabel: {
    color: '#FFF',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  }
});
