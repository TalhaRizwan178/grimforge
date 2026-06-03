import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fontFamilies } from '../theme/fonts';
import LoadingForge from '../components/LoadingForge';
import api from '../api/axios';

export default function LibraryScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLibrary();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLibrary = async () => {
    try {
      const res = await api.get('/novels/user/library');
      setLibrary(res.data || []);
    } catch (err) {
      console.warn('Failed to load library', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLibrary();
  }, []);

  const renderLibraryItem = ({ item }) => {
    const novel = item.novel;
    if (!novel) return null;

    const fallbackUri = `https://picsum.photos/seed/${novel.id}/800/450`;
    const cleanUrl = (url) => {
      if (!url) return null;
      try { const u = new URL(url); u.searchParams.delete('nologo'); u.searchParams.delete('enhance'); if (u.searchParams.get('model') === 'flux') u.searchParams.set('model', 'turbo'); return u.toString(); } catch { return url; }
    };
    const imageUri = cleanUrl(novel.thumbnail_url) || fallbackUri;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Reader', { id: novel.id })}
        style={[
          styles.itemCard,
          {
            backgroundColor: theme.bg3,
            borderColor: theme.border,
          },
        ]}
      >
        <Image source={{ uri: imageUri }} style={styles.itemImage} resizeMode="cover" />
        <View style={styles.itemInfo}>
          <Text numberOfLines={1} style={[styles.itemTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
            {novel.title}
          </Text>
          <Text style={[styles.itemAuthor, { color: theme.muted, fontFamily: fontFamilies.display }]}>
            by {novel.creator?.username || 'Unknown'}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.chapterBadge, { backgroundColor: theme.badgeBg, borderColor: theme.border }]}>
              <Text style={[styles.chapterBadgeText, { color: theme.badgeColor, fontFamily: fontFamilies.display }]}>
                Chapter {item.latest_chapter}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.arrowIcon}>
          <Ionicons name="chevron-forward" size={18} color={theme.gold} />
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.bg }]}>
        <Ionicons name="lock-closed-outline" size={48} color={theme.faint} style={{ marginBottom: 16 }} />
        <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
          Locked Chamber
        </Text>
        <Text style={[styles.emptySub, { color: theme.muted }]}>
          You must step into the light and identify yourself to access your personal grimoire collection.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Auth')}
          style={[styles.loginBtn, { backgroundColor: theme.accent, borderColor: theme.accent }]}
        >
          <Ionicons name="log-in-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={[styles.loginBtnText, { fontFamily: fontFamilies.display }]}>
            Identify Yourself
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (loading) {
    return <LoadingForge message="Gathering scripts..." fullPage={true} />;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text, fontFamily: fontFamilies.display }]}>
          Your Library
        </Text>
        <View style={[styles.titleUnderline, { backgroundColor: theme.accent }]} />
      </View>

      <FlatList
        data={library}
        keyExtractor={(item) => item.novel?.id?.toString() || Math.random().toString()}
        renderItem={renderLibraryItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={48} color={theme.faint} />
            <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
              Silent Shelves
            </Text>
            <Text style={[styles.emptySub, { color: theme.muted }]}>
              Your library is currently empty. Begin forging a novel or explore public stories to fill your grimoire.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Create')}
              style={[styles.loginBtn, { backgroundColor: theme.gold, borderColor: theme.gold }]}
            >
              <Ionicons name="hammer-outline" size={16} color={theme.bg} style={{ marginRight: 6 }} />
              <Text style={[styles.loginBtnText, { color: theme.bg, fontFamily: fontFamilies.display }]}>
                Forge New Saga
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  titleUnderline: {
    width: 30,
    height: 1,
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 2,
    padding: 10,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 2,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  itemAuthor: {
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  chapterBadge: {
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  chapterBadgeText: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  arrowIcon: {
    paddingLeft: 8,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 14,
  },
  emptySub: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
  },
  loginBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
