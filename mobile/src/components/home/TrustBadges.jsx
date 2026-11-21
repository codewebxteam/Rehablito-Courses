import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const BADGES = [
  {
    id: 'expert-led',
    icon: <Ionicons name="shield-checkmark-outline" size={20} color="#16a34a" />,
    title: 'Expert-Led Courses',
    subtitle: 'By certified therapists',
  },
  {
    id: 'parent-friendly',
    icon: <Ionicons name="people-outline" size={20} color="#ea580c" />,
    title: 'Parent Friendly',
    subtitle: 'Easy to follow',
  },
  {
    id: 'learn-anytime',
    icon: <Feather name="tv" size={19} color="#0284c7" />,
    title: 'Learn Anytime',
    subtitle: 'On your terms',
  },
  {
    id: 'trusted-safe',
    icon: <MaterialCommunityIcons name="hand-heart-outline" size={20} color="#e11d48" />,
    title: 'Trusted & Safe',
    subtitle: 'For your child',
  },
];

export default function TrustBadges() {
  return (
    <View
      style={styles.container}
      className="bg-white rounded-2xl p-3.5 mb-5 border border-slate-100 flex-row items-center justify-between"
    >
      {BADGES.map((badge, idx) => (
        <View
          key={badge.id}
          className="flex-1 items-center px-1 text-center"
          style={idx < BADGES.length - 1 ? styles.badgeDivider : null}
        >
          {/* Icon */}
          <View className="mb-1.5 items-center justify-center">
            {badge.icon}
          </View>

          {/* Title */}
          <Text
            className="text-slate-900 text-[9.5px] font-bold text-center mb-0.5 leading-[12px]"
            numberOfLines={1}
          >
            {badge.title}
          </Text>

          {/* Subtitle */}
          <Text
            className="text-slate-400 text-[8.5px] text-center leading-[11px]"
            numberOfLines={1}
          >
            {badge.subtitle}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  badgeDivider: {
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
});
