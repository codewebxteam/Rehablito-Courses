import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-4 py-6">
        <View className="bg-sky-600 rounded-2xl p-6 shadow-sm mb-6">
          <Text className="text-white text-xs font-semibold uppercase tracking-wider mb-1">
            Rehablito Academy
          </Text>
          <Text className="text-white text-2xl font-bold mb-2">
            Master Medical Rehabilitation
          </Text>
          <Text className="text-sky-100 text-sm">
            Learn from clinical experts, access courses, and consult in real-time.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-slate-800 text-lg font-bold mb-3">
            Featured Courses
          </Text>
          <View className="bg-white rounded-xl p-4 border border-slate-200">
            <Text className="text-slate-500 text-sm">
              Screenshots ke according UI design hone ke baad courses display honge.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
