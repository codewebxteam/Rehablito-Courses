import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COURSE_CATEGORIES = [
  {
    id: 'autism-adhd',
    title: 'Autism / ADHD',
    subtitle: 'Understand & support neurodevelopmental differences',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/AutismCard1.webp',
    themeColor: '#16a34a', // Green
    cardBg: '#f2fcf5',
    cardBorder: '#dcfce7',
    iconBg: '#ffffff',
    iconName: 'puzzle-outline',
    iconType: 'material',
  },
  {
    id: 'speech-therapy',
    title: 'Speech Therapy',
    subtitle: 'Improve communication & speech skills step by step',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/SpeechCard2.webp',
    themeColor: '#0284c7', // Blue
    cardBg: '#f0f8fe',
    cardBorder: '#e0f2fe',
    iconBg: '#ffffff',
    iconName: 'account-voice',
    iconType: 'material',
  },
  {
    id: 'occupational-therapy',
    title: 'Occupational Therapy',
    subtitle: 'Build daily living & motor skills for independence',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/OccuptaitonalCard3.webp',
    themeColor: '#ea580c', // Orange
    cardBg: '#fff7ed',
    cardBorder: '#ffedd5',
    iconBg: '#ffffff',
    iconName: 'hand-left-outline',
    iconType: 'ionicon',
  },
  {
    id: 'behaviour-therapy',
    title: 'Behaviour Therapy',
    subtitle: 'Positive strategies for better behaviour & emotional growth',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/BehaviourCard4.webp',
    themeColor: '#7c3aed', // Purple
    cardBg: '#faf5ff',
    cardBorder: '#f3e8ff',
    iconBg: '#ffffff',
    iconName: 'emoticon-happy-outline',
    iconType: 'material',
  },
  {
    id: 'special-education',
    title: 'Special Education',
    subtitle: 'Personalized learning & academic development',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/SpecialEducationCard5.webp',
    themeColor: '#d97706', // Amber
    cardBg: '#fffbeb',
    cardBorder: '#fef3c7',
    iconBg: '#ffffff',
    iconName: 'book-open-outline',
    iconType: 'material',
  },
  {
    id: 'pediatric-rehab',
    title: 'Pediatric Rehabilitation',
    subtitle: 'Holistic support for overall child development',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/RehabCard6.webp',
    themeColor: '#0d9488', // Teal
    cardBg: '#f0fdfa',
    cardBorder: '#ccfbf1',
    iconBg: '#ffffff',
    iconName: 'human-child',
    iconType: 'material',
  },
];

export default function CoursesSection({ onCoursePress, onViewAllPress }) {
  const renderIcon = (item) => {
    if (item.iconType === 'ionicon') {
      return <Ionicons name={item.iconName} size={18} color={item.themeColor} />;
    }
    return <MaterialCommunityIcons name={item.iconName} size={18} color={item.themeColor} />;
  };

  return (
    <View className="mb-6">
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3.5 px-0.5">
        <View className="flex-row items-center">
          <Text className="text-slate-900 text-[18px] font-black mr-2 tracking-tight">
            Our Courses
          </Text>
          {/* Decorative Colored Bars Icon */}
          <View className="flex-row items-center gap-0.5">
            <View className="w-1 h-3 bg-[#16a34a] rounded-full" />
            <View className="w-1 h-4 bg-[#f59e0b] rounded-full" />
            <View className="w-1 h-2.5 bg-[#0284c7] rounded-full" />
          </View>
        </View>

        {/* View All Button */}
        <TouchableOpacity
          onPress={onViewAllPress}
          activeOpacity={0.7}
          className="flex-row items-center"
        >
          <Text className="text-[#0284c7] text-[12.5px] font-bold mr-1">
            View All
          </Text>
          <Feather name="arrow-right" size={13} color="#0284c7" />
        </TouchableOpacity>
      </View>

      {/* 2-Column Grid */}
      <View className="flex-row flex-wrap justify-between">
        {COURSE_CATEGORIES.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            onPress={() => onCoursePress && onCoursePress(item)}
            style={[
              styles.card,
              { backgroundColor: item.cardBg, borderColor: item.cardBorder },
            ]}
            className="w-[48.5%] rounded-2xl p-3 mb-3 border relative overflow-hidden flex-col justify-between"
          >
            {/* Top Row: Icon badge on left, Child image on right */}
            <View className="flex-row items-start justify-between mb-2">
              {/* Icon Circle */}
              <View
                style={styles.iconCircle}
                className="w-9 h-9 rounded-full bg-white items-center justify-center border border-slate-100/90 shadow-sm"
              >
                {renderIcon(item)}
              </View>

              {/* Photo */}
              <View className="w-[66%] h-18 items-end justify-center -mr-1 -mt-1">
                <Image
                  source={{ uri: item.image }}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Bottom Content: Title, Subtitle, Arrow button */}
            <View>
              {/* Category Title */}
              <Text
                style={{ color: item.themeColor }}
                className="text-[13px] font-extrabold mb-1 leading-[17px]"
              >
                {item.title}
              </Text>

              {/* Category Subtitle */}
              <Text
                className="text-slate-500 text-[10px] leading-[13.5px] mb-2"
                numberOfLines={2}
              >
                {item.subtitle}
              </Text>

              {/* Bottom Right Arrow Button */}
              <View className="items-end mt-1">
                <View
                  style={{ backgroundColor: item.themeColor }}
                  className="w-6 h-6 rounded-full items-center justify-center shadow-sm"
                >
                  <Feather name="arrow-right" size={12} color="#ffffff" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 180,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconCircle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImage: {
    width: '100%',
    height: 74,
  },
});
