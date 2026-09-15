import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Header from '../components/common/Header';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Top Header matching exact screenshot */}
      <Header
        onMenuPress={() => console.log('Menu pressed')}
        onSearchPress={() => console.log('Search pressed')}
        onNotificationPress={() => console.log('Notification pressed')}
      />

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Placeholder ready for Hero & Course Cards */}
        <View className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm items-center">
          <Text className="text-slate-800 font-bold text-base mb-1">Header Ready! 🎯</Text>
          <Text className="text-slate-500 text-xs text-center">
            Menu, Rehablito Center Logo, Search, and Notification bell with red badge.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
