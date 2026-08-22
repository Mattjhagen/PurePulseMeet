import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurePulseTheme } from '../../theme/theme';
import { AffiliateDirectoryEntry, ChannelMessage, DirectMessage, ForumComment, ForumPost, UserProfile } from '../../types';
import { createForumComment, createForumPost, fetchAffiliateDirectory, fetchChannelMessages, fetchDirectMessages, fetchForumComments, fetchForumPosts, getCurrentUserProfile, sendChannelMessage, sendDirectMessage, subscribeToChannelMessages, subscribeToDirectMessages } from '../../services/api';

const channelOptions = [
  ['wins-and-success', 'trophy-outline', 'Wins'], ['general', 'chatbubbles-outline', 'General'],
  ['coaching-deals', 'briefcase-outline', 'Coaching'], ['announcements', 'megaphone-outline', 'Announcements'],
] as const;

export const ChannelFeed: React.FC = () => {
  const [tab, setTab] = useState<'channels' | 'dms' | 'forum'>('channels');
  const [channel, setChannel] = useState('wins-and-success');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [directory, setDirectory] = useState<AffiliateDirectoryEntry[]>([]);
  const [recipient, setRecipient] = useState<AffiliateDirectoryEntry | null>(null);
  const [direct, setDirect] = useState<DirectMessage[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [text, setText] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => { getCurrentUserProfile().then(setProfile).catch(showError); }, []);
  useEffect(() => {
    if (tab !== 'channels') return;
    setLoading(true); fetchChannelMessages(channel).then(setMessages).catch(showError).finally(() => setLoading(false));
    const sub = subscribeToChannelMessages(channel, (message) => setMessages((items) => items.some(({ id }) => id === message.id) ? items : [...items, message]));
    return () => { void sub.unsubscribe(); };
  }, [tab, channel]);
  useEffect(() => {
    if (tab !== 'dms' || !profile) return;
    setLoading(true); fetchAffiliateDirectory().then((items) => setDirectory(items.filter(({ id }) => id !== profile.id))).catch(showError).finally(() => setLoading(false));
    const sub = subscribeToDirectMessages((message) => {
      if (recipient && (message.senderId === recipient.id || message.receiverId === recipient.id)) setDirect((items) => items.some(({ id }) => id === message.id) ? items : [...items, message]);
    });
    return () => { void sub.unsubscribe(); };
  }, [tab, profile, recipient]);
  useEffect(() => {
    if (!recipient) return;
    setLoading(true); fetchDirectMessages(recipient.id).then(setDirect).catch(showError).finally(() => setLoading(false));
  }, [recipient]);
  useEffect(() => {
    if (tab !== 'forum') return;
    setLoading(true); fetchForumPosts().then(setPosts).catch(showError).finally(() => setLoading(false));
  }, [tab]);

  const send = async () => {
    if (!text.trim() || !profile || sending) return;
    setSending(true);
    try {
      if (tab === 'channels') await sendChannelMessage(channel, text, profile.name, profile.avatarUrl);
      else if (recipient) { await sendDirectMessage(recipient.id, text); setDirect(await fetchDirectMessages(recipient.id)); }
      setText('');
    } catch (error) { showError(error); } finally { setSending(false); }
  };
  const publish = async () => {
    if (!postTitle.trim() || !postBody.trim()) return;
    setSending(true);
    try { await createForumPost(postTitle, postBody, 'Community'); setPostTitle(''); setPostBody(''); setPosts(await fetchForumPosts()); }
    catch (error) { showError(error); } finally { setSending(false); }
  };
  const openComments = async (post: ForumPost) => { setSelectedPost(post); try { setComments(await fetchForumComments(post.id)); } catch (error) { showError(error); } };
  const comment = async () => { if (!selectedPost || !commentText.trim()) return; setSending(true); try { await createForumComment(selectedPost.id, commentText); setCommentText(''); setComments(await fetchForumComments(selectedPost.id)); setPosts(await fetchForumPosts()); } catch (error) { showError(error); } finally { setSending(false); } };

  return <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={88}>
    <View style={styles.tabs}>{([['channels', 'chatbubbles-outline', 'Channels'], ['dms', 'paper-plane-outline', 'DMs'], ['forum', 'newspaper-outline', 'Board']] as const).map(([id, icon, label]) =>
      <TouchableOpacity key={id} style={[styles.tab, tab === id && styles.selected]} onPress={() => setTab(id)}><Ionicons name={icon} size={18} color={tab === id ? '#fff' : PurePulseTheme.colors.textSecondary} /><Text style={[styles.tabLabel, tab === id && styles.white]}>{label}</Text></TouchableOpacity>)}</View>

    {tab === 'channels' && <><ScrollView horizontal contentContainerStyle={styles.ribbon} showsHorizontalScrollIndicator={false}>{channelOptions.map(([id, icon, label]) =>
      <TouchableOpacity key={id} style={[styles.chip, channel === id && styles.outlined]} onPress={() => setChannel(id)}><Ionicons name={icon} size={15} color={PurePulseTheme.colors.primaryLight} /><Text style={styles.muted}>{label}</Text></TouchableOpacity>)}</ScrollView>
      <Messages loading={loading} items={messages.map((item) => ({ id: item.id, name: item.senderName, avatar: item.senderAvatar, body: item.content, time: item.timestamp, mine: item.senderName === profile?.name }))} />
      <Composer value={text} setValue={setText} send={send} disabled={sending} placeholder={`Message #${channel}`} /></>}

    {tab === 'dms' && <><ScrollView horizontal contentContainerStyle={styles.ribbon} showsHorizontalScrollIndicator={false}>{directory.map((person) =>
      <TouchableOpacity key={person.id} style={[styles.chip, recipient?.id === person.id && styles.outlined]} onPress={() => setRecipient(person)}><Image source={{ uri: person.avatarUrl }} style={styles.avatarSmall} /><Text numberOfLines={1} style={styles.muted}>{person.name}</Text></TouchableOpacity>)}</ScrollView>
      <Text style={styles.heading}>{recipient?.name || 'Direct messages'}</Text>
      {!recipient ? <Empty text={loading ? 'Loading affiliates…' : 'Choose an affiliate to start a private conversation.'} /> : <><Messages loading={loading} items={direct.map((item) => ({ id: item.id, name: item.senderId === profile?.id ? 'You' : recipient.name, avatar: item.senderId === profile?.id ? profile?.avatarUrl : recipient.avatarUrl, body: item.content, time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), mine: item.senderId === profile?.id }))} /><Composer value={text} setValue={setText} send={send} disabled={sending} placeholder={`Message ${recipient.name}`} /></>}</>}

    {tab === 'forum' && <ScrollView contentContainerStyle={styles.posts}><Text style={styles.heading}>Affiliate message board</Text><View style={styles.card}><TextInput value={postTitle} onChangeText={setPostTitle} placeholder="Post title" placeholderTextColor={PurePulseTheme.colors.textMuted} style={styles.input} maxLength={140} /><TextInput value={postBody} onChangeText={setPostBody} placeholder="Share an announcement or coaching tip" placeholderTextColor={PurePulseTheme.colors.textMuted} style={[styles.input, styles.multiline]} multiline maxLength={4000} /><TouchableOpacity style={styles.publish} onPress={publish} disabled={sending}><Ionicons name="add-circle-outline" size={18} color="#fff" /><Text style={styles.white}>Publish</Text></TouchableOpacity></View>{loading ? <ActivityIndicator color={PurePulseTheme.colors.primaryLight} /> : posts.length === 0 ? <Empty text="No posts yet. Start the conversation." /> : posts.map((post) => <View key={post.id} style={styles.card}><Text style={styles.postTitle}>{post.title}</Text><Text style={styles.body}>{post.content}</Text><View style={styles.author}><Image source={{ uri: post.authorAvatar }} style={styles.avatarSmall} /><Text style={[styles.muted, { flex: 1 }]}>{post.authorName} · {post.timestamp}</Text><TouchableOpacity style={styles.commentButton} onPress={() => openComments(post)}><Ionicons name="chatbox-outline" size={15} color={PurePulseTheme.colors.primaryLight} /><Text style={styles.secondaryText}>{post.repliesCount} Comments</Text></TouchableOpacity></View>{selectedPost?.id === post.id && <View style={styles.comments}>{comments.map((item) => <View key={item.id} style={styles.comment}><Image source={{ uri: item.authorAvatar }} style={styles.avatarSmall} /><View style={{ flex: 1 }}><Text style={styles.name}>{item.authorName} <Text style={styles.muted}>{item.timestamp}</Text></Text><Text style={styles.body}>{item.content}</Text></View></View>)}<View style={styles.commentComposer}><TextInput style={[styles.input, { flex: 1 }]} value={commentText} onChangeText={setCommentText} placeholder="Write a comment" placeholderTextColor={PurePulseTheme.colors.textMuted} maxLength={2000} /><TouchableOpacity style={styles.send} onPress={comment} disabled={sending}><Ionicons name="send" size={16} color="#fff" /></TouchableOpacity></View></View>}</View>)}</ScrollView>}
  </KeyboardAvoidingView>;
};

