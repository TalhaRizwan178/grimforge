import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fontFamilies } from '../theme/fonts';
import LoadingForge from '../components/LoadingForge';
import api from '../api/axios';
import { leaveNovelDetail } from '../navigation/navigationHelpers';

export default function NovelDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchNovelDetails();
  }, [id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => leaveNovelDetail(navigation)}
          style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme.text]);

  const fetchNovelDetails = async () => {
    try {
      const res = await api.get(`/novels/${id}`);
      setNovel(res.data);
    } catch (err) {
      console.warn('Failed to load novel details', err);
      Alert.alert('Error', 'Failed to retrieve novel details');
      leaveNovelDetail(navigation);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Novel',
      'Are you absolutely sure you want to delete this novel? This action is permanent and will destroy all generated chapters and context.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Destroy',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(`/novels/${id}`);
              Alert.alert('Destroyed', 'The novel was destroyed from the forge.');
              navigation.navigate('Home');
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to delete novel');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingForge message="Summoning details..." fullPage={true} />;
  }

  if (!novel) return null;

  const isCreator = user && novel.creator_id === user.id;
  const fallbackUri = `https://picsum.photos/seed/${novel.id}/800/450`;
  const cleanUrl = (url) => {
    if (!url) return null;
    try { const u = new URL(url); u.searchParams.delete('nologo'); u.searchParams.delete('enhance'); return u.toString(); } catch { return url; }
  };
  const imageUri = cleanUrl(novel.thumbnail_url) || fallbackUri;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.scrollContent}>
      {/* Banner Hero */}
      <View style={styles.bannerContainer}>
        <Image source={{ uri: imageUri }} style={styles.bannerImage} resizeMode="cover" />
        <View style={[styles.bannerOverlay, { backgroundColor: 'rgba(10, 10, 15, 0.4)' }]} />
      </View>

      {/* Main Details */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: theme.text, fontFamily: fontFamilies.display }]}>
          {novel.title}
        </Text>
        
        {/* Creator */}
        <Text style={[styles.creator, { color: theme.muted, fontFamily: fontFamilies.display }]}>
          by {novel.creator?.username || 'Unknown'}
        </Text>

        {/* Action Button Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Reader', { id: novel.id })}
            style={[styles.primaryBtn, { backgroundColor: theme.accent, borderColor: theme.accent }]}
          >
            <Ionicons name="book-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
            <Text style={[styles.primaryBtnText, { fontFamily: fontFamilies.display }]}>
              Enter Reader
            </Text>
          </TouchableOpacity>
        </View>

        {/* Spec Card Grid */}
        <View style={[styles.specsCard, { backgroundColor: theme.bg3, borderColor: theme.border }]}>
          <View style={[styles.specRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.specLabel, { color: theme.faint, fontFamily: fontFamilies.display }]}>Genre</Text>
            <Text style={[styles.specVal, { color: theme.text }]}>{novel.genre}</Text>
          </View>
          <View style={[styles.specRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.specLabel, { color: theme.faint, fontFamily: fontFamilies.display }]}>Tone</Text>
            <Text style={[styles.specVal, { color: theme.text }]}>{novel.tone}</Text>
          </View>
          <View style={[styles.specRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.specLabel, { color: theme.faint, fontFamily: fontFamilies.display }]}>Length Preferences</Text>
            <Text style={[styles.specVal, { color: theme.text }]}>{novel.chapter_length} words per chapter</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={[styles.specLabel, { color: theme.faint, fontFamily: fontFamilies.display }]}>Readers Count</Text>
            <Text style={[styles.specVal, { color: theme.text }]}>{novel.reader_count || 0}</Text>
          </View>
        </View>

        {/* Plot Synopsis Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
              Plot Premise
            </Text>
            <View style={[styles.titleUnderline, { backgroundColor: theme.accent }]} />
          </View>
          <View style={[styles.plotCard, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
            <Text style={[styles.plotText, { color: theme.text2 }]}>
              {novel.plot}
            </Text>
          </View>
        </View>

        {/* Chapter 1 Preview Section */}
        {novel.chapter1 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                Chapter I Preview
              </Text>
              <View style={[styles.titleUnderline, { backgroundColor: theme.accent }]} />
            </View>
            <View style={[styles.previewCard, { backgroundColor: theme.bg3, borderColor: theme.border }]}>
              <Text numberOfLines={6} style={[styles.previewText, { color: theme.text2, fontFamily: fontFamilies.crimson }]}>
                {novel.chapter1.content.replace(/<[^>]*>/g, '').trim()}
              </Text>
              <View style={[styles.previewOverlay, { backgroundColor: theme.bg3 }]} />
              <TouchableOpacity
                onPress={() => navigation.navigate('Reader', { id: novel.id })}
                style={styles.expandPreviewRow}
              >
                <Text style={[styles.expandPreviewText, { color: theme.gold, fontFamily: fontFamilies.display }]}>
                  Continue Reading
                </Text>
                <Ionicons name="arrow-forward" size={14} color={theme.gold} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Creator Control panel */}
        {isCreator && (
          <View style={[styles.creatorPanel, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={deleting}
              onPress={handleDelete}
              style={[styles.deleteBtn, { borderColor: theme.accent }]}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={theme.accent} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={16} color={theme.accent} style={{ marginRight: 6 }} />
                  <Text style={[styles.deleteBtnText, { color: theme.accent, fontFamily: fontFamilies.display }]}>
                    Destroy Grimoire Novel
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 20,
    marginTop: -20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
    lineHeight: 26,
    marginBottom: 4,
  },
  creator: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  specsCard: {
    borderWidth: 1,
    borderRadius: 2,
    marginBottom: 24,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  specLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    position: 'relative',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  titleUnderline: {
    width: 30,
    height: 1,
    marginTop: 6,
  },
  plotCard: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 16,
  },
  plotText: {
    fontSize: 13,
    lineHeight: 20,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 2,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  previewText: {
    fontSize: 14,
    lineHeight: 22,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    opacity: 0.8,
  },
  expandPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  expandPreviewText: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  creatorPanel: {
    borderTopWidth: 1,
    paddingTop: 24,
    marginTop: 10,
  },
  deleteBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  deleteBtnText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
