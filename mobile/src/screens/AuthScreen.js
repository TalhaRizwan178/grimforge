import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fontFamilies } from '../theme/fonts';
import api from '../api/axios';

export default function AuthScreen({ navigation }) {
  const { theme } = useTheme();
  const { login, user } = useAuth();
  
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigation.navigate('MainTabs');
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (mode === 'register' && !form.username) {
      setError('Username is required');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload = mode === 'login'
        ? { email: form.email.trim(), password: form.password }
        : { username: form.username.trim(), email: form.email.trim(), password: form.password };
        
      const res = await api.post(endpoint, payload);
      await login(res.data.token, res.data.user);
      navigation.navigate('MainTabs');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setForm({ username: '', email: '', password: '' });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: theme.bg }]}
      >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Ionicons name="flame" size={56} color={theme.accent} style={[styles.logoIcon, { textShadowColor: theme.accent }]} />
          <Text style={[styles.logoText, { color: theme.text, fontFamily: fontFamilies.display }]}>
            GRIMFORGE
          </Text>
          <Text style={[styles.logoSub, { color: theme.muted }]}>
            Where dark stories are born
          </Text>
        </View>

        {/* Card Section */}
        <View style={[styles.card, { backgroundColor: theme.bg2, borderColor: theme.border }]}>
          {/* Tabs */}
          <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => switchMode('login')}
              style={[styles.tab, mode === 'login' && [styles.activeTab, { borderBottomColor: theme.accent }]]}
            >
              <Text style={[styles.tabText, { color: mode === 'login' ? theme.text : theme.muted, fontFamily: fontFamilies.display }]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => switchMode('register')}
              style={[styles.tab, mode === 'register' && [styles.activeTab, { borderBottomColor: theme.accent }]]}
            >
              <Text style={[styles.tabText, { color: mode === 'register' ? theme.text : theme.muted, fontFamily: fontFamilies.display }]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: theme.badgeBg, borderColor: theme.accent }]}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.badgeColor} style={{ marginRight: 6 }} />
                <Text style={[styles.errorText, { color: theme.badgeColor }]}>{error}</Text>
              </View>
            ) : null}

            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                  Pen Name (Username)
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                  placeholder="Your writer's name"
                  placeholderTextColor={theme.faint}
                  value={form.username}
                  onChangeText={(val) => setForm(p => ({ ...p, username: val }))}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                Email
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text }]}
                placeholder="your@email.com"
                placeholderTextColor={theme.faint}
                value={form.email}
                onChangeText={(val) => setForm(p => ({ ...p, email: val }))}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.muted, fontFamily: fontFamilies.display }]}>
                Password
              </Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.text, paddingRight: 40 }]}
                  placeholder="••••••••"
                  placeholderTextColor={theme.faint}
                  secureTextEntry={!showPassword}
                  value={form.password}
                  onChangeText={(val) => setForm(p => ({ ...p, password: val }))}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={theme.muted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={loading}
              onPress={handleSubmit}
              style={[styles.submitBtn, { backgroundColor: theme.accent, borderColor: theme.accent }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.submitText, { fontFamily: fontFamilies.display }]}>
                  {mode === 'login' ? 'Enter the Forge' : 'Join the Forge'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Back Link */}
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backLink}>
          <Ionicons name="arrow-back-outline" size={14} color={theme.muted} style={{ marginRight: 4 }} />
          <Text style={[styles.backLinkText, { color: theme.muted }]}>Back to the Grimoire</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
  },
  logoSub: {
    fontSize: 11,
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {},
  tabText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  form: {
    padding: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 11,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
    borderRadius: 2,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderRadius: 2,
  },
  submitText: {
    color: '#fff',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backLinkText: {
    fontSize: 11,
  },
});
