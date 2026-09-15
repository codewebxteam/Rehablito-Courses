import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';

export default function CoursesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 px-4 py-6">
        <View className="mb-4">
          <Text className="text-slate-900 text-2xl font-bold">Explore Courses</Text>
          <Text className="text-slate-500 text-sm">
            Clinical courses, physiotherapy, pediatric rehabilitation
          </Text>
        </View>

        <View className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <Text className="text-slate-700 font-medium">Courses Catalog</Text>
          <Text className="text-slate-400 text-xs mt-1">
            UI design ready for course cards & categories.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
