import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { fontFamilies } from '../theme/fonts';
import LoadingForge from '../components/LoadingForge';
import api from '../api/axios';
import { openReaderAfterForge } from '../navigation/navigationHelpers';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_GENRES = ['Fantasy', 'Horror', 'Mystery', 'Thriller', 'Romance', 'Sci-Fi', 'Historical', 'Dark', 'Action', 'Adventure', 'Comedy', 'Drama', 'Supernatural', 'Crime', 'Dystopian', 'Psychological', 'Noir'];
const TONES = [
  'Dark & Gritty', 'Gothic', 'Atmospheric', 'Epic', 'Suspenseful', 'Melancholic', 'Lyrical',
  'Humorous', 'Light-hearted', 'Action-packed', 'Adventurous', 'Romantic', 'Dramatic', 'Tense'
];
const LENGTHS = [
  { label: 'Short', sub: '~800w', value: 800 },
  { label: 'Standard', sub: '~1500w', value: 1500 },
  { label: 'Long', sub: '~2500w', value: 2500 },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  titleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 9,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
    borderRadius: 2,
  },
  textarea: {
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    borderRadius: 2,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inspirationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inspirationLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inspirationToggleText: {
    fontSize: 10,
    letterSpacing: 1.5,
  },
  inspirationList: {
    borderWidth: 1,
    borderTopWidth: 0,
    maxHeight: 250,
  },
  inspirationItem: {
    padding: 14,
    borderBottomWidth: 1,
  },
  inspirationTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  inspirationPlot: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 14,
  },
  emptyInspirations: {
    padding: 14,
    fontSize: 12,
    textAlign: 'center',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 9,
    letterSpacing: 1,
  },
  customGenreRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  customGenreInput: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    height: 38,
    borderRadius: 2,
  },
  addCustomBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  lengthContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  lengthPill: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lengthPillText: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  lengthPillSub: {
    fontSize: 9,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    marginTop: 10,
  },
  submitText: {
    color: '#fff',
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingSubtext: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: 10,
  },
});

