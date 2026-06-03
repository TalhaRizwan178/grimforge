import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fontFamilies } from '../theme/fonts';
import NovelCard from '../components/NovelCard';
import LoadingForge from '../components/LoadingForge';
import PulsingFlame from '../components/PulsingFlame';
import api from '../api/axios';

const GENRES = ['All', 'Fantasy', 'Horror', 'Mystery', 'Thriller', 'Romance', 'Sci-Fi', 'Historical', 'Dark'];

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const flatListRef = useRef(null);

  const fetchNovels = async (currentPage, isRefresh = false) => {
    try {
      const genreParam = selectedGenre === 'All' ? '' : selectedGenre;
      const res = await api.get('/novels', {
        params: {
          genre: genreParam,
          search: search.trim() || undefined,
          page: currentPage,
          limit: 12,
        },
      });

      const newNovels = res.data;
      if (isRefresh || currentPage === 1) {
        setNovels(newNovels);
      } else {
        setNovels((prev) => [...prev, ...newNovels]);
      }
      setHasMore(newNovels.length === 12);
    } catch (err) {
      console.warn('Failed to load novels', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchNovels(1);
  }, [selectedGenre, search]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchNovels(1, true);
  }, [selectedGenre, search]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNovels(nextPage);
    }
  };

  const clearSearch = () => {
    setSearch('');
  };

  const handleBrowsePress = () => {
    // Scroll past the hero section directly to grimoire list
    flatListRef.current?.scrollToOffset({ offset: 320, animated: true });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Hero Section */}
      <View style={[styles.hero, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
        <PulsingFlame
          size={48}
          color={theme.accent}
          glowColor={theme.accentD || theme.accent}
          style={styles.heroIcon}
        />
        <Text style={[styles.heroTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
          WHERE DARK STORIES{"\n"}<Text style={{ color: theme.accent }}>ARE BORN</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { color: theme.muted }]}>
          Forge your own tale, chapter by chapter. Read what others have begun, then write your own path through the darkness. Every reader, their own story.
        </Text>

        {/* Action Button Group */}
        <View style={styles.heroActionGroup}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Create')}
            style={[styles.heroPrimaryBtn, { backgroundColor: theme.accent, borderColor: theme.accent }]}
          >
            <Ionicons name="hammer-outline" size={13} color="#fff" style={{ marginRight: 6 }} />
            <Text style={[styles.heroBtnText, { color: '#fff', fontFamily: fontFamilies.display }]}>
              Begin Your Tale
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBrowsePress}
            style={[styles.heroSecondaryBtn, { borderColor: theme.border, backgroundColor: theme.bg3 }]}
          >
            <Ionicons name="book-outline" size={13} color={theme.text} style={{ marginRight: 6 }} />
            <Text style={[styles.heroBtnText, { color: theme.text, fontFamily: fontFamilies.display }]}>
              Browse Stories
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={[styles.searchWrapper, { backgroundColor: theme.bg3, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={16} color={theme.muted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search chronicles..."
          placeholderTextColor={theme.faint}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={16} color={theme.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Genre Filter Horizontal Row */}
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genreScroll}
      >
        {GENRES.map((g) => {
          const isActive = selectedGenre === g;
          return (
            <TouchableOpacity
              key={g}
              activeOpacity={0.8}
              onPress={() => setSelectedGenre(g)}
              style={[
                styles.genrePill,
                {
                  backgroundColor: isActive ? theme.accent : 'transparent',
                  borderColor: isActive ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.genreText,
                  {
                    color: isActive ? '#fff' : theme.muted,
                    fontFamily: fontFamilies.display,
                  },
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Section Divider */}
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
          Grimoire Chronicles
        </Text>
        <View style={[styles.titleUnderline, { backgroundColor: theme.accent }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.bg }]}>
      {loading && page === 1 ? (
        <LoadingForge message="Forging grimoire..." fullPage={true} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={novels}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <NovelCard novel={item} />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
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
              <Ionicons name="journal-outline" size={48} color={theme.faint} />
              <Text style={[styles.emptyText, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                No Chronicles Found
              </Text>
              <Text style={[styles.emptySub, { color: theme.faint }]}>
                No stories match your criteria. Forge one of your own!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    padding: 16,
  },
  hero: {
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  heroIcon: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 24,
  },
  heroSubtitle: {
    fontSize: 10.5,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  heroActionGroup: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: 'center',
    borderRadius: 2,
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    alignItems: 'center',
    borderRadius: 2,
  },
  heroBtnText: {
    fontSize: 9.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  genreScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  genrePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionTitleRow: {
    position: 'relative',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  titleUnderline: {
    width: 40,
    height: 1,
    marginTop: 8,
  },
  cardContainer: {
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
});
