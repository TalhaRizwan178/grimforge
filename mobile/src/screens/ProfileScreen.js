import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fontFamilies, FONTS_LIST, LINE_HEIGHTS, WIDTHS } from '../theme/fonts';
import { THEME_LIST, themes } from '../theme/colors';
import ReaderSettings from '../components/ReaderSettings';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const {
    themeName,
    theme,
    setTheme,
    reading,
    updateReading,
    incrementFontSize,
    decrementFontSize,
  } = useTheme();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to exit the forge?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const currentTheme = themes[themeName] || themes.midnight;

  // Render Preferences Selection (identical to reader settings but in-page!)
  const renderPreferenceLivePreview = () => {
    const chosenFontFamily = fontFamilies[reading.fontFamily] || fontFamilies.crimson;
    const chosenLineHeight = LINE_HEIGHTS[reading.lineHeight] || 1.65;
    const chosenWidth = WIDTHS[reading.width] || '90%';
    const chosenAlign = reading.alignment || 'left';

    return (
      <View style={[styles.previewSection, { borderTopColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
          Live Typography Preview
        </Text>
        
        {/* Actual Preview Box */}
        <View style={[styles.previewBox, { backgroundColor: theme.readerBg, borderColor: theme.border }]}>
          <Text
            style={{
              color: theme.readerText,
              fontFamily: chosenFontFamily,
              fontSize: reading.fontSize,
              lineHeight: reading.fontSize * chosenLineHeight,
              textAlign: chosenAlign,
            }}
          >
            The dragon curled tightly around the ancient grimoire, its scales reflecting the crimson embers of the forge. Liliana stepped closer, her heart hammering against her ribs...
          </Text>
        </View>

        {/* Small in-page font size controls */}
        <View style={styles.preferenceRow}>
          <Text style={[styles.preferenceLabel, { color: theme.muted, fontFamily: fontFamilies.display }]}>
            Text Size ({reading.fontSize}px)
          </Text>
          <View style={styles.sizeControlBtnGroup}>
            <TouchableOpacity onPress={decrementFontSize} style={[styles.sizeBtn, { borderColor: theme.border }]}>
              <Text style={{ color: theme.text }}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={incrementFontSize} style={[styles.sizeBtn, { borderColor: theme.border }]}>
              <Text style={{ color: theme.text }}>A+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
          Sign in to access your author profile, customize themes, and manage your libraries.
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

  const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Header Profile Section */}
      <View style={[styles.profileHeaderCard, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.accentD, borderColor: theme.accent }]}>
          <Text style={[styles.avatarText, { fontFamily: fontFamilies.display }]}>
            {initial}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.username, { color: theme.text, fontFamily: fontFamilies.display }]}>
            {user.username}
          </Text>
          <Text style={[styles.email, { color: theme.muted }]}>
            {user.email}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.badgeBg, borderColor: theme.border }]}>
            <Text style={[styles.roleBadgeText, { color: theme.badgeColor, fontFamily: fontFamilies.display }]}>
              Scribe Creator
            </Text>
          </View>
        </View>
      </View>

      {/* Global Themes Swatch Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
          App Interface Theme
        </Text>
        <View style={styles.swatchGrid}>
          {THEME_LIST.map((t) => {
            const isActive = themeName === t.id;
            const targetTheme = themes[t.id];
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTheme(t.id)}
                style={[
                  styles.swatch,
                  {
                    backgroundColor: targetTheme.bg,
                    borderColor: isActive ? targetTheme.accent : targetTheme.border,
                  },
                ]}
              >
                <Text style={[styles.swatchText, { color: targetTheme.text, fontFamily: fontFamilies.display }]}>
                  {t.name}
                </Text>
                {isActive && (
                  <View style={styles.swatchCheck}>
                    <Ionicons name="checkmark-circle" size={14} color={targetTheme.accent} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Live Preview / Preferences Section */}
      {renderPreferenceLivePreview()}

      {/* Logout Row */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleLogout}
        style={[styles.logoutBtn, { borderColor: theme.accent }]}
      >
        <Ionicons name="log-out-outline" size={16} color={theme.accent} style={{ marginRight: 6 }} />
        <Text style={[styles.logoutBtnText, { color: theme.accent, fontFamily: fontFamilies.display }]}>
          Leave the Forge
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  email: {
    fontSize: 11,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 7,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatch: {
    width: '31%',
    aspectRatio: 16 / 9,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  swatchText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  swatchCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  previewSection: {
    borderTopWidth: 1,
    paddingTop: 24,
    marginBottom: 24,
  },
  previewBox: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 2,
    marginBottom: 14,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sizeControlBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeBtn: {
    width: 38,
    height: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
    marginTop: 10,
  },
  logoutBtnText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
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
