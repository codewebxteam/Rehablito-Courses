import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login, signup, resetPassword } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your registered email address.');
      return;
    }
    if (!password) {
      Alert.alert('Password Required', 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        await login(email, password);
        Alert.alert('Welcome Back! 🎉', 'You have successfully signed in.');
        navigation?.goBack();
      } else {
        if (!name.trim()) {
          Alert.alert('Name Required', 'Please enter your full name.');
          setLoading(false);
          return;
        }
        await signup(email, password, name, phone);
        Alert.alert('Account Created! 🌟', 'Your Rehablito account is ready and synced.');
        navigation?.goBack();
      }
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please check your details or reset your password.';
      } else if (error.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      }
      Alert.alert('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Enter Email', 'Please enter your email above to receive password reset instructions.');
      return;
    }

    Alert.alert(
      'Reset Password',
      `Send password reset link to ${email.trim()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Link',
          onPress: async () => {
            try {
              await resetPassword(email);
              Alert.alert('Email Sent', 'Check your inbox for the password reset link.');
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#f8fafc]"
    >
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 6 }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-slate-200 shadow-sm"
        >
          <Feather name="arrow-left" size={20} color="#0a2540" />
        </TouchableOpacity>
        <Text className="text-[#0a2540] text-[17px] font-black">
          {isLoginMode ? 'Sign In' : 'Create Account'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Brand Header */}
        <View className="items-center mb-6 mt-2">
          <View className="w-16 h-16 rounded-2xl bg-[#eff6ff] items-center justify-center border border-sky-200 mb-3 shadow-sm">
            <Ionicons name="sparkles" size={32} color="#0284c7" />
          </View>
          <Text className="text-[#0a2540] text-[24px] font-black tracking-tight text-center">
            Rehablito Learning
          </Text>
          <Text className="text-slate-500 text-[13px] text-center mt-1 px-4">
            Access your courses, clinical notes & progress across all devices.
          </Text>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-slate-200/70 p-1 rounded-2xl mb-6">
          <TouchableOpacity
            onPress={() => setIsLoginMode(true)}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
              isLoginMode ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-[13.5px] font-bold ${
                isLoginMode ? 'text-[#0a2540]' : 'text-slate-500'
              }`}
            >
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsLoginMode(false)}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
              !isLoginMode ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              className={`text-[13.5px] font-bold ${
                !isLoginMode ? 'text-[#0a2540]' : 'text-slate-500'
              }`}
            >
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs Card */}
        <View className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          {!isLoginMode && (
            <View>
              <Text className="text-slate-700 text-[12px] font-bold mb-1.5 ml-1">
                Full Name
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                <Feather name="user" size={16} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor="#94a3b8"
                  className="flex-1 text-[#0a2540] text-[14px] font-medium"
                />
              </View>
            </View>
          )}

          <View className="mt-3">
            <Text className="text-slate-700 text-[12px] font-bold mb-1.5 ml-1">
              Email Address
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
              <Feather name="mail" size={16} color="#64748b" style={{ marginRight: 10 }} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-[#0a2540] text-[14px] font-medium"
              />
            </View>
          </View>

          {!isLoginMode && (
            <View className="mt-3">
              <Text className="text-slate-700 text-[12px] font-bold mb-1.5 ml-1">
                Phone Number (Optional)
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
                <Feather name="phone" size={16} color="#64748b" style={{ marginRight: 10 }} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  className="flex-1 text-[#0a2540] text-[14px] font-medium"
                />
              </View>
            </View>
          )}

          <View className="mt-3">
            <View className="flex-row items-center justify-between mb-1.5 ml-1 mr-1">
              <Text className="text-slate-700 text-[12px] font-bold">
                Password
              </Text>
              {isLoginMode && (
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text className="text-sky-600 text-[11.5px] font-bold">
                    Forgot?
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5">
              <Feather name="lock" size={16} color="#64748b" style={{ marginRight: 10 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                className="flex-1 text-[#0a2540] text-[14px] font-medium"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={16}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-[#0a2540] py-3.5 rounded-2xl items-center justify-center mt-5 shadow-sm"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-[15px] font-extrabold tracking-wide">
                {isLoginMode ? 'Sign In to Account' : 'Create My Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sync Info Pill */}
        <View className="flex-row items-center justify-center mt-6 bg-slate-100 py-2.5 px-4 rounded-full self-center border border-slate-200/80">
          <Feather name="refresh-cw" size={13} color="#0284c7" style={{ marginRight: 6 }} />
          <Text className="text-slate-600 text-[11.5px] font-medium">
            Realtime cloud sync enabled
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
});
