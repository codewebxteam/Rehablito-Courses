import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';

const LOGO_URL = 'https://ik.imagekit.io/5glnyqfxu/Courses/LogoRehab.webp?updatedAt=1782812428525';

export default function Header({ onMenuPress, onSearchPress, onNotificationPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 12) + 4 }
      ]}
      className="bg-white/95 px-4 pb-3 flex-row items-center justify-between border-b border-slate-100/60"
    >
      {/* Left: Hamburger Menu Button */}
      <TouchableOpacity
        onPress={onMenuPress}
        activeOpacity={0.7}
        className="w-11 h-11 rounded-2xl bg-white border border-slate-200/70 items-center justify-center shadow-sm"
        style={styles.actionButton}
      >
        <Feather name="menu" size={21} color="#0f172a" />
      </TouchableOpacity>

      {/* Center: Rehablito Logo */}
      <View className="items-center justify-center">
        <Image
          source={{ uri: LOGO_URL }}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Right: Search & Notifications */}
      <View className="flex-row items-center gap-2.5">
        {/* Search Button */}
        <TouchableOpacity
          onPress={onSearchPress}
          activeOpacity={0.7}
          className="w-11 h-11 rounded-2xl bg-white border border-slate-200/70 items-center justify-center shadow-sm"
          style={styles.actionButton}
        >
          <Feather name="search" size={19} color="#0f172a" />
        </TouchableOpacity>

        {/* Notification Bell with Red Badge Dot */}
        <TouchableOpacity
          onPress={onNotificationPress}
          activeOpacity={0.7}
          className="w-11 h-11 rounded-2xl bg-white border border-slate-200/70 items-center justify-center shadow-sm relative"
          style={styles.actionButton}
        >
          <Feather name="bell" size={19} color="#0f172a" />
          {/* Red indicator dot */}
          <View
            style={styles.notificationDot}
            className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 148,
    height: 40,
  },
  actionButton: {
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationDot: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
});
