import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, ActivityIndicator, Alert, Dimensions, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fontFamilies, getReaderFontFamily, LINE_HEIGHTS, WIDTHS } from '../theme/fonts';
import { THEME_LIST, themes } from '../theme/colors';
import ReaderSettings from '../components/ReaderSettings';
import ChapterForgeModal from '../components/ChapterForgeModal';
import LoadingForge from '../components/LoadingForge';
import PulsingFlame from '../components/PulsingFlame';
import api from '../api/axios';
import { leaveReader } from '../navigation/navigationHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ReaderScreen({ route, navigation }) {
  const { id } = route.params;
  const { theme, themeName, setTheme, reading, incrementFontSize, decrementFontSize } = useTheme();
  const insets = useSafeAreaInsets();

  // Story state
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0); // 0-based index
  const [storyContext, setStoryContext] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [forging, setForging] = useState(false);
  const [menuVisible, setMenuVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [forgeOpen, setForgeOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  // Animation values
  const topBarY = useRef(new Animated.Value(0)).current;
  const bottomBarY = useRef(new Animated.Value(0)).current;
  const sidebarX = useRef(new Animated.Value(-280)).current;
  const lastScrollY = useRef(0);
  const scrollHideTimer = useRef(null);

  const scrollRef = useRef(null);

  useEffect(() => {
    fetchStoryProgress();
  }, [id]);

  const fetchStoryProgress = async () => {
    try {
      const detailsRes = await api.get(`/novels/${id}`);
      setNovel(detailsRes.data);
      
      const progressRes = await api.get(`/novels/${id}/my-progress`);
      const list = progressRes.data.chapters || [];
      setChapters(list);
      setStoryContext(progressRes.data.context);
      
      // Auto set active chapter to the latest one
      if (list.length > 0) {
        setActiveChapterIndex(list.length - 1);
      }
    } catch (err) {
      console.warn('Failed to load reader progress', err);
      Alert.alert('Error', 'Failed to retrieve chapter files.');
      leaveReader(navigation, id);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    leaveReader(navigation, id);
  };

  const handleToggleMenu = () => {
    const nextState = !menuVisible;
    setMenuVisible(nextState);

    Animated.parallel([
      Animated.timing(topBarY, {
        toValue: nextState ? 0 : -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(bottomBarY, {
        toValue: nextState ? 0 : 80,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleSidebar = (open) => {
    setSidebarOpen(open);
    Animated.timing(sidebarX, {
      toValue: open ? 0 : -280,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const yOffset = contentOffset.y;
    const scrollable = contentSize.height - layoutMeasurement.height;
    setReadProgress(scrollable > 0 ? Math.min(100, (yOffset / scrollable) * 100) : 0);

    if (yOffset > 300 && !showScrollTop) setShowScrollTop(true);
    else if (yOffset <= 300 && showScrollTop) setShowScrollTop(false);

    const diff = yOffset - lastScrollY.current;
    if (Math.abs(diff) > 8) {
      const showBars = diff < 0 || yOffset < 60;
      if (showBars !== menuVisible) {
        setMenuVisible(showBars);
        Animated.parallel([
          Animated.timing(topBarY, { toValue: showBars ? 0 : -110, duration: 250, useNativeDriver: true }),
          Animated.timing(bottomBarY, { toValue: showBars ? 0 : 80, duration: 250, useNativeDriver: true }),
        ]).start();
      }
      lastScrollY.current = yOffset;
    }

    clearTimeout(scrollHideTimer.current);
    scrollHideTimer.current = setTimeout(() => {
      if (!menuVisible) {
        setMenuVisible(true);
        Animated.parallel([
          Animated.timing(topBarY, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.timing(bottomBarY, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start();
      }
    }, 2000);
  };

  const handleSelectChapter = (idx) => {
    setActiveChapterIndex(idx);
    toggleSidebar(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleForgeNext = async (direction) => {
    setForging(true);
    try {
      const res = await api.post(`/novels/${id}/chapters`, {
        userDirection: direction,
      });
      const newChapter = res.data;
      setChapters((prev) => [...prev, newChapter]);
      setActiveChapterIndex(chapters.length); // will be new index
      
      // reload details for context update
      const progressRes = await api.get(`/novels/${id}/my-progress`);
      setStoryContext(progressRes.data.context);
      
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err) {
      Alert.alert('Forge Failed', err.response?.data?.error || 'Failed to generate chapter.');
    } finally {
      setForging(false);
    }
  };

  const handleDeleteFromActive = () => {
    const targetChapter = chapters[activeChapterIndex];
    if (!targetChapter || targetChapter.chapter_number <= 1) {
      Alert.alert('Error', 'Cannot delete Chapter 1');
      return;
    }

    Alert.alert(
      'Revert Story Line',
      `This will destroy Chapter ${targetChapter.chapter_number} and all chapters generated after it. Your story line will revert to Chapter ${targetChapter.chapter_number - 1}. Are you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revert',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.delete(`/novels/${id}/chapters/from/${targetChapter.chapter_number}`);
              
              // Refetch progress
              const progressRes = await api.get(`/novels/${id}/my-progress`);
              const list = progressRes.data.chapters || [];
              setChapters(list);
              setStoryContext(progressRes.data.context);
              setActiveChapterIndex(list.length - 1);
              
              scrollRef.current?.scrollTo({ y: 0, animated: false });
            } catch (err) {
              Alert.alert('Error', 'Failed to revert chapter.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    const activeCh = chapters[activeChapterIndex];
    if (!activeCh) return;
    try {
      const shareText = `Read "${novel?.title}" - Chapter ${activeCh.chapter_number}\n\n${activeCh.content.replace(/<[^>]*>/g, '').substring(0, 500)}...\n\nRead more on GrimForge!`;
      await Share.share({ message: shareText });
    } catch (err) {
      console.warn('Share error', err);
    }
  };

  if (loading) {
    return <LoadingForge message="Summoning scroll..." fullPage={true} />;
  }

  if (forging) {
    return (
      <View style={[styles.forgingContainer, { backgroundColor: theme.bg }]}>
        <LoadingForge message="Forging story line..." />
        <Text style={[styles.forgingSubText, { color: theme.muted }]}>
          The scribe is currently plotting your decisions and writing the next pages. This takes 10-30 seconds.
        </Text>
      </View>
    );
  }

  const activeChapter = chapters[activeChapterIndex];
  const isLatest = activeChapterIndex === chapters.length - 1;

  // Reading style variables
  const chosenFontFamily = getReaderFontFamily(reading.fontFamily);
  const chosenLineHeight = LINE_HEIGHTS[reading.lineHeight] || LINE_HEIGHTS.normal;
  const chosenWidth = WIDTHS[reading.width] || WIDTHS.standard;
  const chosenAlign = reading.alignment === 'justify' ? 'justify' : 'left';
  const fontSize = reading.fontSize || 19;
  const lineHeightPx = fontSize * chosenLineHeight;
  const textIndent = fontSize * 2;
  const dropCapSize = fontSize * 4.2;
  const dropCapLineHeight = dropCapSize * 0.82;

  const parseParagraphs = (raw) => {
    if (!raw) return [];
    const text = raw
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    let paras = text.split(/\n\n+/).map((p) => p.replace(/\n/g, ' ').trim()).filter((p) => p.length > 0);
    if (paras.length === 0) {
      paras = text.split(/\n/).map((p) => p.trim()).filter((p) => p.length > 0);
    }
    return paras;
  };

  const paragraphs = parseParagraphs(activeChapter?.content);
  const wordCount = activeChapter?.content
    ? activeChapter.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const paragraphStyle = {
    color: theme.readerText,
    fontFamily: chosenFontFamily,
    fontSize,
    lineHeight: lineHeightPx,
    textAlign: chosenAlign,
    marginBottom: fontSize * 1.4,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.readerBg }]}>
      {/* Reading progress */}
      <View style={[styles.progressTrack, { top: insets.top }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${readProgress}%`, backgroundColor: theme.accent },
          ]}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollBody,
          { paddingTop: 100 + insets.top, paddingBottom: 90 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity activeOpacity={1} onPress={handleToggleMenu} style={styles.textTapWrapper}>
          {activeChapter ? (
            <View style={[styles.readingWrapper, { width: chosenWidth, maxWidth: SCREEN_WIDTH }]}>
              <View style={[styles.chapterHeader, { borderBottomColor: theme.border }]}>
                <Text style={[styles.chapterMeta, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                  {novel?.genre} · {novel?.tone}
                </Text>
                <Text style={[styles.chapterTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
                  {novel?.title}
                </Text>
                <Text style={[styles.chapterNum, { color: theme.accent, fontFamily: fontFamilies.display }]}>
                  CHAPTER {activeChapter.chapter_number}
                  {activeChapter.chapter_number > 1 ? ' · YOUR BRANCH' : ''}
                </Text>
                <Text style={[styles.chapterStats, { color: theme.faint }]}>
                  {readTime} min read · {wordCount.toLocaleString()} words
                </Text>
                <Text style={[styles.swordOrnament, { color: theme.accent }]}>⚔</Text>
              </View>

              <View style={styles.chapterContent}>
                {paragraphs.map((p, idx) => {
                  const isFirst = idx === 0;
                  if (isFirst && p.length > 0) {
                    const firstLetter = p.charAt(0);
                    const remainingText = p.slice(1);
                    return (
                      <View
                        key={idx}
                        style={[styles.dropCapRow, { marginBottom: fontSize * 1.4 }]}
                      >
                        <Text
                          style={[
                            styles.dropCapLetter,
                            {
                              fontFamily: fontFamilies.display,
                              fontSize: dropCapSize,
                              lineHeight: dropCapLineHeight,
                              color: theme.accent,
                              marginRight: fontSize * 0.35,
                              marginTop: fontSize * 0.05,
                            },
                          ]}
                        >
                          {firstLetter}
                        </Text>
                        <Text
                          style={[
                            paragraphStyle,
                            styles.dropCapBody,
                            { marginBottom: 0 },
                          ]}
                        >
                          {remainingText}
                        </Text>
                      </View>
                    );
                  }

                  return (
                    <Text
                      key={idx}
                      style={[
                        paragraphStyle,
                        { textIndent },
                      ]}
                    >
                      {p}
                    </Text>
                  );
                })}
              </View>

              <Text style={[styles.endOrnament, { color: theme.faint }]}>— ✦ —</Text>

              {isLatest && (
                <View style={[styles.forgeCta, { borderTopColor: theme.border }]}>
                  <PulsingFlame size={40} color={theme.accent} glowColor={theme.accentD || theme.accent} style={styles.ctaIcon} />
                  <Text style={[styles.ctaTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
                    THE CHAPTER ENDS HERE
                  </Text>
                  <Text style={[styles.ctaSubtitle, { color: theme.muted }]}>
                    The story is hungry for more. How shall it continue?
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setForgeOpen(true)}
                    style={[styles.forgeBtn, { backgroundColor: theme.accent, borderColor: theme.accent }]}
                  >
                    <Ionicons name="hammer" size={14} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={[styles.forgeBtnText, { fontFamily: fontFamilies.display }]}>
                      Forge Chapter {activeChapter.chapter_number + 1}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noChapterContainer}>
              <Text style={{ color: theme.muted }}>No active chapter</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Reader top bar with quick theme swatches */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: theme.navBg,
            borderBottomColor: theme.border,
            transform: [{ translateY: topBarY }],
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={handleGoBack} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleBlock}>
            <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
              {novel?.title}
            </Text>
            {activeChapter && (
              <Text style={[styles.headerSubtitle, { color: theme.muted }]}>
                Ch. {activeChapter.chapter_number} · {readTime} min
              </Text>
            )}
          </View>
          <View style={styles.headerRightGroup}>
            <TouchableOpacity onPress={decrementFontSize} style={styles.navBtnSmall}>
              <Text style={{ color: theme.muted, fontSize: 13, fontWeight: '700' }}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={incrementFontSize} style={styles.navBtnSmall}>
              <Text style={{ color: theme.muted, fontSize: 15, fontWeight: '700' }}>A+</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSettingsOpen(true)} style={styles.navBtn}>
              <Ionicons name="options-outline" size={20} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.themeStrip}
        >
          {THEME_LIST.map((t) => {
            const isActive = themeName === t.id;
            const swatchTheme = themes[t.id];
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTheme(t.id)}
                activeOpacity={0.8}
                style={[
                  styles.themeSwatch,
                  {
                    backgroundColor: swatchTheme.readerBg,
                    borderColor: isActive ? swatchTheme.accent : swatchTheme.border,
                  },
                  isActive && { borderWidth: 2 },
                ]}
              >
                <View style={[styles.themeSwatchDot, { backgroundColor: swatchTheme.accent }]} />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.themeSwatchLabel,
                    { color: swatchTheme.readerText, fontFamily: fontFamilies.display },
                  ]}
                >
                  {t.name}
                </Text>
                {isActive && (
                  <Ionicons name="checkmark-circle" size={12} color={swatchTheme.accent} style={styles.themeCheck} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Floating Footer */}
      <Animated.View
        style={[
          styles.footer,
          {
            height: 50 + insets.bottom,
            paddingBottom: insets.bottom,
            backgroundColor: theme.navBg,
            borderTopColor: theme.border,
            transform: [{ translateY: bottomBarY }],
          },
        ]}
      >
        <TouchableOpacity onPress={() => toggleSidebar(true)} style={styles.footerBtn}>
          <Ionicons name="menu-outline" size={20} color={theme.muted} />
        </TouchableOpacity>

        {activeChapter && activeChapter.chapter_number > 1 && (
          <TouchableOpacity onPress={handleDeleteFromActive} style={styles.footerBtn}>
            <Ionicons name="trash-outline" size={18} color={theme.accent} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleShare} style={styles.footerBtn}>
          <Ionicons name="share-social-outline" size={18} color={theme.muted} />
        </TouchableOpacity>

        {/* Prev & Next Controls */}
        <View style={styles.navigationControls}>
          <TouchableOpacity
            disabled={activeChapterIndex === 0}
            onPress={() => handleSelectChapter(activeChapterIndex - 1)}
            style={[styles.navArrow, { opacity: activeChapterIndex === 0 ? 0.3 : 1 }]}
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.pageIndicator, { color: theme.muted, fontFamily: fontFamilies.display }]}>
            {activeChapterIndex + 1} / {chapters.length}
          </Text>
          <TouchableOpacity
            disabled={isLatest}
            onPress={() => handleSelectChapter(activeChapterIndex + 1)}
            style={[styles.navArrow, { opacity: isLatest ? 0.3 : 1 }]}
          >
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Sidebar Drawer Modal */}
      {sidebarOpen && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity style={styles.sidebarBackdrop} activeOpacity={1} onPress={() => toggleSidebar(false)} />
          <Animated.View
            style={[
              styles.sidebarDrawer,
              {
                paddingTop: 10 + insets.top,
                backgroundColor: theme.bg2,
                borderRightColor: theme.border,
                transform: [{ translateX: sidebarX }],
              },
            ]}
          >
            <View style={[styles.sidebarHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.sidebarTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
                Chapters Progress
              </Text>
              <TouchableOpacity onPress={() => toggleSidebar(false)}>
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.sidebarScrollContent}>
              {chapters.map((ch, i) => {
                const isActive = activeChapterIndex === i;
                return (
                  <TouchableOpacity
                    key={ch.id}
                    onPress={() => handleSelectChapter(i)}
                    style={[
                      styles.sidebarItem,
                      {
                        backgroundColor: isActive ? theme.bg4 : 'transparent',
                        borderBottomColor: theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sidebarItemNum,
                        { color: isActive ? theme.accent : theme.muted, fontFamily: fontFamilies.display },
                      ]}
                    >
                      CH {ch.chapter_number}
                    </Text>
                    <Text numberOfLines={1} style={[styles.sidebarItemTitle, { color: theme.text }]}>
                      Chapter {ch.chapter_number}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      )}

      {/* Scroll to Top FAB */}
      {showScrollTop && (
        <TouchableOpacity
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          style={[styles.fab, { backgroundColor: theme.accent }]}
        >
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Settings Modal Sheet */}
      <ReaderSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Forge Choice Modal */}
      {forgeOpen && activeChapter && (
        <ChapterForgeModal
          novelId={id}
          nextChapterNum={activeChapter.chapter_number + 1}
          onGenerate={handleForgeNext}
          onClose={() => setForgeOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    zIndex: 1100,
    backgroundColor: 'transparent',
  },
  progressFill: {
    height: 3,
  },
  scrollBody: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textTapWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  readingWrapper: {
    alignSelf: 'center',
  },
  chapterHeader: {
    alignItems: 'center',
    paddingBottom: 28,
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  chapterMeta: {
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  chapterTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  chapterNum: {
    fontSize: 9,
    letterSpacing: 2.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  chapterStats: {
    fontSize: 11,
    marginTop: 4,
  },
  swordOrnament: {
    fontSize: 16,
    marginTop: 20,
  },
  chapterContent: {
    width: '100%',
  },
  dropCapRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  dropCapLetter: {
    fontWeight: '700',
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'top' } : {}),
  },
  dropCapBody: {
    flex: 1,
    flexShrink: 1,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'top' } : {}),
  },
  endOrnament: {
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 8,
    marginVertical: 36,
  },
  forgeCta: {
    borderTopWidth: 1,
    paddingTop: 40,
    marginTop: 20,
    alignItems: 'center',
  },
  ctaIcon: {
    marginBottom: 12,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  ctaSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  forgeBtn: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  forgeBtnText: {
    color: '#fff',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  noChapterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    zIndex: 1000,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 48,
  },
  headerTitleBlock: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 4,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeStrip: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
    flexDirection: 'row',
  },
  themeSwatch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
    minWidth: 88,
  },
  themeSwatchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  themeSwatchLabel: {
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  themeCheck: {
    marginLeft: 4,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnSmall: {
    width: 28,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  footerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navArrow: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicator: {
    fontSize: 10,
    letterSpacing: 1,
    minWidth: 40,
    textAlign: 'center',
  },
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 1050,
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebarDrawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 260,
    borderRightWidth: 1,
    paddingTop: 40,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sidebarScrollContent: {
    paddingVertical: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  sidebarItemNum: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginRight: 10,
  },
  sidebarItemTitle: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  forgingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  forgingSubText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: 10,
  },
});
