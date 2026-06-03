import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fontFamilies, FONTS_LIST } from '../theme/fonts';
import { THEME_LIST, themes } from '../theme/colors';

const LINE_HEIGHTS = [
  { id: 'compact',  label: 'Compact' },
  { id: 'normal',   label: 'Normal' },
  { id: 'relaxed',  label: 'Relaxed' },
  { id: 'spacious', label: 'Spacious' },
];

const WIDTHS = [
  { id: 'narrow',   label: 'Narrow',   icon: 'resize' },
  { id: 'standard', label: 'Standard', icon: 'contract' },
  { id: 'wide',     label: 'Wide',     icon: 'expand' },
  { id: 'full',     label: 'Full',     icon: 'scan' },
];

export default function ReaderSettings({ open, onClose }) {
  const {
    themeName,
    theme,
    setTheme,
    reading,
    updateReading,
    incrementFontSize,
    decrementFontSize,
  } = useTheme();

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Click outside to close */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Settings Panel */}
        <View style={[styles.panel, { backgroundColor: theme.bg2, borderTopColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
                Reading Preferences
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.muted }]}>
                Personalize your experience
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { borderColor: theme.border }]}>
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
            {/* Themes */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                Theme
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

            {/* Fonts */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                Font
              </Text>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontRow}>
                {FONTS_LIST.map((f) => {
                  const isActive = reading.fontFamily === f.id;
                  return (
                    <TouchableOpacity
                      key={f.id}
                      onPress={() => updateReading({ fontFamily: f.id })}
                      style={[
                        styles.fontOption,
                        {
                          backgroundColor: isActive ? theme.bg4 : theme.bg3,
                          borderColor: isActive ? theme.accent : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.fontPreviewText,
                          {
                            color: theme.text,
                            fontFamily: f.family,
                            fontSize: f.id === 'dancing' ? 26 : 24,
                          },
                        ]}
                      >
                        {f.id === 'dancing' ? 'The' : 'Aa'}
                      </Text>
                      <Text style={[styles.fontLabel, { color: isActive ? theme.accent : theme.text2, fontFamily: fontFamilies.display }]}>
                        {f.label}
                      </Text>
                      <Text style={[styles.fontDesc, { color: theme.faint }]}>
                        {f.desc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Font Size */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                Text Size
              </Text>
              <View style={styles.fontSizeControls}>
                <TouchableOpacity
                  disabled={reading.fontSize <= 14}
                  onPress={decrementFontSize}
                  style={[styles.sizeBtn, { borderColor: theme.border, opacity: reading.fontSize <= 14 ? 0.3 : 1 }]}
                >
                  <Text style={[styles.sizeBtnText, { color: theme.text }]}>A-</Text>
                </TouchableOpacity>
                <View style={styles.sizeIndicator}>
                  <Text style={[styles.sizeVal, { color: theme.text }]}>{reading.fontSize}px</Text>
                  <Text style={[styles.sizeLabel, { color: theme.muted, fontFamily: fontFamilies.display }]}>SIZE</Text>
                </View>
                <TouchableOpacity
                  disabled={reading.fontSize >= 28}
                  onPress={incrementFontSize}
                  style={[styles.sizeBtn, { borderColor: theme.border, opacity: reading.fontSize >= 28 ? 0.3 : 1 }]}
                >
                  <Text style={[styles.sizeBtnText, { color: theme.text }]}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Line Spacing */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                Line Spacing
              </Text>
              <View style={styles.pillContainer}>
                {LINE_HEIGHTS.map((lh) => {
                  const isActive = reading.lineHeight === lh.id;
                  return (
                    <TouchableOpacity
                      key={lh.id}
                      onPress={() => updateReading({ lineHeight: lh.id })}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: isActive ? theme.accent : theme.bg3,
                          borderColor: isActive ? theme.accent : theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.pillText, { color: isActive ? '#fff' : theme.muted, fontFamily: fontFamilies.display }]}>
                        {lh.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Reading Width */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                Reading Width
              </Text>
              <View style={styles.pillContainer}>
                {WIDTHS.map((w) => {
                  const isActive = reading.width === w.id;
                  return (
                    <TouchableOpacity
                      key={w.id}
                      onPress={() => updateReading({ width: w.id })}
                      style={[
                        styles.pill,
                        {
                          backgroundColor: isActive ? theme.accent : theme.bg3,
                          borderColor: isActive ? theme.accent : theme.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name={w.icon}
                        size={12}
                        color={isActive ? '#fff' : theme.muted}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.pillText, { color: isActive ? '#fff' : theme.muted, fontFamily: fontFamilies.display }]}>
                        {w.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Text Alignment */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                Text Alignment
              </Text>
              <View style={styles.pillContainer}>
                <TouchableOpacity
                  onPress={() => updateReading({ alignment: 'left' })}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: reading.alignment === 'left' ? theme.accent : theme.bg3,
                      borderColor: reading.alignment === 'left' ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Ionicons name="text-outline" size={14} color={reading.alignment === 'left' ? '#fff' : theme.muted} />
                  <Text style={[styles.pillText, { color: reading.alignment === 'left' ? '#fff' : theme.muted, fontFamily: fontFamilies.display, marginLeft: 4 }]}>
                    Left
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => updateReading({ alignment: 'justify' })}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: reading.alignment === 'justify' ? theme.accent : theme.bg3,
                      borderColor: reading.alignment === 'justify' ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Ionicons name="menu" size={14} color={reading.alignment === 'justify' ? '#fff' : theme.muted} />
                  <Text style={[styles.pillText, { color: reading.alignment === 'justify' ? '#fff' : theme.muted, fontFamily: fontFamilies.display, marginLeft: 4 }]}>
                    Justified
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    maxHeight: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 4,
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
  fontRow: {
    paddingVertical: 4,
    gap: 8,
  },
  fontOption: {
    width: 110,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  fontPreviewText: {
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 4,
  },
  fontLabel: {
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  fontDesc: {
    fontSize: 7,
    textAlign: 'center',
    marginTop: 2,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  sizeBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sizeIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  sizeVal: {
    fontSize: 18,
    fontWeight: '700',
  },
  sizeLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
