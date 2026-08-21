import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurePulseTheme } from '../../theme/theme';
import { ChannelMessage, ForumPost } from '../../types';
import { sampleChannelMessages, sampleForumPosts } from '../../services/mockData';

export const ChannelFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'channels' | 'dms' | 'forum'>('channels');
  const [activeChannel, setActiveChannel] = useState<string>('wins-and-success');
  const [messages, setMessages] = useState<ChannelMessage[]>(sampleChannelMessages);
  const [inputText, setInputText] = useState('');
  const [forumPosts, setForumPosts] = useState<ForumPost[]>(sampleForumPosts);

  const channels = [
    { id: 'wins-and-success', name: '🎉 wins-and-success' },
    { id: 'general', name: '💬 general' },
    { id: 'coaching-deals', name: '💼 coaching-deals' },
    { id: 'announcements', name: '📢 announcements' },
  ];

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: ChannelMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannel,
      senderName: 'Matty Hagen',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      senderRole: 'Silver Partner',
      content: inputText.trim(),
      timestamp: 'Just now',
      likesCount: 0,
      hasLiked: false,
    };

    setMessages([...messages, newMsg]);
    setInputText('');
  };

  const toggleLike = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextLiked = !m.hasLiked;
          return {
            ...m,
            hasLiked: nextLiked,
            likesCount: Math.max(0, nextLiked ? m.likesCount + 1 : m.likesCount - 1),
          };
        }
        return m;
      })
    );
  };

  const toggleForumLike = (id: string) => {
    setForumPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            likesCount: p.likesCount + 1,
          };
        }
        return p;
      })
    );
  };

  const filteredMessages = messages.filter((m) => m.channelId === activeChannel);

  return (
    <View style={styles.container}>
      {/* Top Segmented Navigation Tabs */}
      <View style={styles.topTabs}>
        <TouchableOpacity
          style={[styles.topTabBtn, activeTab === 'channels' && styles.topTabBtnActive]}
          onPress={() => setActiveTab('channels')}
        >
          <Ionicons name="chatbubbles-outline" size={16} color={activeTab === 'channels' ? '#FFF' : PurePulseTheme.colors.textSecondary} />
          <Text style={[styles.topTabText, activeTab === 'channels' && styles.topTabTextActive]}>Group Channels</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topTabBtn, activeTab === 'dms' && styles.topTabBtnActive]}
          onPress={() => setActiveTab('dms')}
        >
          <Ionicons name="paper-plane-outline" size={16} color={activeTab === 'dms' ? '#FFF' : PurePulseTheme.colors.textSecondary} />
          <Text style={[styles.topTabText, activeTab === 'dms' && styles.topTabTextActive]}>Direct Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topTabBtn, activeTab === 'forum' && styles.topTabBtnActive]}
          onPress={() => setActiveTab('forum')}
        >
          <Ionicons name="newspaper-outline" size={16} color={activeTab === 'forum' ? '#FFF' : PurePulseTheme.colors.textSecondary} />
          <Text style={[styles.topTabText, activeTab === 'forum' && styles.topTabTextActive]}>Strategy Forum</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'channels' && (
        <View style={{ flex: 1 }}>
          {/* Channel Selector Ribbon */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.channelRibbon}>
            {channels.map((ch) => (
              <TouchableOpacity
                key={ch.id}
                style={[styles.channelChip, activeChannel === ch.id && styles.channelChipActive]}
                onPress={() => setActiveChannel(ch.id)}
              >
                <Text style={[styles.channelChipText, activeChannel === ch.id && styles.channelChipTextActive]}>
                  {ch.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Messages Feed */}
          <ScrollView contentContainerStyle={styles.messagesList} showsVerticalScrollIndicator={false}>
            {filteredMessages.map((msg) => (
              <View key={msg.id} style={styles.messageBubble}>
                <Image source={{ uri: msg.senderAvatar }} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <View style={styles.msgHeader}>
                    <Text style={styles.senderName}>{msg.senderName}</Text>
                    {msg.senderRole && (
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{msg.senderRole}</Text>
                      </View>
                    )}
                    <Text style={styles.timestamp}>{msg.timestamp}</Text>
                  </View>
                  <Text style={styles.msgContent}>{msg.content}</Text>

                  <View style={styles.msgFooter}>
                    <TouchableOpacity
                      style={[styles.likeBtn, msg.hasLiked && styles.likeBtnActive]}
                      onPress={() => toggleLike(msg.id)}
                    >
                      <Ionicons name={msg.hasLiked ? 'heart' : 'heart-outline'} size={14} color={msg.hasLiked ? '#EC4899' : PurePulseTheme.colors.textMuted} />
                      <Text style={[styles.likeCount, msg.hasLiked && { color: '#EC4899' }]}>{msg.likesCount}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={`Message #${activeChannel}...`}
              placeholderTextColor={PurePulseTheme.colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {activeTab === 'dms' && (
        <View style={styles.dmContainer}>
          <Text style={styles.sectionTitle}>Coaching & Founder DMs</Text>
          <TouchableOpacity style={styles.dmCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }} style={styles.avatarLarge} />
            <View style={{ flex: 1 }}>
              <View style={styles.msgHeader}>
                <Text style={styles.senderName}>Matty Hagen (Founder)</Text>
                <Text style={styles.timestamp}>12m ago</Text>
              </View>
              <Text style={styles.msgContent} numberOfLines={1}>Hey Matty! Let me know if you need help with your next 3 referral prospects.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dmCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' }} style={styles.avatarLarge} />
            <View style={{ flex: 1 }}>
              <View style={styles.msgHeader}>
                <Text style={styles.senderName}>Sarah Vance (Gold Coach)</Text>
                <Text style={styles.timestamp}>1h ago</Text>
              </View>
              <Text style={styles.msgContent} numberOfLines={1}>That tear-off poster strategy works wonders for coffee shops! Check out my forum post.</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {activeTab === 'forum' && (
        <ScrollView contentContainerStyle={styles.forumList} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Community Strategy Forum</Text>
          {forumPosts.map((post) => (
            <View key={post.id} style={styles.forumCard}>
              <View style={styles.forumCategoryTag}>
                <Text style={styles.forumCategoryText}>{post.category}</Text>
              </View>
              <Text style={styles.forumPostTitle}>{post.title}</Text>
              <Text style={styles.forumPostSnippet}>{post.content}</Text>
              
              <View style={styles.forumFooter}>
                <View style={styles.authorRow}>
                  <Image source={{ uri: post.authorAvatar }} style={styles.avatarSmall} />
                  <Text style={styles.authorName}>{post.authorName} • {post.timestamp}</Text>
                </View>

                <View style={styles.forumStats}>
                  <Ionicons name="chatbox-ellipses-outline" size={14} color={PurePulseTheme.colors.textMuted} />
                  <Text style={styles.statText}>{post.repliesCount}</Text>
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}
                    onPress={() => toggleForumLike(post.id)}
                  >
                    <Ionicons name="heart-outline" size={14} color={PurePulseTheme.colors.primaryLight} />
                    <Text style={[styles.statText, { color: PurePulseTheme.colors.primaryLight }]}>{post.likesCount}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PurePulseTheme.colors.background,
  },
  topTabs: {
    flexDirection: 'row',
    backgroundColor: PurePulseTheme.colors.cardBg,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: PurePulseTheme.radii.md,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  topTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: PurePulseTheme.radii.sm,
    gap: 4,
  },
  topTabBtnActive: {
    backgroundColor: PurePulseTheme.colors.primary,
  },
  topTabText: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  topTabTextActive: {
    color: '#FFF',
  },
  channelRibbon: {
    maxHeight: 44,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  channelChip: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  channelChipActive: {
    borderColor: PurePulseTheme.colors.primaryLight,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  channelChipText: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  channelChipTextActive: {
    color: PurePulseTheme.colors.primaryLight,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderRadius: PurePulseTheme.radii.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  avatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  avatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  senderName: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  roleBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    color: PurePulseTheme.colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
  },
  timestamp: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
    marginLeft: 'auto',
  },
  msgContent: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  msgFooter: {
    marginTop: 8,
    flexDirection: 'row',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  likeBtnActive: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
  },
  likeCount: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: PurePulseTheme.colors.cardBorder,
  },
  textInput: {
    flex: 1,
    backgroundColor: PurePulseTheme.colors.cardBgSecondary,
    color: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
  },
  sendBtn: {
    backgroundColor: PurePulseTheme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  dmContainer: {
    padding: 16,
  },
  sectionTitle: {
    ...PurePulseTheme.typography.h3,
    fontSize: 16,
    marginBottom: 12,
  },
  dmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PurePulseTheme.colors.cardBg,
    padding: 14,
    borderRadius: PurePulseTheme.radii.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  forumList: {
    padding: 16,
  },
  forumCard: {
    backgroundColor: PurePulseTheme.colors.cardBg,
    borderRadius: PurePulseTheme.radii.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PurePulseTheme.colors.cardBorder,
  },
  forumCategoryTag: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  forumCategoryText: {
    color: PurePulseTheme.colors.accentBlue,
    fontSize: 10,
    fontWeight: '700',
  },
  forumPostTitle: {
    ...PurePulseTheme.typography.h3,
    fontSize: 15,
    marginBottom: 6,
  },
  forumPostSnippet: {
    color: PurePulseTheme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  forumFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
  },
  forumStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: PurePulseTheme.colors.textMuted,
    fontSize: 11,
    marginLeft: 4,
  }
});
