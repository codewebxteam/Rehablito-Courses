import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import Header from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import { useEnrollment } from '../context/EnrollmentContext';
import { COURSES_DATABASE } from '../constants/coursesData';
import { navigate as rootNavigate } from '../navigation/navigationRef';

export default function AccountScreen({ navigation }) {
  const { currentUser, userProfile, logout, openAuthModal } = useAuth();
  const { enrolledCourseIds, enrolledCourses, getCourseProgress } = useEnrollment();

  const safeNavigate = (screen, params) => {
    if (navigation?.getParent) {
      const parent = navigation.getParent();
      if (parent?.navigate) {
        parent.navigate(screen, params);
        return;
      }
    }
    if (navigation?.navigate) {
      navigation.navigate(screen, params);
    } else {
      rootNavigate(screen, params);
    }
  };

  const handleSearchPress = () => {
    if (navigation?.navigate) navigation.navigate('Courses');
    else rootNavigate('Courses');
  };

  const handleNotificationPress = () => {
    safeNavigate('NotificationSettings');
  };

  const handleEditProfile = () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    safeNavigate('EditProfile');
  };

  const handleAuthPress = () => {
    openAuthModal('login');
  };

  const handleRegisterPress = () => {
    openAuthModal('signup');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out from Rehablito?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              Alert.alert('Logged Out', 'You have been logged out successfully.');
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  // ==========================================
  // 1. GUEST VIEW (When user is NOT logged in)
  // ==========================================
  if (!currentUser) {
    return (
      <View className="flex-1 bg-[#f8fafc]">
        {/* Header */}
        <Header
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
        />

        <ScrollView
          className="flex-1 px-4 pt-3.5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Header Title Section */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="w-[70%] pr-2">
              <Text className="text-[#0a2540] text-[28px] font-black tracking-tight leading-[34px] mb-1">
                Account
              </Text>
              <Text className="text-slate-500 text-[12px] leading-[17px] font-medium">
                Sign in to view your profile and courses
              </Text>
            </View>

            {/* Sparkle Rays Badge */}
            <View
              style={styles.pillBadge}
              className="bg-[#fce7f3] px-3 py-2 rounded-2xl border border-[#fbcfe8]"
            >
              <Text className="text-[#9d174d] text-[10px] font-bold">Rehablito</Text>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-[#831843] text-[10px] font-extrabold">Academy </Text>
                <Text className="text-[10px]">✨</Text>
              </View>
            </View>
          </View>

          {/* Primary Guest Welcome & Action Card */}
          <View className="rounded-3xl p-5 mb-4 border border-slate-800 overflow-hidden relative shadow-lg bg-[#071838]">
            <View className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#e6007e]/25" />
            <View className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#38bdf8]/20" />

            {/* Icon & Mini Badge */}
            <View className="flex-row items-center mb-2.5">
              <View className="w-10 h-10 rounded-2xl bg-white/10 items-center justify-center border border-white/15 mr-3">
                <Feather name="user" size={20} color="#ffd60a" />
              </View>
              <View>
                <View className="flex-row items-center">
                  <Ionicons name="sparkles" size={12} color="#ffd60a" style={{ marginRight: 4 }} />
                  <Text className="text-[#ffd60a] text-[11px] font-black uppercase tracking-wider">
                    Parent & Learner Portal
                  </Text>
                </View>
                <Text className="text-slate-300 text-[11px]">Personalized Learning & Support</Text>
              </View>
            </View>

            <Text className="text-white text-[20px] font-black leading-[26px] mb-1.5">
              Sign In to Your Account
            </Text>
            <Text className="text-slate-300 text-[12px] leading-[18px] mb-5">
              Sign in or register to view your child's profile, date of birth, enrolled courses, and video progress across mobile and web.
            </Text>

            {/* Big Action Buttons */}
            <View className="flex-col gap-2.5">
              <TouchableOpacity
                onPress={handleAuthPress}
                activeOpacity={0.88}
                className="bg-white py-3.5 px-4 rounded-xl items-center justify-center flex-row shadow-sm"
              >
                <Feather name="log-in" size={17} color="#071838" style={{ marginRight: 8 }} />
                <Text className="text-[#071838] text-[14px] font-black">
                  Sign In to Continue
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRegisterPress}
                activeOpacity={0.88}
                className="bg-[#e6007e] py-3.5 px-4 rounded-xl items-center justify-center flex-row shadow-sm"
              >
                <Feather name="user-plus" size={17} color="#ffffff" style={{ marginRight: 8 }} />
                <Text className="text-white text-[14px] font-black">
                  Create New Account (Free)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Benefits Info Card */}
          <View className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm mb-4">
            <Text className="text-[#0a2540] text-[13px] font-black mb-3">
              Why Sign In with Rehablito?
            </Text>

            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center mr-3 border border-emerald-100">
                <Feather name="book-open" size={15} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-[#0a2540] text-[12px] font-bold">Access Enrolled Courses</Text>
                <Text className="text-slate-500 text-[11px]">Watch comprehensive clinical lectures & full modules</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-xl bg-purple-50 items-center justify-center mr-3 border border-purple-100">
                <MaterialCommunityIcons name="cake-variant" size={15} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <Text className="text-[#0a2540] text-[12px] font-bold">Child Profile & Date of Birth</Text>
                <Text className="text-slate-500 text-[11px]">Track your child's age, milestones & therapy goals</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-xl bg-sky-50 items-center justify-center mr-3 border border-sky-100">
                <Feather name="refresh-cw" size={14} color="#0284c7" />
              </View>
              <View className="flex-1">
                <Text className="text-[#0a2540] text-[12px] font-bold">App & Website Synchronization</Text>
                <Text className="text-slate-500 text-[11px]">Login on mobile and website with the exact same account</Text>
              </View>
            </View>
          </View>

          {/* Quick Help & About Links */}
          <View
            style={styles.menuGroupCard}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm mb-4 overflow-hidden"
          >
            <TouchableOpacity
              onPress={() => safeNavigate('HelpSupport')}
              activeOpacity={0.7}
              className="p-3.5 flex-row items-center justify-between border-b border-slate-100"
            >
              <View className="flex-row items-center flex-1 pr-2">
                <View className="w-9 h-9 rounded-xl bg-[#eff6ff] items-center justify-center mr-3 border border-blue-100">
                  <Feather name="help-circle" size={18} color="#0284c7" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 text-[13px] font-bold">Help & Support</Text>
                  <Text className="text-slate-500 text-[11px] mt-0.5">FAQs, contact details and guides</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => safeNavigate('SendFeedback')}
              activeOpacity={0.7}
              className="p-3.5 flex-row items-center justify-between border-b border-slate-100"
            >
              <View className="flex-row items-center flex-1 pr-2">
                <View className="w-9 h-9 rounded-xl bg-[#fffbeb] items-center justify-center mr-3 border border-amber-100">
                  <Feather name="message-square" size={18} color="#d97706" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 text-[13px] font-bold">Send Feedback</Text>
                  <Text className="text-slate-500 text-[11px] mt-0.5">Share your suggestions with us</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => safeNavigate('AboutRehablito')}
              activeOpacity={0.7}
              className="p-3.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1 pr-2">
                <View className="w-9 h-9 rounded-xl bg-[#f3e8ff] items-center justify-center mr-3 border border-purple-100">
                  <Feather name="info" size={18} color="#7c3aed" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 text-[13px] font-bold">About Rehablito</Text>
                  <Text className="text-slate-500 text-[11px] mt-0.5">Version 1.0.0</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Inspirational Sprout Banner */}
          <View
            style={styles.inspirationalBanner}
            className="bg-[#f0fdf4] rounded-2xl p-4 border border-emerald-100 flex-row items-center shadow-sm"
          >
            <View className="w-12 h-12 rounded-xl bg-white items-center justify-center mr-3.5 border border-emerald-200 shadow-sm">
              <Text className="text-2xl">🌱</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[#064e3b] text-[13.5px] font-black mb-0.5">
                Together for a Brighter Tomorrow
              </Text>
              <View className="flex-row items-center flex-wrap">
                <Text className="text-emerald-700 text-[11px] leading-[15px] font-medium">
                  Empowering special children and parents every step of the way.{' '}
                </Text>
                <Text className="text-[10px]">💖</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ===============================================
  // 2. AUTHENTICATED VIEW (When user IS logged in)
  // ==========================================
  const childName = userProfile?.childName || '';
  const dobText = userProfile?.dob || 'Add DOB';
  const genderText = userProfile?.gender || 'Not set';
  const conditionText =
    (Array.isArray(userProfile?.conditions) && userProfile.conditions.length > 0
      ? userProfile.conditions.join(', ')
      : userProfile?.condition) || 'Not set';

  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Header */}
      <Header
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
      />

      <ScrollView
        className="flex-1 px-4 pt-3.5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Title Header Section + Fun Badge */}
        <View className="flex-row items-start justify-between mb-3.5">
          <View className="w-[62%] pr-2">
            <Text className="text-[#0a2540] text-[28px] font-black tracking-tight leading-[34px] mb-1">
              Profile
            </Text>
            <Text className="text-slate-500 text-[12px] leading-[17px] font-medium">
              Manage your account and preferences
            </Text>
          </View>

          {/* Right Playful Floating Badge */}
          <View className="relative">
            <View style={styles.sparkleDoodle}>
              <Text className="text-[#f59e0b] text-[13px] font-bold">ˏˋ°</Text>
            </View>
            <View
              style={styles.pillBadge}
              className="bg-[#fce7f3] px-3 py-2 rounded-2xl border border-[#fbcfe8]"
            >
              <Text className="text-[#9d174d] text-[10px] font-bold">Same Support</Text>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-[#831843] text-[10px] font-extrabold">
                  Brighter Tomorrows{' '}
                </Text>
                <Text className="text-[10px]">💖</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 1. Main User Profile Card */}
        <View
          style={styles.profileCard}
          className="bg-[#edf6fd] rounded-3xl p-4 border border-sky-100 mb-3.5 shadow-sm relative overflow-hidden"
        >
          <View className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-sky-200/40" />
          <View className="absolute right-10 bottom-2 w-16 h-16 rounded-full bg-sky-200/30" />

          <View className="flex-row items-start justify-between">
            {/* Left: Avatar with Camera Badge */}
            <View className="relative mr-3">
              <View
                style={styles.avatarGlow}
                className="w-18 h-18 rounded-full p-1 bg-white shadow-sm border border-sky-200"
              >
                <Image
                  source={{
                    uri:
                      userProfile?.photoURL ||
                      currentUser?.photoURL ||
                      'https://ik.imagekit.io/5glnyqfxu/Courses/AutismCard1.webp',
                  }}
                  style={styles.avatarImg}
                  className="rounded-full"
                  resizeMode="cover"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleEditProfile}
                style={styles.cameraBadge}
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0a2540] items-center justify-center border-2 border-white shadow-sm"
              >
                <Feather name="camera" size={11} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Middle & Right: Name, Details & Edit Profile Button */}
            <View className="flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text numberOfLines={1} className="text-[#0a2540] text-[17px] font-black leading-[22px] flex-1 mr-2">
                  {userProfile?.name || currentUser.displayName || 'Parent Learner'}
                </Text>

                <TouchableOpacity
                  onPress={handleEditProfile}
                  activeOpacity={0.8}
                  style={styles.editButton}
                  className="bg-white px-2.5 py-1 rounded-full border border-sky-200 flex-row items-center shadow-sm"
                >
                  <Feather name="edit-2" size={11} color="#0284c7" />
                  <Text className="text-[#0284c7] text-[10.5px] font-bold ml-1">
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Email with Verified indicator */}
              <Text numberOfLines={1} className="text-emerald-700 text-[11px] font-bold mb-1">
                ✓ {currentUser.email}
              </Text>

              {/* Child name / Quote */}
              <View className="flex-row items-center flex-wrap">
                <Text className="text-slate-500 text-[11px] italic font-medium">
                  {childName ? `Child: ${childName} • ` : ''}
                  "{userProfile?.quote || 'Every small step is a big victory.'}"{' '}
                </Text>
                <Text className="text-[11px]">💖</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. 3-Column Child Metrics Card (Date of Birth, Gender, Condition) */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleEditProfile}
          style={styles.metricsCard}
          className="bg-white rounded-2xl py-3.5 px-2 border border-slate-200/80 shadow-sm flex-row items-center justify-between mb-3.5"
        >
          {/* Column 1: Date of Birth */}
          <View className="flex-1 items-center border-r border-slate-100 px-1">
            <View className="w-8 h-8 rounded-full bg-[#f3e8ff] items-center justify-center mb-1 border border-purple-100">
              <MaterialCommunityIcons name="cake-variant" size={16} color="#7c3aed" />
            </View>
            <Text className="text-slate-400 text-[10px] font-semibold">
              Date of Birth
            </Text>
            <Text numberOfLines={1} className="text-[#0a2540] text-[11.5px] font-extrabold mt-0.5 text-center">
              {dobText}
            </Text>
          </View>

          {/* Column 2: Gender */}
          <View className="flex-1 items-center border-r border-slate-100 px-1">
            <View className="w-8 h-8 rounded-full bg-[#e0f2fe] items-center justify-center mb-1 border border-sky-100">
              <MaterialCommunityIcons name="face-man-profile" size={16} color="#0284c7" />
            </View>
            <Text className="text-slate-400 text-[10px] font-semibold">
              Gender
            </Text>
            <Text numberOfLines={1} className="text-[#0a2540] text-[11.5px] font-extrabold mt-0.5 text-center">
              {genderText}
            </Text>
          </View>

          {/* Column 3: Condition */}
          <View className="flex-1 items-center px-1">
            <View className="w-8 h-8 rounded-full bg-[#dcfce7] items-center justify-center mb-1 border border-green-100">
              <MaterialCommunityIcons name="file-document-outline" size={16} color="#16a34a" />
            </View>
            <Text className="text-slate-400 text-[10px] font-semibold">
              Condition
            </Text>
            <Text numberOfLines={1} className="text-[#0a2540] text-[11.5px] font-extrabold mt-0.5 text-center">
              {conditionText}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 3. ENROLLED COURSES ACTIVE LEARNING OVERVIEW */}
        {enrolledCourseIds.length > 0 ? (
          <View className="mb-4 bg-[#f0fdf4] rounded-2xl p-3.5 border border-emerald-200 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Feather name="book-open" size={14} color="#16a34a" />
                <Text className="text-emerald-950 text-[13px] font-bold ml-1.5">
                  My Enrolled Courses ({enrolledCourseIds.length})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => safeNavigate('Courses')}
                className="flex-row items-center"
              >
                <Text className="text-emerald-700 text-[11px] font-bold">
                  All Courses
                </Text>
                <Feather name="chevron-right" size={13} color="#16a34a" />
              </TouchableOpacity>
            </View>

            {enrolledCourseIds.map((cId) => {
              const cData =
                (enrolledCourses || []).find((c) => (c.courseId || c.id) === cId) ||
                COURSES_DATABASE[cId] || {
                  id: cId,
                  title: 'Rehablito Therapy Course',
                };
              const prog = getCourseProgress(cId);

              return (
                <TouchableOpacity
                  key={cId}
                  onPress={() => safeNavigate('CoursePlayer', { courseId: cId, course: cData })}
                  activeOpacity={0.8}
                  className="bg-white p-3 rounded-xl border border-emerald-100 flex-row items-center justify-between mb-2 shadow-sm"
                >
                  <View className="flex-1 mr-3">
                    <Text numberOfLines={1} className="text-[#0a2540] text-[13px] font-bold">
                      {cData.title}
                    </Text>
                    <View className="flex-row items-center justify-between mt-1 mb-0.5">
                      <Text className="text-emerald-700 text-[10px] font-bold">
                        {prog.isCompleted ? 'Completed ✓' : `${prog.percentage}% Finished`}
                      </Text>
                      <Text className="text-slate-400 text-[9.5px]">
                        {prog.completedCount}/{prog.totalCount} Lessons
                      </Text>
                    </View>
                    <View className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <View
                        style={{ width: `${prog.percentage}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                      />
                    </View>
                  </View>
                  <View className="bg-emerald-600 px-3 py-1.5 rounded-lg flex-row items-center">
                    <Ionicons name="play" size={10} color="#ffffff" style={{ marginRight: 2 }} />
                    <Text className="text-white text-[10px] font-bold">Study</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="mb-4 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm items-center text-center">
            <View className="w-11 h-11 rounded-2xl bg-sky-50 items-center justify-center mb-2 border border-sky-100">
              <Feather name="book-open" size={20} color="#0284c7" />
            </View>
            <Text className="text-[#0a2540] text-[14px] font-bold mb-1">
              No Enrolled Courses Yet
            </Text>
            <Text className="text-slate-500 text-[11.5px] text-center mb-3 leading-[16px]">
              Explore our evidence-based clinical masterclasses and begin learning today.
            </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate('Courses')}
              activeOpacity={0.8}
              className="bg-[#0a2540] px-4 py-2 rounded-xl flex-row items-center shadow-sm"
            >
              <Text className="text-white text-[12px] font-bold mr-1">Explore Courses</Text>
              <Feather name="arrow-right" size={13} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Menu Group 1: Account Information, Notifications, Privacy */}
        <View
          style={styles.menuGroupCard}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm mb-3.5 overflow-hidden"
        >
          {/* Account Information */}
          <TouchableOpacity
            onPress={() => safeNavigate('AccountInfo')}
            activeOpacity={0.7}
            className="p-3.5 flex-row items-center justify-between border-b border-slate-100"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-9 h-9 rounded-xl bg-[#f3e8ff] items-center justify-center mr-3 border border-purple-100">
                <Feather name="user" size={18} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 text-[13px] font-bold">
                  Account Information
                </Text>
                <Text className="text-slate-500 text-[11px] mt-0.5">
                  Update your name, email and password
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            onPress={() => safeNavigate('NotificationSettings')}
            activeOpacity={0.7}
            className="p-3.5 flex-row items-center justify-between border-b border-slate-100"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-9 h-9 rounded-xl bg-[#fdf2f8] items-center justify-center mr-3 border border-pink-100">
                <Feather name="bell" size={18} color="#db2777" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 text-[13px] font-bold">
                  Notifications
                </Text>
                <Text className="text-slate-500 text-[11px] mt-0.5">
                  Manage your reminders and alerts
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* Privacy & Security */}
          <TouchableOpacity
            onPress={() => safeNavigate('PrivacySecurity')}
            activeOpacity={0.7}
            className="p-3.5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-9 h-9 rounded-xl bg-[#f0fdf4] items-center justify-center mr-3 border border-emerald-100">
                <Feather name="shield" size={18} color="#16a34a" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 text-[13px] font-bold">
                  Privacy & Security
                </Text>
                <Text className="text-slate-500 text-[11px] mt-0.5">
                  Manage your data and privacy settings
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* 5. Menu Group 2: Help & Support, Send Feedback, About Rehablito */}
        <View
          style={styles.menuGroupCard}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm mb-3.5 overflow-hidden"
        >
          {/* Help & Support */}
          <TouchableOpacity
            onPress={() => safeNavigate('HelpSupport')}
            activeOpacity={0.7}
            className="p-3.5 flex-row items-center justify-between border-b border-slate-100"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-9 h-9 rounded-xl bg-[#eff6ff] items-center justify-center mr-3 border border-blue-100">
                <Feather name="help-circle" size={18} color="#0284c7" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 text-[13px] font-bold">
                  Help & Support
                </Text>
                <Text className="text-slate-500 text-[11px] mt-0.5">
                  FAQs, guides and contact us
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* Send Feedback */}
          <TouchableOpacity
            onPress={() => safeNavigate('SendFeedback')}
            activeOpacity={0.7}
            className="p-3.5 flex-row items-center justify-between border-b border-slate-100"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-9 h-9 rounded-xl bg-[#fffbeb] items-center justify-center mr-3 border border-amber-100">
                <Feather name="message-square" size={18} color="#d97706" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 text-[13px] font-bold">
                  Send Feedback
                </Text>
                <Text className="text-slate-500 text-[11px] mt-0.5">
                  Help us improve
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* About Rehablito */}
          <TouchableOpacity
            onPress={() => safeNavigate('AboutRehablito')}
            activeOpacity={0.7}
            className="p-3.5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 pr-2">
              <View className="w-9 h-9 rounded-xl bg-[#f3e8ff] items-center justify-center mr-3 border border-purple-100">
                <Feather name="info" size={18} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 text-[13px] font-bold">
                  About Rehablito
                </Text>
                <Text className="text-slate-500 text-[11px] mt-0.5">
                  Version 1.0.0
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* 6. Log Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={styles.logoutButton}
          className="bg-[#fef2f2] p-3.5 rounded-2xl border border-red-100 flex-row items-center mb-3.5 shadow-sm"
        >
          <View className="w-9 h-9 rounded-xl bg-red-100/70 items-center justify-center mr-3">
            <Feather name="log-out" size={18} color="#ef4444" />
          </View>
          <Text className="text-[#ef4444] text-[14px] font-black flex-1">
            Log Out
          </Text>
        </TouchableOpacity>

        {/* 7. Inspirational Sprout Banner */}
        <View
          style={styles.inspirationalBanner}
          className="bg-[#f0fdf4] rounded-2xl p-4 border border-emerald-100 flex-row items-center shadow-sm"
        >
          <View className="w-12 h-12 rounded-xl bg-white items-center justify-center mr-3.5 border border-emerald-200 shadow-sm">
            <Text className="text-2xl">🌱</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[#064e3b] text-[13.5px] font-black mb-0.5">
              Together for a Brighter Tomorrow
            </Text>
            <View className="flex-row items-center flex-wrap">
              <Text className="text-emerald-700 text-[11px] leading-[15px] font-medium">
                Thank you for being part of your child's journey.{' '}
              </Text>
              <Text className="text-[10px]">💖</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pillBadge: {
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sparkleDoodle: {
    position: 'absolute',
    top: -12,
    left: -8,
    zIndex: 10,
  },
  profileCard: {
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarGlow: {
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImg: {
    width: 60,
    height: 60,
  },
  cameraBadge: {
    elevation: 3,
  },
  editButton: {
    elevation: 1,
  },
  metricsCard: {
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuGroupCard: {
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  logoutButton: {
    elevation: 1,
  },
  inspirationalBanner: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
});
