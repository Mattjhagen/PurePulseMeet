import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { PurePulseTheme } from '../../theme/theme';
import { HuddleRoomInfo } from '../../types';
import { sampleHuddles } from '../../services/mockData';

export const JitsiHuddleRoom: React.FC = () => {
  const [huddles, setHuddles] = useState<HuddleRoomInfo[]>(sampleHuddles);
  const [activeRoom, setActiveRoom] = useState<HuddleRoomInfo | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  const startNewHuddle = () => {
    const roomId = `PurePulseHuddle-${Date.now().toString().slice(-4)}`;
    const newRoom: HuddleRoomInfo = {
      id: `huddle-${Date.now()}`,
      title: 'Impromptu Coaching & Deal Huddle',
      hostName: 'Matty Hagen (You)',
      hostAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      participantsCount: 1,
      isLive: true,
      jitsiRoomUrl: `https://meet.jit.si/${roomId}`,
      category: 'Impromptu Q&A'
    };
    setHuddles([newRoom, ...huddles]);
    setActiveRoom(newRoom);
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
        <TouchableOpacity style={styles.startHuddleBtn} onPress={startNewHuddle}>
          <Ionicons name="videocam-outline" size={18} color="#FFF" />
          <Text style={styles.startHuddleText}>Start Huddle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeader}>Active & Upcoming Rooms</Text>
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
            >
              <Ionicons name="enter-outline" size={18} color="#FFF" />
              <Text style={styles.joinBtnText}>
                {room.isLive ? 'Join Jitsi Meeting' : 'Open Room'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

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
              />
            </View>

            {/* Floating Huddle Control Bar */}
            <View style={styles.controlBar}>
              <TouchableOpacity
                style={[styles.controlBtn, isMicMuted && styles.controlBtnMuted]}
                onPress={() => setIsMicMuted(!isMicMuted)}
              >
                <Ionicons name={isMicMuted ? 'mic-off' : 'mic'} size={20} color="#FFF" />
                <Text style={styles.controlLabel}>{isMicMuted ? 'Unmute' : 'Mute'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlBtn, isCamOff && styles.controlBtnMuted]}
                onPress={() => setIsCamOff(!isCamOff)}
              >
                <Ionicons name={isCamOff ? 'videocam-off' : 'videocam'} size={20} color="#FFF" />
                <Text style={styles.controlLabel}>{isCamOff ? 'Start Cam' : 'Cam On'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => Alert.alert('Hand Raised', 'Your hand has been raised for coaching questions!')}
              >
                <Ionicons name="hand-raised-outline" size={20} color="#FFF" />
                <Text style={styles.controlLabel}>Raise Hand</Text>
              </TouchableOpacity>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurePulseTheme.colors.background,
  },
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
