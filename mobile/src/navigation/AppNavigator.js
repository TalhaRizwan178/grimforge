import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { fontFamilies } from '../theme/fonts';

// Screens
import HomeScreen from '../screens/HomeScreen';
import LibraryScreen from '../screens/LibraryScreen';
import CreateNovelScreen from '../screens/CreateNovelScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import NovelDetailScreen from '../screens/NovelDetailScreen';
import ReaderScreen from '../screens/ReaderScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Browse') {
            iconName = focused ? 'journal' : 'journal-outline';
          } else if (route.name === 'Library') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'hammer' : 'hammer-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.bg2,
          borderTopColor: theme.border,
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 8,
          fontFamily: fontFamilies.display,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
        headerStyle: {
          backgroundColor: theme.bg2,
          borderBottomColor: theme.border,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: theme.text,
          fontSize: 13,
          fontFamily: fontFamilies.display,
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
        headerTintColor: theme.text,
      })}
    >
      <Tab.Screen name="Browse" component={HomeScreen} options={{ title: 'Browse' }} />
      <Tab.Screen name="Library" component={LibraryScreen} options={{ title: 'Grimoire' }} />
      <Tab.Screen name="Create" component={CreateNovelScreen} options={{ title: 'Forge' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Scribe' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.bg2,
          borderBottomColor: theme.border,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTitleStyle: {
          color: theme.text,
          fontSize: 12,
          fontFamily: fontFamilies.display,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        },
        headerTintColor: theme.text,
        contentStyle: {
          backgroundColor: theme.bg,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{
          title: 'Sign In',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="NovelDetail"
        component={NovelDetailScreen}
        options={{
          title: 'Chronicle Details',
        }}
      />
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
