import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const LOGO_URL = 'https://ik.imagekit.io/5glnyqfxu/Courses/LogoRehab.webp?updatedAt=1782812428525';

export default function Header({
  onBackPress,
  showBack = false,
  onSearchPress,
  onNotificationPress,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 12) + 4 }
      ]}
      className="bg-white/95 pl-0 pr-4 pb-2 flex-row items-center justify-between border-b border-slate-100/70"
    >
      {/* Left: Optional Back Button (if showBack) & Big Prominent Logo directly from 0px screen edge */}
      <View className="flex-row items-center flex-1">
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/70 items-center justify-center shadow-sm mr-1 ml-3"
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </TouchableOpacity>
        )}

        {/* Big Prominent Logo touching the left screen boundary */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.logoTouchable}
          className="items-start justify-center flex-1"
        >
          <Image
            source={{ uri: LOGO_URL }}
            style={[
              styles.logo,
              { marginLeft: showBack ? 0 : -6 }
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Right: Full-Sized Clean Search & Notification Buttons */}
      <View className="flex-row items-center gap-2.5">
        {/* Search Button */}
        <TouchableOpacity
          onPress={onSearchPress}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200/70 items-center justify-center shadow-sm"
          style={styles.actionButton}
        >
          <Feather name="search" size={19} color="#0f172a" />
        </TouchableOpacity>

        {/* Notification Bell with Red Badge Dot */}
        <TouchableOpacity
          onPress={onNotificationPress}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200/70 items-center justify-center shadow-sm relative"
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
  logoTouchable: {
    paddingLeft: 0,
    marginLeft: 0,
  },
  logo: {
    width: 170,
    height: 60,
    alignSelf: 'flex-start',
  },
  backButton: {
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
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
