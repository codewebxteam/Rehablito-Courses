import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';

export default function AccountScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 border-b border-slate-200 bg-white">
        <Text className="text-slate-900 text-xl font-bold">My Account</Text>
      </View>

      <View className="p-6">
        <View className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-sky-100 items-center justify-center mb-3">
            <Text className="text-sky-700 text-2xl font-bold">R</Text>
          </View>
          <Text className="text-slate-900 text-lg font-bold">Welcome to Rehablito</Text>
          <Text className="text-slate-500 text-xs mt-1">Sign in to access your enrolled courses</Text>
        </View>

        <TouchableOpacity className="bg-sky-600 rounded-xl py-3.5 items-center shadow-sm">
          <Text className="text-white font-semibold text-base">Sign In / Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
