import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function CallToActionBanner({ onGetStartedPress }) {
  return (
    <View
      style={styles.banner}
      className="bg-[#f3effe] rounded-2xl p-4 border border-[#e4d8fe] flex-row items-center justify-between mb-2 relative overflow-hidden"
    >
      {/* Left 3D Gift Box Graphic */}
      <View className="w-12 h-12 items-center justify-center mr-2.5">
        <Text style={styles.giftEmoji}>🎁</Text>
      </View>

      {/* Middle Text */}
      <View className="flex-1 pr-2">
        <Text className="text-[#1e1b4b] text-[13px] font-black leading-[17px] mb-1">
          Start Your Child's Journey Today!
        </Text>
        <Text className="text-slate-500 text-[10px] leading-[13.5px] font-medium">
          Explore expert-designed courses and help your child build a brighter future.
        </Text>
      </View>

      {/* Right Action Button */}
      <TouchableOpacity
        onPress={onGetStartedPress}
        activeOpacity={0.85}
        style={styles.button}
        className="bg-[#7c3aed] flex-row items-center px-3.5 py-2.5 rounded-xl shadow-sm"
      >
        <Text className="text-white text-[11px] font-bold mr-1">
          Get Started
        </Text>
        <Feather name="arrow-right" size={12} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  giftEmoji: {
    fontSize: 34,
  },
  button: {
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
});
