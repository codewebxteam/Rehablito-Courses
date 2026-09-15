import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 border-b border-slate-200 bg-white">
        <Text className="text-slate-900 text-xl font-bold">Consultation Chat</Text>
        <Text className="text-slate-500 text-xs mt-0.5">
          Real-time clinical consultation & AI guidance
        </Text>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        <View className="bg-sky-50 border border-sky-200 rounded-2xl p-6 items-center">
          <Text className="text-sky-900 font-bold text-base mb-1">
            7-Day Auto-Cleanup Protected
          </Text>
          <Text className="text-sky-700 text-xs text-center">
            Doctor/therapist consultation with ImageKit attachments & voice notes.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