function showError(error: unknown) { Alert.alert('Community unavailable', error instanceof Error ? error.message : 'Please try again.'); }
const Empty = ({ text }: { text: string }) => <View style={styles.empty}><Ionicons name="chatbubble-ellipses-outline" size={42} color={PurePulseTheme.colors.textMuted} /><Text style={styles.muted}>{text}</Text></View>;
const Messages = ({ loading, items }: { loading: boolean; items: { id: string; name: string; avatar?: string; body: string; time: string; mine: boolean }[] }) => loading ? <View style={styles.empty}><ActivityIndicator color={PurePulseTheme.colors.primaryLight} /></View> : <ScrollView contentContainerStyle={styles.messages}>{items.length === 0 ? <Empty text="No messages yet." /> : items.map((item) => <View key={item.id} style={[styles.message, item.mine && styles.outlined]}>{item.avatar ? <Image source={{ uri: item.avatar }} style={styles.avatar} /> : null}<View style={styles.messageText}><Text style={styles.name}>{item.name} <Text style={styles.muted}>{item.time}</Text></Text><Text style={styles.body}>{item.body}</Text></View></View>)}</ScrollView>;
const Composer = ({ value, setValue, send, disabled, placeholder }: { value: string; setValue: (value: string) => void; send: () => void; disabled: boolean; placeholder: string }) => <View style={styles.composer}><TextInput style={styles.composerInput} value={value} onChangeText={setValue} placeholder={placeholder} placeholderTextColor={PurePulseTheme.colors.textMuted} maxLength={4000} /><TouchableOpacity style={styles.send} onPress={send} disabled={disabled}><Ionicons name="send" size={17} color="#fff" /></TouchableOpacity></View>;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PurePulseTheme.colors.background }, tabs: { flexDirection: 'row', margin: 16, marginBottom: 4, padding: 5, borderRadius: 12, backgroundColor: PurePulseTheme.colors.cardBg }, tab: { flex: 1, minWidth: 0, flexDirection: 'row', gap: 5, justifyContent: 'center', alignItems: 'center', paddingVertical: 9, borderRadius: 9 }, selected: { backgroundColor: PurePulseTheme.colors.primary }, tabLabel: { color: PurePulseTheme.colors.textSecondary, fontSize: 12, fontWeight: '700' }, white: { color: '#fff', fontWeight: '700' }, secondaryText: { color: PurePulseTheme.colors.primaryLight, fontSize: 11, fontWeight: '700' }, ribbon: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 }, chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder, backgroundColor: PurePulseTheme.colors.cardBg, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 20, maxWidth: 165 }, outlined: { borderColor: PurePulseTheme.colors.primaryLight }, muted: { color: PurePulseTheme.colors.textMuted, fontSize: 11 }, heading: { color: PurePulseTheme.colors.textPrimary, fontSize: 17, fontWeight: '800', marginHorizontal: 16, marginVertical: 8 }, messages: { padding: 16, paddingTop: 5, gap: 9, flexGrow: 1 }, message: { flexDirection: 'row', backgroundColor: PurePulseTheme.colors.cardBg, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder, borderRadius: 13, padding: 12 }, avatar: { width: 34, height: 34, borderRadius: 17, marginRight: 9 }, avatarSmall: { width: 24, height: 24, borderRadius: 12 }, messageText: { flex: 1, minWidth: 0 }, name: { color: PurePulseTheme.colors.textPrimary, fontSize: 12, fontWeight: '700', marginBottom: 4 }, body: { color: PurePulseTheme.colors.textSecondary, fontSize: 13, lineHeight: 19 }, empty: { minHeight: 150, flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }, composer: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderColor: PurePulseTheme.colors.cardBorder }, composerInput: { flex: 1, color: PurePulseTheme.colors.textPrimary, backgroundColor: PurePulseTheme.colors.cardBg, borderRadius: 12, paddingHorizontal: 13 }, send: { width: 42, height: 42, borderRadius: 21, backgroundColor: PurePulseTheme.colors.primary, justifyContent: 'center', alignItems: 'center' }, posts: { padding: 16, gap: 12 }, card: { backgroundColor: PurePulseTheme.colors.cardBg, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder, borderRadius: 14, padding: 14, gap: 10 }, input: { color: PurePulseTheme.colors.textPrimary, borderWidth: 1, borderColor: PurePulseTheme.colors.cardBorder, borderRadius: 10, padding: 11 }, multiline: { minHeight: 88, textAlignVertical: 'top' }, publish: { alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PurePulseTheme.colors.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9 }, postTitle: { color: PurePulseTheme.colors.textPrimary, fontSize: 16, fontWeight: '800' }, author: { flexDirection: 'row', alignItems: 'center', gap: 7 }, commentButton: { flexDirection: 'row', alignItems: 'center', gap: 4 }, comments: { borderTopWidth: 1, borderColor: PurePulseTheme.colors.cardBorder, paddingTop: 10, gap: 9 }, comment: { flexDirection: 'row', gap: 8, padding: 9, borderRadius: 10, backgroundColor: PurePulseTheme.colors.cardBgSecondary }, commentComposer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
