import React from 'react';
import { View, ScrollView } from 'react-native';
import Header from '../components/common/Header';
import HeroSection from '../components/home/HeroSection';
import CoursesSection from '../components/home/CoursesSection';
import TrustBadges from '../components/home/TrustBadges';
import CallToActionBanner from '../components/home/CallToActionBanner';

import { useEnrollment } from '../context/EnrollmentContext';
import { navigate as rootNavigate } from '../navigation/navigationRef';

export default function HomeScreen({ navigation }) {
  const { isCourseEnrolled } = useEnrollment();

  const handleMenuPress = () => {
    console.log('Menu opened');
  };

  const handleSearchPress = () => {
    if (navigation?.navigate) navigation.navigate('Courses');
    else rootNavigate('Courses');
  };

  const handleNotificationPress = () => {
    if (navigation?.getParent) {
      const parent = navigation.getParent();
      if (parent?.navigate) return parent.navigate('NotificationSettings');
    }
    rootNavigate('NotificationSettings');
  };

  const handleExploreCourses = () => {
    if (navigation?.navigate) navigation.navigate('Courses');
    else rootNavigate('Courses');
  };

  const handleCoursePress = (course) => {
    if (isCourseEnrolled(course.id)) {
      if (navigation?.getParent) {
        const parent = navigation.getParent();
        if (parent?.navigate) return parent.navigate('CoursePlayer', { courseId: course.id });
      }
      rootNavigate('CoursePlayer', { courseId: course.id });
    } else {
      if (navigation?.navigate) {
        navigation.navigate('Courses', { selectedCategory: course.id });
      } else {
        rootNavigate('Courses', { selectedCategory: course.id });
      }
    }
  };


  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Top Header matching exact screenshot */}
      <Header
        onMenuPress={handleMenuPress}
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
      />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 px-4 pt-3.5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {/* 1. Hero Section with Hero1.webp */}
        <HeroSection onExplorePress={handleExploreCourses} />

        {/* 2. Our Courses 2-Column Grid with all 6 cards */}
        <CoursesSection
          onCoursePress={handleCoursePress}
          onViewAllPress={handleExploreCourses}
        />

        {/* 3. 4 Trust Badges */}
        <TrustBadges />

        {/* 4. Call To Action Gift Banner */}
        <CallToActionBanner onGetStartedPress={handleExploreCourses} />
      </ScrollView>
    </View>
  );
}
