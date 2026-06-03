import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fontFamilies } from '../theme/fonts';
import api from '../api/axios';

export default function ChapterForgeModal({ novelId, nextChapterNum, onGenerate, onClose }) {
  const { theme } = useTheme();
  const [selected, setSelected] = useState(null); // 'natural' | 'branch-0' | 'branch-1' | 'branch-2' | 'custom'
  const [customText, setCustomText] = useState('');
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    setBranchError('');
    setBranches([]);
    setSelected((prev) => (prev?.startsWith('branch') ? null : prev));
    try {
      const res = await api.get(`/novels/${novelId}/chapters/branches`);
      setBranches(res.data.branches || []);
    } catch (err) {
      setBranchError('Failed to generate suggestions.');
    } finally {
      setLoadingBranches(false);
    }
  };

  const canForge =
    selected === 'natural' ||
    (selected === 'custom' && customText.trim().length > 0) ||
    (selected?.startsWith('branch-') && branches.length > 0);

  const handleForge = () => {
    if (!canForge) return;
    if (selected === 'natural') {
      onGenerate(null);
    } else if (selected === 'custom') {
      onGenerate(customText.trim());
    } else if (selected?.startsWith('branch-')) {
      const i = parseInt(selected.split('-')[1]);
      const b = branches[i];
      onGenerate(`${b.title}: ${b.description}`);
    }
    onClose();
  };

  const getOptionStyle = (key) => {
    const isSelected = selected === key;
    return [
      styles.optionBtn,
      {
        backgroundColor: isSelected ? 'rgba(184,34,34,0.12)' : theme.bg3,
        borderColor: isSelected ? theme.accent : theme.border,
      },
    ];
  };

  return (
    <Modal visible={true} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.container, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="hammer" size={16} color={theme.accent} style={{ marginRight: 6 }} />
              <Text style={[styles.headerTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
                Forge Chapter {nextChapterNum}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              Choose how Chapter {nextChapterNum} unfolds — select one option and forge.
            </Text>

            {/* Option 1: Continue Naturally */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelected('natural')}
              style={getOptionStyle('natural')}
            >
              <View style={styles.optionRow}>
                <Ionicons name="arrow-forward-circle" size={32} color={theme.accent} style={{ marginRight: 12 }} />
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
                    Continue Naturally
                  </Text>
                  <Text style={[styles.optionDesc, { color: theme.muted }]}>
                    Let the AI follow the story's momentum — no direction needed.
                  </Text>
                </View>
                {selected === 'natural' && (
                  <Ionicons name="checkmark-circle" size={18} color={theme.accent} />
                )}
              </View>
            </TouchableOpacity>

            {/* AI Story Branches */}
            <View style={[styles.dividerSection, { borderTopColor: theme.border }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleWrapper}>
                  <Ionicons name="git-branch" size={14} color="#8b30c8" style={{ marginRight: 6 }} />
                  <Text style={[styles.sectionTitle, { color: theme.faint, fontFamily: fontFamilies.display }]}>
                    AI Story Branches
                  </Text>
                </View>
                {!loadingBranches && (
                  <TouchableOpacity onPress={fetchBranches} style={styles.regenerateRow}>
                    <Ionicons name="refresh" size={12} color={theme.muted} style={{ marginRight: 4 }} />
                    <Text style={[styles.regenerateText, { color: theme.muted }]}>Regenerate</Text>
                  </TouchableOpacity>
                )}
              </View>

              {loadingBranches && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.accent} style={{ marginBottom: 8 }} />
                  <Text style={[styles.loadingText, { color: theme.muted }]}>
                    Generating story branches...
                  </Text>
                </View>
              )}

              {branchError && !loadingBranches && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, { color: theme.accent }]}>
                    {branchError}
                  </Text>
                  <TouchableOpacity onPress={fetchBranches}>
                    <Text style={[styles.retryText, { color: theme.accent }]}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!loadingBranches && branches.length > 0 && (
                <View style={styles.branchesList}>
                  {branches.map((b, i) => {
                    const isSelected = selected === `branch-${i}`;
                    return (
                      <TouchableOpacity
                        key={i}
                        activeOpacity={0.8}
                        onPress={() => setSelected(`branch-${i}`)}
                        style={getOptionStyle(`branch-${i}`)}
                      >
                        <View style={styles.branchHeaderRow}>
                          <Text style={[styles.branchTitle, { color: '#8b30c8', fontFamily: fontFamilies.display }]}>
                            Branch {i + 1} — {b.title}
                          </Text>
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={16} color="#8b30c8" />
                          )}
                        </View>
                        <Text style={[styles.branchDesc, { color: theme.text2 }]}>
                          {b.description}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Custom Direction */}
            <View style={[styles.dividerSection, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelected('custom')}
                style={[getOptionStyle('custom'), { marginBottom: selected === 'custom' ? 10 : 0 }]}
              >
                <View style={styles.optionRow}>
                  <Ionicons name="create-outline" size={32} color={theme.gold} style={{ marginRight: 12 }} />
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: theme.text, fontFamily: fontFamilies.display }]}>
                      Write Your Own Direction
                    </Text>
                    <Text style={[styles.optionDesc, { color: theme.muted }]}>
                      Tell the AI exactly what should happen next.
                    </Text>
                  </View>
                  {selected === 'custom' && (
                    <Ionicons name="checkmark-circle" size={18} color={theme.gold} />
                  )}
                </View>
              </TouchableOpacity>

              {selected === 'custom' && (
                <TextInput
                  style={[
                    styles.textarea,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="e.g. 'Dragneel finally speaks to Liliana alone — she is cold but intrigued. A rival faction attacks, forcing them to fight...'"
                  placeholderTextColor={theme.faint}
                  multiline={true}
                  numberOfLines={4}
                  value={customText}
                  onChangeText={setCustomText}
                />
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity onPress={onClose} style={[styles.footerBtn, styles.cancelBtn]}>
              <Text style={[styles.cancelBtnText, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!canForge}
              onPress={handleForge}
              style={[
                styles.footerBtn,
                styles.forgeBtn,
                {
                  backgroundColor: canForge ? theme.accent : theme.bg4,
                  borderColor: canForge ? theme.accent : theme.border,
                },
              ]}
            >
              <Ionicons name="hammer" size={14} color="#fff" style={{ marginRight: 6 }} />
              <Text style={[styles.forgeBtnText, { fontFamily: fontFamilies.display }]}>
                Forge
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  body: {
    padding: 16,
  },
  bodyContent: {
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  optionBtn: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    borderRadius: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  optionDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  dividerSection: {
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  regenerateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regenerateText: {
    fontSize: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  errorText: {
    fontSize: 11,
  },
  retryText: {
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  branchesList: {
    gap: 8,
  },
  branchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  branchTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  branchDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  cancelBtnText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  forgeBtn: {
    flexDirection: 'row',
    borderRadius: 2,
  },
  forgeBtnText: {
    color: '#fff',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