export default function CreateNovelScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    title: '',
    plot: '',
    genres: [],
    tones: [],
    chapter_length: 1500,
  });
  
  const [customGenres, setCustomGenres] = useState([]);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [publicNovels, setPublicNovels] = useState([]);
  const [showInspiration, setShowInspiration] = useState(false);

  useEffect(() => {
    // Fetch some existing novels to borrow plot prompts from
    api.get('/novels?limit=8')
      .then(res => setPublicNovels(res.data))
      .catch(() => {});
  }, []);

  const toggleInspiration = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowInspiration(!showInspiration);
  };

  const handleToggleGenre = (g) => {
    setForm(p => {
      if (p.genres.includes(g)) return { ...p, genres: p.genres.filter(x => x !== g) };
      if (p.genres.length >= 4) return p;
      return { ...p, genres: [...p.genres, g] };
    });
  };

  const handleToggleTone = (t) => {
    setForm(p => {
      if (p.tones.includes(t)) return { ...p, tones: p.tones.filter(x => x !== t) };
      if (p.tones.length >= 2) return p;
      return { ...p, tones: [...p.tones, t] };
    });
  };

  const addCustomGenre = () => {
    const val = customInput.trim();
    if (!val) return;
    if (form.genres.length >= 4) return;
    const normalised = val.charAt(0).toUpperCase() + val.slice(1);
    if ([...DEFAULT_GENRES, ...customGenres].includes(normalised)) {
      if (!form.genres.includes(normalised)) handleToggleGenre(normalised);
    } else {
      setCustomGenres(p => [...p, normalised]);
      setForm(p => ({ ...p, genres: [...p.genres, normalised] }));
    }
    setCustomInput('');
  };

  const borrowPlot = (novel) => {
    const borrowed = novel.genre ? novel.genre.split(' / ').map(g => g.trim()) : [];
    setForm(p => ({
      ...p,
      plot: novel.plot,
      genres: borrowed,
      tones: novel.tone ? novel.tone.split(' & ') : []
    }));
    toggleInspiration();
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Please login to forge stories');
      navigation.navigate('Auth');
      return;
    }
    if (!form.plot.trim()) {
      setError('The plot cannot be empty');
      return;
    }
    if (form.genres.length === 0) {
      setError('Please select at least one genre');
      return;
    }
    if (form.tones.length === 0) {
      setError('Please select at least one tone');
      return;
    }

    setError('');
    setLoading(true);

    const messages = [
      'Lighting the forge...',
      'Generating your title...',
      'Writing Chapter I...',
      'Mapping the story world...',
      'Almost ready...',
    ];
    let msgIdx = 0;
    setLoadingMsg(messages[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setLoadingMsg(messages[msgIdx]);
    }, 4500);

    try {
      const res = await api.post('/novels', {
        ...form,
        genre: form.genres.join(' / '),
        tone: form.tones.join(' & ')
      });
      clearInterval(interval);
      setLoading(false);
      openReaderAfterForge(navigation, res.data.novel.id);
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.error || 'Failed to forge novel. Try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingWrapper, { backgroundColor: theme.bg }]}>
        <LoadingForge message={loadingMsg} />
        <Text style={[styles.loadingSubtext, { color: theme.muted }]}>
          Your novel is being born from the forge. Chapter I is being written fresh — this takes 15-40 seconds.
        </Text>
        <ActivityIndicator size="small" color={theme.accent} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
      <View style={styles.header}>
        <Ionicons name="hammer" size={40} color={theme.accent} style={styles.headerIcon} />
        <Text style={[styles.title, { color: theme.text, fontFamily: fontFamilies.display }]}>
          Forge a Novel
        </Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>
          Shape the world — let the darkness write the words.
        </Text>
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.badgeBg, borderColor: theme.accent }]}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.badgeColor} style={{ marginRight: 6 }} />
          <Text style={[styles.errorText, { color: theme.badgeColor }]}>{error}</Text>
        </View>
      ) : null}

      {/* Inspiration Block */}
      <View style={styles.section}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleInspiration}
          style={[styles.inspirationToggle, { borderColor: theme.gold }]}
        >
          <View style={styles.inspirationLabelRow}>
            <Ionicons name="bulb-outline" size={16} color={theme.gold} style={{ marginRight: 8 }} />
            <Text style={[styles.inspirationToggleText, { color: theme.gold, fontFamily: fontFamilies.display }]}>
              Borrow From Existing Tales
            </Text>
          </View>
          <Ionicons
            name={showInspiration ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={16}
            color={theme.gold}
          />
        </TouchableOpacity>

        {showInspiration && (
          <View style={[styles.inspirationList, { borderColor: theme.border, backgroundColor: theme.bg2 }]}>
            {publicNovels.length === 0 ? (
              <Text style={[styles.emptyInspirations, { color: theme.faint }]}>
                No novels available to borrow from yet.
              </Text>
            ) : (
              publicNovels.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => borrowPlot(n)}
                  style={[styles.inspirationItem, { borderBottomColor: theme.border }]}
                >
                  <Text style={[styles.inspirationTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
                    {n.title}
                  </Text>
                  <Text numberOfLines={2} style={[styles.inspirationPlot, { color: theme.muted }]}>
                    {n.plot}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>

      {/* Title (Optional) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
          Title (Optional)
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
          placeholder="Leave empty for AI-generated title"
          placeholderTextColor={theme.faint}
          value={form.title}
          onChangeText={(val) => setForm(p => ({ ...p, title: val }))}
        />
      </View>

      {/* Plot Prompt */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
          The Plot / Core Premise *
        </Text>
        <TextInput
          style={[styles.textarea, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
          placeholder="Describe your story core (e.g. 'A rogue alchemist is hunted down for creating an elixir of shadow. She strikes a bargain with a demon executioner...')"
          placeholderTextColor={theme.faint}
          multiline={true}
          numberOfLines={6}
          value={form.plot}
          onChangeText={(val) => setForm(p => ({ ...p, plot: val }))}
        />
      </View>

      {/* Genres Grid */}
      <View style={styles.section}>
        <View style={styles.titleInfoRow}>
          <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
            Genre Selection *
          </Text>
          <Text style={[styles.infoLabel, { color: theme.faint }]}>Max 4 selected</Text>
        </View>

        <View style={styles.tagGrid}>
          {[...DEFAULT_GENRES, ...customGenres].map((g) => {
            const isSelected = form.genres.includes(g);
            return (
              <TouchableOpacity
                key={g}
                activeOpacity={0.8}
                onPress={() => handleToggleGenre(g)}
                style={[
                  styles.tag,
                  {
                    backgroundColor: isSelected ? theme.accent : theme.bg3,
                    borderColor: isSelected ? theme.accent : theme.border,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: isSelected ? '#fff' : theme.muted, fontFamily: fontFamilies.display }]}>
                  {g}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Genre Input */}
        <View style={styles.customGenreRow}>
          <TextInput
            style={[styles.customGenreInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
            placeholder="Add custom genre..."
            placeholderTextColor={theme.faint}
            value={customInput}
            onChangeText={setCustomInput}
          />
          <TouchableOpacity
            onPress={addCustomGenre}
            style={[styles.addCustomBtn, { backgroundColor: theme.gold }]}
          >
            <Ionicons name="add" size={20} color={theme.bg} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tone Selection Grid */}
      <View style={styles.section}>
        <View style={styles.titleInfoRow}>
          <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
            Tone / Mood selection *
          </Text>
          <Text style={[styles.infoLabel, { color: theme.faint }]}>Max 2 selected</Text>
        </View>

        <View style={styles.tagGrid}>
          {TONES.map((t) => {
            const isSelected = form.tones.includes(t);
            return (
              <TouchableOpacity
                key={t}
                activeOpacity={0.8}
                onPress={() => handleToggleTone(t)}
                style={[
                  styles.tag,
                  {
                    backgroundColor: isSelected ? theme.accent : theme.bg3,
                    borderColor: isSelected ? theme.accent : theme.border,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: isSelected ? '#fff' : theme.muted, fontFamily: fontFamilies.display }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Length Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
          Chapter Size Preference
        </Text>
        <View style={styles.lengthContainer}>
          {LENGTHS.map((len) => {
            const isSelected = form.chapter_length === len.value;
            return (
              <TouchableOpacity
                key={len.value}
                activeOpacity={0.8}
                onPress={() => setForm(p => ({ ...p, chapter_length: len.value }))}
                style={[
                  styles.lengthPill,
                  {
                    backgroundColor: isSelected ? theme.accent : theme.bg3,
                    borderColor: isSelected ? theme.accent : theme.border,
                  },
                ]}
              >
                <Text style={[styles.lengthPillText, { color: isSelected ? '#fff' : theme.text, fontFamily: fontFamilies.display }]}>
                  {len.label}
                </Text>
                <Text style={[styles.lengthPillSub, { color: isSelected ? 'rgba(255,255,255,0.7)' : theme.muted }]}>
                  {len.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleSubmit}
        style={[styles.submitBtn, { backgroundColor: theme.accent, borderColor: theme.accent }]}
      >
        <Ionicons name="hammer" size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.submitText, { fontFamily: fontFamilies.display }]}>
          Forge Chapter I
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
