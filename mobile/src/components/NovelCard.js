import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fontFamilies } from '../theme/fonts';
import { GENRE_COLORS } from '../theme/colors';

export default function NovelCard({ novel }) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [imgError, setImgError] = useState(false);

  const gc = GENRE_COLORS[novel.genre] || { color: theme.muted, bg: theme.bg4 };

  const handlePress = () => {
    navigation.navigate('NovelDetail', { id: novel.id });
  };

  const fallbackUri = `https://picsum.photos/seed/${novel.id}/800/450`;

  const cleanThumbnail = (url) => {
    if (!url) return null;
    try {
      const u = new URL(url);
      u.searchParams.delete('nologo');
      u.searchParams.delete('enhance');
      return u.toString();
    } catch {
      return url;
    }
  };

  const imageUri = imgError || !novel.thumbnail_url ? fallbackUri : cleanThumbnail(novel.thumbnail_url);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: theme.bg3,
          borderColor: theme.border,
        },
      ]}
    >
      {/* Image container with genre tag overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
        {/* Shadow Overlay */}
        <View style={styles.shadowOverlay} />
        
        {/* Badge Overlay */}
        <View style={[styles.badge, { backgroundColor: gc.bg }]}>
          <Text style={[styles.badgeText, { color: gc.color }]}>
            {novel.genre}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text
          numberOfLines={2}
          style={[styles.title, { color: theme.text, fontFamily: fontFamilies.display }]}
        >
          {novel.title}
        </Text>
        
        <Text style={[styles.creator, { color: theme.faint, fontFamily: fontFamilies.display }]}>
          by {novel.creator?.username || 'Unknown'}
        </Text>

        <Text
          numberOfLines={2}
          style={[styles.plot, { color: theme.text2 }]}
        >
          {novel.plot}
        </Text>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <Text style={[styles.toneText, { color: theme.faint, fontFamily: fontFamilies.display }]}>
            {novel.tone}
          </Text>
          
          {novel.reader_count > 0 && (
            <View style={styles.readers}>
              <Ionicons name="book-outline" size={12} color={theme.faint} />
              <Text style={[styles.readersText, { color: theme.faint }]}>
                {novel.reader_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  shadowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 0,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: fontFamilies.display,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  creator: {
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  plot: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toneText: {
    fontSize: 8,
    letterSpacing: 1,
    flex: 1,
  },
  readers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readersText: {
    fontSize: 10,
  },
});
