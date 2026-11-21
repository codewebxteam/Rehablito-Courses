import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from '../components/common/Header';
import CallToActionBanner from '../components/home/CallToActionBanner';
import { useEnrollment } from '../context/EnrollmentContext';
import { COURSES_DATABASE } from '../constants/coursesData';
import { navigate as rootNavigate } from '../navigation/navigationRef';



// The 6 standard categories with exact photos, colors & meta from screenshot
export const STANDARD_COURSE_CATEGORIES = [
  {
    id: 'autism-adhd',
    title: 'Autism / ADHD',
    subtitle: 'Understand & support neurodevelopmental differences',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/AutismCard1.webp',
    themeColor: '#16a34a', // Green
    cardBg: '#f2fcf5',
    cardBorder: '#dcfce7',
    iconName: 'puzzle-outline',
    iconType: 'material',
    badge: 'Bestseller',
    target: ['parents', 'professionals'],
  },
  {
    id: 'speech-therapy',
    title: 'Speech Therapy',
    subtitle: 'Improve communication & speech skills step by step',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/SpeechCard2.webp',
    themeColor: '#0284c7', // Blue
    cardBg: '#f0f8fe',
    cardBorder: '#e0f2fe',
    iconName: 'account-voice',
    iconType: 'material',
    target: ['parents', 'professionals'],
  },
  {
    id: 'occupational-therapy',
    title: 'Occupational Therapy',
    subtitle: 'Build daily living & motor skills for independence',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/OccuptaitonalCard3.webp',
    themeColor: '#ea580c', // Orange
    cardBg: '#fff7ed',
    cardBorder: '#ffedd5',
    iconName: 'hand-left-outline',
    iconType: 'ionicon',
    target: ['parents', 'professionals'],
  },
  {
    id: 'behaviour-therapy',
    title: 'Behaviour Therapy',
    subtitle: 'Positive strategies for better behaviour & emotional growth',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/BehaviourCard4.webp',
    themeColor: '#7c3aed', // Purple
    cardBg: '#faf5ff',
    cardBorder: '#f3e8ff',
    iconName: 'emoticon-happy-outline',
    iconType: 'material',
    target: ['parents', 'free'],
  },
  {
    id: 'special-education',
    title: 'Special Education',
    subtitle: 'Personalized learning & academic development',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/SpecialEducationCard5.webp',
    themeColor: '#d97706', // Amber
    cardBg: '#fffbeb',
    cardBorder: '#fef3c7',
    iconName: 'book-open-outline',
    iconType: 'material',
    target: ['professionals', 'parents'],
  },
  {
    id: 'pediatric-rehab',
    title: 'Pediatric Rehabilitation',
    subtitle: 'Holistic support for overall child development',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/RehabCard6.webp',
    themeColor: '#0d9488', // Teal
    cardBg: '#f0fdfa',
    cardBorder: '#ccfbf1',
    iconName: 'human-child',
    iconType: 'material',
    target: ['professionals', 'free'],
  },
];

// Fallback images library for dynamic categories
const EXISTING_COURSE_IMAGES = [
  'https://ik.imagekit.io/5glnyqfxu/Courses/AutismCard1.webp',
  'https://ik.imagekit.io/5glnyqfxu/Courses/SpeechCard2.webp',
  'https://ik.imagekit.io/5glnyqfxu/Courses/OccuptaitonalCard3.webp',
  'https://ik.imagekit.io/5glnyqfxu/Courses/BehaviourCard4.webp',
  'https://ik.imagekit.io/5glnyqfxu/Courses/SpecialEducationCard5.webp',
  'https://ik.imagekit.io/5glnyqfxu/Courses/RehabCard6.webp',
];

// Vibrant palettes for dynamic categories added from Admin
const DYNAMIC_PALETTES = [
  { themeColor: '#e11d48', cardBg: '#fff1f2', cardBorder: '#ffe4e6', iconName: 'sparkles' },
  { themeColor: '#7c3aed', cardBg: '#faf5ff', cardBorder: '#f3e8ff', iconName: 'brain' },
  { themeColor: '#0284c7', cardBg: '#f0f8fe', cardBorder: '#e0f2fe', iconName: 'school-outline' },
  { themeColor: '#16a34a', cardBg: '#f2fcf5', cardBorder: '#dcfce7', iconName: 'star-outline' },
  { themeColor: '#ea580c', cardBg: '#fff7ed', cardBorder: '#ffedd5', iconName: 'fire' },
  { themeColor: '#0d9488', cardBg: '#f0fdfa', cardBorder: '#ccfbf1', iconName: 'heart-pulse' },
];

// Smart helper to get video card thumbnail
export const getCourseCardImage = (course) => {
  if (course.image && course.image.includes('ik.imagekit.io')) {
    return course.image;
  }
  if (course.image && course.image.includes('img.youtube.com')) {
    return course.image;
  }
  const vid = course.videoId || course.youtubeId || course.mainVideoId;
  if (vid && typeof vid === 'string' && vid.length >= 6) {
    return `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
  }
  if (course.image && course.image.startsWith('http') && !course.image.includes('unsplash.com')) {
    return course.image;
  }
  const str = String(course.id || course.title || 'rehablito');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash + str.charCodeAt(i) * (i + 1)) % EXISTING_COURSE_IMAGES.length;
  }
  return EXISTING_COURSE_IMAGES[hash];
};

// Helper: Filter courses belonging to a specific category
export const getCategoryCourses = (category, courseList) => {
  if (!category || !Array.isArray(courseList)) return [];
  const catId = String(category.id || '').toLowerCase();
  const catTitle = String(category.title || '').toLowerCase();

  return courseList.filter((c) => {
    const cCat = typeof c.category === 'string' ? c.category.toLowerCase() : '';
    if (catId === 'autism-adhd' && (cCat.includes('autism') || cCat.includes('adhd'))) {
      return true;
    }
    if (catId === 'speech-therapy' && cCat.includes('speech')) {
      return true;
    }
    if (catId === 'occupational-therapy' && cCat.includes('occupational')) {
      return true;
    }
    if (catId === 'behaviour-therapy' && cCat.includes('behaviour')) {
      return true;
    }
    if (catId === 'special-education' && cCat.includes('special')) {
      return true;
    }
    if (catId === 'pediatric-rehab' && (cCat.includes('pediatric') || cCat.includes('rehab'))) {
      return true;
    }
    if (cCat === catId || cCat === catTitle || (catTitle && cCat.includes(catTitle))) {
      return true;
    }
    return false;
  });
};

// Helper: Calculate real course and lesson statistics for a category
export const getCategoryStats = (category, courseList) => {
  const matching = getCategoryCourses(category, courseList);
  const count = matching.length;
  let totalLessons = 0;
  matching.forEach((c) => {
    if (c.lecturesCount && !isNaN(Number(c.lecturesCount))) {
      totalLessons += Number(c.lecturesCount);
    } else if (Array.isArray(c.lectures)) {
      totalLessons += c.lectures.length;
    } else if (Array.isArray(c.curriculum)) {
      totalLessons += c.curriculum.reduce(
        (acc, m) => acc + (Array.isArray(m.lessons) ? m.lessons.length : 0),
        0
      );
    }
  });
  return {
    count,
    hasCourses: count > 0,
    totalLessons,
  };
};

export default function CoursesScreen({ route, navigation }) {
  const { isCourseEnrolled, getCourseProgress } = useEnrollment();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // 1. Sync Firestore courses with Website Admin Panel
  useEffect(() => {
    const coursesRef = collection(db, 'courseVideos');
    const unsubscribe = onSnapshot(
      coursesRef,
      (snapshot) => {
        const firestoreList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        firestoreList.sort((a, b) => {
          const getTimestamp = (item) => {
            if (item.createdAt?.toDate) return item.createdAt.toDate().getTime();
            if (item.createdAt) return new Date(item.createdAt).getTime();
            return 0;
          };
          return getTimestamp(b) - getTimestamp(a);
        });

        setCourses(firestoreList);
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        console.warn('Firestore courses subscription error:', error);
        setCourses(Object.values(COURSES_DATABASE));
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle route params when navigating directly into a category (e.g. from HomeScreen)
  useEffect(() => {
    if (route?.params?.selectedCategory) {
      const catParam = route.params.selectedCategory;
      const catParamStr =
        typeof catParam === 'string'
          ? catParam
          : String(catParam?.id || catParam?.title || '');

      const matched = STANDARD_COURSE_CATEGORIES.find(
        (c) =>
          c.id.toLowerCase() === catParamStr.toLowerCase() ||
          c.title.toLowerCase().includes(catParamStr.toLowerCase())
      );
      if (matched) {
        setSelectedCategory(matched);
      } else {
        setSelectedCategory({
          id: catParamStr || 'category',
          title: typeof catParam === 'object' && catParam?.title ? catParam.title : catParamStr || 'Course Category',
          subtitle: 'Expert clinical rehabilitation and therapy guidance',
          themeColor: '#0a2540',
          cardBg: '#f8fafc',
          cardBorder: '#e2e8f0',
        });
      }
    }
  }, [route?.params?.selectedCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const handleHeaderBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      if (navigation?.goBack) navigation.goBack();
      else rootNavigate('Home');
    }
  };

  const handleNotificationPress = () => {
    if (navigation?.getParent) {
      const parent = navigation.getParent();
      if (parent?.navigate) return parent.navigate('NotificationSettings');
    }
    if (navigation?.navigate) {
      navigation.navigate('NotificationSettings');
    } else {
      rootNavigate('NotificationSettings');
    }
  };

  // 2. Build complete categories list including any new category uploaded from Admin Panel
  const allCategories = useMemo(() => {
    const list = [...STANDARD_COURSE_CATEGORIES];

    // Find custom categories uploaded in Firestore
    courses.forEach((c) => {
      if (c.category) {
        const catName = c.category.trim();
        const exists = list.some(
          (item) =>
            item.title.toLowerCase() === catName.toLowerCase() ||
            item.id.toLowerCase() === catName.toLowerCase() ||
            (item.id === 'autism-adhd' && (catName.toLowerCase().includes('autism') || catName.toLowerCase().includes('adhd'))) ||
            (item.id === 'speech-therapy' && catName.toLowerCase().includes('speech')) ||
            (item.id === 'occupational-therapy' && catName.toLowerCase().includes('occupational')) ||
            (item.id === 'behaviour-therapy' && catName.toLowerCase().includes('behaviour')) ||
            (item.id === 'special-education' && catName.toLowerCase().includes('special')) ||
            (item.id === 'pediatric-rehab' && (catName.toLowerCase().includes('pediatric') || catName.toLowerCase().includes('rehab')))
        );

        if (!exists) {
          // Select an image ensuring NO consecutive duplicate image
          const lastImage = list[list.length - 1]?.image;
          const imageIndex = list.length % EXISTING_COURSE_IMAGES.length;
          let assignedImage = EXISTING_COURSE_IMAGES[imageIndex];
          if (assignedImage === lastImage) {
            assignedImage = EXISTING_COURSE_IMAGES[(imageIndex + 1) % EXISTING_COURSE_IMAGES.length];
          }

          const paletteIndex = list.length % DYNAMIC_PALETTES.length;
          const pal = DYNAMIC_PALETTES[paletteIndex];

          const categoryCourses = courses.filter(
            (item) => (item.category || '').toLowerCase() === catName.toLowerCase()
          );

          list.push({
            id: catName.toLowerCase().replace(/\s+/g, '-'),
            title: catName,
            subtitle: `Expert clinical guidance for ${catName}`,
            image: assignedImage,
            themeColor: pal.themeColor,
            cardBg: pal.cardBg,
            cardBorder: pal.cardBorder,
            iconName: pal.iconName,
            iconType: 'material',
            target: ['parents', 'professionals'],
          });
        }
      }
    });

    return list;
  }, [courses]);

  // 3. Filter categories based on search
  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCategories;
    return allCategories.filter((cat) => {
      return (
        cat.title.toLowerCase().includes(q) ||
        cat.subtitle.toLowerCase().includes(q)
      );
    });
  }, [allCategories, searchQuery]);

  // 4. Courses belonging to the currently selected category
  const coursesInSelectedCategory = useMemo(() => {
    if (!selectedCategory) return [];
    const matching = getCategoryCourses(selectedCategory, courses);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matching;

    return matching.filter((c) => {
      const cTitle = typeof c.title === 'string' ? c.title.toLowerCase() : '';
      const cCat = typeof c.category === 'string' ? c.category.toLowerCase() : '';
      return cTitle.includes(q) || cCat.includes(q);
    });
  }, [selectedCategory, courses, searchQuery]);

  const handleCoursePress = (course) => {
    const courseWithImage = {
      ...course,
      image: getCourseCardImage(course),
    };
    const targetScreen = isCourseEnrolled(course.id) ? 'CoursePlayer' : 'CourseDetail';
    const params = isCourseEnrolled(course.id)
      ? { courseId: course.id, course: courseWithImage }
      : { course: courseWithImage };

    if (navigation?.getParent) {
      const parent = navigation.getParent();
      if (parent?.navigate) {
        parent.navigate(targetScreen, params);
        return;
      }
    }
    if (navigation?.navigate) {
      navigation.navigate(targetScreen, params);
    } else {
      rootNavigate(targetScreen, params);
    }
  };

  const renderCategoryIcon = (item) => {
    if (item.iconType === 'ionicon') {
      return <Ionicons name={item.iconName} size={18} color={item.themeColor} />;
    }
    return <MaterialCommunityIcons name={item.iconName} size={18} color={item.themeColor} />;
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Top Header with prominent Logo touching the left boundary */}
      <Header
        onSearchPress={() => setIsSearchVisible((prev) => !prev)}
        onNotificationPress={handleNotificationPress}
      />

      <ScrollView
        className="flex-1 px-4 pt-3.5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 36 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#7c3aed', '#0a2540']} />
        }
      >
        {/* ========================================================= */}
        {/* VIEW 1: CATEGORIES LISTING VIEW (EXACT SCREENSHOT LAYOUT) */}
        {/* ========================================================= */}
        {!selectedCategory ? (
          <View>
            {/* Title Header Section + Sparkle Rays & Pill Badge */}
            <View className="flex-row items-start justify-between mb-3.5">
              <View className="w-[63%] pr-2">
                <Text className="text-[#0a2540] text-[27px] font-black tracking-tight leading-[33px] mb-1">
                  Our Courses
                </Text>
                <Text className="text-slate-500 text-[12px] leading-[17px] font-medium">
                  Expert-designed courses for parents, caregivers and professionals.
                </Text>
              </View>

              {/* Sparkle Rays & Pill Badge matching exact screenshot */}
              <View className="relative">
                <View style={styles.sparkleDoodle}>
                  <Text className="text-[#f59e0b] text-[13px] font-bold">ˏˋ°</Text>
                </View>

                <View
                  style={styles.pillBadge}
                  className="bg-[#f3e8ff] px-3 py-2 rounded-2xl border border-[#e9d5ff]"
                >
                  <Text className="text-[#6b21a8] text-[9.5px] font-bold">Learn</Text>
                  <Text className="text-[#6b21a8] text-[9.5px] font-bold">+ Practice</Text>
                  <View className="flex-row items-center mt-0.5">
                    <Text className="text-[#581c87] text-[9.5px] font-extrabold">
                      Make a Difference{' '}
                    </Text>
                    <Text className="text-[9.5px]">💖</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Search Bar (Collapsible) */}
            {isSearchVisible && (
              <View className="mb-3.5 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200/90 shadow-sm flex-row items-center">
                <Feather name="search" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search categories or topics..."
                  placeholderTextColor="#94a3b8"
                  className="flex-1 text-[13px] text-[#0a2540] font-medium p-0"
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                    <Feather name="x" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                )}
              </View>
            )}



            {/* Loading Indicator */}
            {loading ? (
              <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color="#6c2bd9" />
                <Text className="text-slate-500 text-[12px] font-bold mt-3">
                  Loading courses & categories...
                </Text>
              </View>
            ) : (
              /* CATEGORIES LIST (REAL DATA FROM FIRESTORE - NO FAKE HOURS/LEARNERS) */
              <View className="space-y-3 mb-4">
                {filteredCategories.map((item) => {
                  const stats = getCategoryStats(item, courses);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.88}
                      onPress={() => setSelectedCategory(item)}
                      style={[
                        styles.categoryCard,
                        { backgroundColor: item.cardBg, borderColor: item.cardBorder },
                      ]}
                      className="w-full rounded-2xl p-3 mb-3 border relative overflow-hidden flex-row items-center justify-between"
                    >
                      {/* Left: Child Image with Floating Icon Circle */}
                      <View className="relative w-[30%] h-24 items-center justify-center -ml-1">
                        {/* Floating Circle Icon Badge */}
                        <View
                          style={styles.iconCircle}
                          className="w-8 h-8 rounded-full bg-white items-center justify-center border border-white/90 shadow-sm absolute top-0 left-0 z-10"
                        >
                          {renderCategoryIcon(item)}
                        </View>

                        {/* Photo from ImageKit */}
                        <Image
                          source={{ uri: item.image }}
                          style={styles.categoryImage}
                          resizeMode="contain"
                        />
                      </View>

                      {/* Middle: Details & Meta */}
                      <View className="flex-1 pl-2.5 pr-2 justify-between">
                        {/* Title & Badge */}
                        <View className="flex-row items-center justify-between mb-0.5">
                          <Text
                            style={{ color: item.themeColor }}
                            className="text-[14.5px] font-extrabold tracking-tight leading-[18px] flex-1 mr-1"
                          >
                            {item.title}
                          </Text>
                          {stats.hasCourses ? (
                            item.badge ? (
                              <View className="bg-[#dcfce7] px-2 py-0.5 rounded-md border border-[#86efac]">
                                <Text className="text-[#15803d] text-[9px] font-black">
                                  {item.badge}
                                </Text>
                              </View>
                            ) : null
                          ) : (
                            <View className="bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300">
                              <Text className="text-amber-800 text-[9px] font-black">
                                Coming Soon
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Subtitle */}
                        <Text
                          numberOfLines={2}
                          className="text-slate-500 text-[11px] leading-[15px] mb-2 font-medium"
                        >
                          {item.subtitle}
                        </Text>

                        {/* Meta Tags Row - REAL DATA ONLY */}
                        {stats.hasCourses ? (
                          <View className="flex-row items-center flex-wrap gap-2">
                            <View className="flex-row items-center">
                              <Feather name="play-circle" size={11} color="#64748b" style={{ marginRight: 3 }} />
                              <Text className="text-slate-600 text-[10.5px] font-bold">
                                {stats.count} {stats.count === 1 ? 'Course' : 'Courses'}
                              </Text>
                            </View>
                            {stats.totalLessons > 0 && (
                              <>
                                <Text className="text-slate-300">•</Text>
                                <View className="flex-row items-center">
                                  <Feather name="video" size={11} color="#64748b" style={{ marginRight: 3 }} />
                                  <Text className="text-slate-600 text-[10.5px] font-semibold">
                                    {stats.totalLessons} Lessons
                                  </Text>
                                </View>
                              </>
                            )}
                          </View>
                        ) : (
                          <View className="flex-row items-center">
                            <View className="bg-amber-50 px-2 py-0.5 rounded-md flex-row items-center border border-amber-200">
                              <Feather name="clock" size={10} color="#d97706" style={{ marginRight: 3.5 }} />
                              <Text className="text-amber-800 text-[10px] font-bold">
                                Uploading Soon
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>

                      {/* Far Right: Arrow Action Button matching screenshot */}
                      <View
                        style={{ backgroundColor: item.themeColor }}
                        className="w-8 h-8 rounded-full items-center justify-center shadow-sm shrink-0"
                      >
                        <Feather name="arrow-right" size={14} color="#ffffff" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Bottom Call to Action Gift Banner matching exact screenshot */}
            <View className="mt-2 mb-2">
              <CallToActionBanner
                onGetStartedPress={() => {
                  if (allCategories.length > 0) setSelectedCategory(allCategories[0]);
                }}
              />
            </View>
          </View>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: COURSES INSIDE SELECTED CATEGORY (CLICKED CATEGORY DRILL-DOWN)   */
          /* ========================================================================= */
          <View>
            {/* Back Button & Category Title Header */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => setSelectedCategory(null)}
                activeOpacity={0.8}
                className="flex-row items-center bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs"
              >
                <Feather name="arrow-left" size={14} color="#0a2540" style={{ marginRight: 6 }} />
                <Text className="text-[#0a2540] text-[12px] font-bold">
                  All Categories
                </Text>
              </TouchableOpacity>

              <View
                style={{ backgroundColor: selectedCategory.cardBg, borderColor: selectedCategory.cardBorder }}
                className="px-3 py-1.5 rounded-xl border flex-row items-center"
              >
                <Text
                  style={{ color: selectedCategory.themeColor }}
                  className="text-[12px] font-black"
                >
                  {selectedCategory.title}
                </Text>
              </View>
            </View>

            {/* Category Overview Card */}
            <View
              style={[
                styles.categoryBannerCard,
                { backgroundColor: selectedCategory.cardBg, borderColor: selectedCategory.cardBorder },
              ]}
              className="p-4 rounded-3xl mb-4 border flex-row items-center justify-between"
            >
              <View className="flex-1 pr-3">
                <Text
                  style={{ color: selectedCategory.themeColor }}
                  className="text-[18px] font-black mb-1"
                >
                  {selectedCategory.title}
                </Text>
                <Text className="text-slate-600 text-[11.5px] leading-[16px] mb-2 font-medium">
                  {selectedCategory.subtitle}
                </Text>
                <View className="flex-row items-center gap-3">
                  <Text className="text-slate-600 text-[11px] font-bold">
                    {coursesInSelectedCategory.length} {coursesInSelectedCategory.length === 1 ? 'Course' : 'Courses'} Available
                  </Text>
                </View>
              </View>

              {selectedCategory.image && (
                <Image
                  source={{ uri: selectedCategory.image }}
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                />
              )}
            </View>

            {/* Courses List in this category */}
            {coursesInSelectedCategory.length > 0 ? (
              <View className="space-y-4 mb-4">
                {coursesInSelectedCategory.map((course) => {
                  const isEnrolled = isCourseEnrolled(course.id);
                  const progress = getCourseProgress(course.id);
                  const imageUrl = getCourseCardImage(course);

                  const priceDisplay = course.price
                    ? (String(course.price).startsWith('₹') ? course.price : `₹${course.price}`)
                    : 'Free';

                  const origPriceDisplay = course.originalPrice
                    ? (String(course.originalPrice).startsWith('₹') ? course.originalPrice : `₹${course.originalPrice}`)
                    : null;

                  const lecturesCount =
                    course.lecturesCount ||
                    (Array.isArray(course.lectures) && course.lectures.length > 0
                      ? `${course.lectures.length} Lectures`
                      : 'Interactive Modules');

                  const duration = course.duration || 'Self Paced';
                  const categoryTag = course.category || selectedCategory.title;
                  const rating = course.rating || 4.9;

                  const instructorName =
                    typeof course.instructor === 'string'
                      ? course.instructor
                      : course.instructor?.name || 'Rehablito Clinical Team';

                  return (
                    <TouchableOpacity
                      key={course.id}
                      activeOpacity={0.92}
                      onPress={() => handleCoursePress(course)}
                      style={[
                        styles.courseCard,
                        {
                          backgroundColor: '#ffffff',
                          borderColor: isEnrolled ? '#86efac' : '#e2e8f0',
                        },
                      ]}
                      className="w-full rounded-3xl mb-5 border relative overflow-hidden bg-white"
                    >
                      {/* TOP: FULL-WIDTH VIDEO THUMBNAIL CONTAINER */}
                      <View style={styles.videoContainer} className="relative w-full bg-slate-900 overflow-hidden">
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.courseImage}
                          resizeMode="cover"
                        />

                        {/* Video Vignette Gradient Overlay */}
                        <View className="absolute inset-0 bg-black/25" />

                        {/* Top Overlay Row: Category Pill & Status Badge */}
                        <View className="absolute top-3 left-3 right-3 flex-row items-center justify-between z-10">
                          <View className="bg-white/95 px-3 py-1 rounded-full shadow-xs border border-white/60 flex-row items-center">
                            <Text className="text-[#0284c7] text-[10px] font-black uppercase tracking-wider">
                              {categoryTag}
                            </Text>
                          </View>

                          {isEnrolled ? (
                            <View className="bg-emerald-500 px-3 py-1 rounded-full shadow-sm flex-row items-center border border-white/40">
                              <Ionicons name="checkmark-circle" size={12} color="#ffffff" style={{ marginRight: 4 }} />
                              <Text className="text-white text-[10.5px] font-black">Enrolled</Text>
                            </View>
                          ) : course.isComingSoon ? (
                            <View className="bg-amber-500 px-3 py-1 rounded-full shadow-sm border border-white/40">
                              <Text className="text-white text-[10.5px] font-black">Coming Soon</Text>
                            </View>
                          ) : (
                            <View className="bg-black/60 px-2.5 py-1 rounded-full shadow-sm flex-row items-center border border-white/20">
                              <Ionicons name="star" size={11} color="#f59e0b" style={{ marginRight: 3 }} />
                              <Text className="text-white text-[10.5px] font-black">{rating}</Text>
                            </View>
                          )}
                        </View>

                        {/* Center Video Play Button */}
                        <View className="absolute inset-0 items-center justify-center">
                          <View style={styles.playButtonCircle}>
                            <Ionicons
                              name="play"
                              size={22}
                              color={isEnrolled ? '#16a34a' : '#0a2540'}
                              style={{ marginLeft: 3 }}
                            />
                          </View>
                        </View>

                        {/* Bottom Overlay Row: Video Meta (Lectures Count - No fake hours) */}
                        <View className="absolute bottom-2.5 right-2.5 bg-black/75 px-2.5 py-1 rounded-lg flex-row items-center border border-white/15">
                          <Feather name="video" size={10} color="#ffffff" style={{ marginRight: 4 }} />
                          <Text className="text-white text-[10px] font-bold">
                            {lecturesCount}
                          </Text>
                        </View>
                      </View>

                      {/* BOTTOM: COURSE DETAILS CONTAINER */}
                      <View className="p-4 sm:p-5">
                        <Text
                          numberOfLines={2}
                          className="text-[#0a2540] text-[16px] font-black leading-[22px] mb-1.5 tracking-tight"
                        >
                          {course.title}
                        </Text>

                        <Text
                          numberOfLines={2}
                          className="text-slate-600 text-[12px] leading-[17.5px] mb-3 font-medium"
                        >
                          {course.description || 'Comprehensive clinical guidance designed by therapy experts.'}
                        </Text>

                        <View className="flex-row items-center justify-between mb-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <View className="flex-row items-center flex-1 mr-2">
                            <View className="w-6 h-6 rounded-full bg-[#0a2540] items-center justify-center mr-2">
                              <Feather name="user-check" size={12} color="#ffffff" />
                            </View>
                            <Text numberOfLines={1} className="text-slate-700 text-[11px] font-bold flex-1">
                              {instructorName}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <MaterialCommunityIcons name="shield-check" size={14} color="#16a34a" style={{ marginRight: 3 }} />
                            <Text className="text-emerald-700 text-[10px] font-extrabold">Certified</Text>
                          </View>
                        </View>

                        {/* Progress Bar (if enrolled) */}
                        {isEnrolled && (
                          <View className="mb-3.5 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                            <View className="flex-row items-center justify-between mb-1.5">
                              <Text className="text-emerald-800 text-[11px] font-extrabold">
                                Course Progress
                              </Text>
                              <Text className="text-emerald-700 text-[11px] font-black">
                                {progress.percentage}% Completed
                              </Text>
                            </View>
                            <View className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
                              <View
                                style={{ width: `${progress.percentage}%` }}
                                className="h-full bg-emerald-600 rounded-full"
                              />
                            </View>
                          </View>
                        )}

                        {/* Price & Action Row */}
                        <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
                          <View className="flex-row items-baseline gap-1.5">
                            <Text className="text-[#0a2540] text-[18px] font-black">
                              {priceDisplay}
                            </Text>
                            {origPriceDisplay && (
                              <Text className="text-slate-400 text-[12px] line-through font-medium">
                                {origPriceDisplay}
                              </Text>
                            )}
                            {course.discount && (
                              <View className="bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 ml-1">
                                <Text className="text-rose-600 text-[9.5px] font-black">
                                  {course.discount}
                                </Text>
                              </View>
                            )}
                          </View>

                          <TouchableOpacity
                            onPress={() => handleCoursePress(course)}
                            activeOpacity={0.82}
                            className={`px-4 py-2.5 rounded-xl flex-row items-center shadow-xs ${
                              isEnrolled
                                ? 'bg-emerald-600'
                                : course.isComingSoon
                                ? 'bg-amber-100'
                                : 'bg-[#0a2540]'
                            }`}
                          >
                            <Text
                              className={`text-[11.5px] font-bold mr-1.5 ${
                                course.isComingSoon ? 'text-amber-800' : 'text-white'
                              }`}
                            >
                              {isEnrolled
                                ? 'Study Now'
                                : course.isComingSoon
                                ? 'Notify Me'
                                : 'View Course'}
                            </Text>
                            <Feather
                              name={isEnrolled ? 'play' : course.isComingSoon ? 'bell' : 'arrow-right'}
                              size={12}
                              color={course.isComingSoon ? '#92400e' : '#ffffff'}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* EMPTY / COMING SOON STATE FOR CATEGORY */
              <View style={styles.comingSoonCard} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm items-center text-center my-3">
                {/* Visual Icon Badge */}
                <View className="relative mb-3.5 items-center justify-center">
                  <View
                    style={{ backgroundColor: selectedCategory?.cardBg || '#fef3c7' }}
                    className="w-20 h-20 rounded-3xl items-center justify-center border border-amber-200/80 shadow-2xs"
                  >
                    <MaterialCommunityIcons
                      name="progress-clock"
                      size={40}
                      color={selectedCategory?.themeColor || '#d97706'}
                    />
                  </View>
                  <View className="absolute -bottom-2 bg-amber-500 px-2.5 py-0.5 rounded-full border-2 border-white shadow-xs">
                    <Text className="text-white text-[9.5px] font-black tracking-wide uppercase">
                      Coming Soon ⏳
                    </Text>
                  </View>
                </View>

                {/* Primary Heading */}
                <Text className="text-[#0a2540] text-[20px] font-black text-center mb-1 mt-1">
                  Courses Coming Soon
                </Text>

                {/* Category Name Pill */}
                <View
                  style={{ backgroundColor: selectedCategory?.cardBg || '#f0f9ff' }}
                  className="px-3.5 py-1 rounded-full mb-3 border border-slate-200/70"
                >
                  <Text
                    style={{ color: selectedCategory?.themeColor || '#0284c7' }}
                    className="text-[12.5px] font-black text-center"
                  >
                    {selectedCategory?.title || 'Selected Category'}
                  </Text>
                </View>

                {/* Professional English Subtitle */}
                <Text className="text-slate-700 text-[13px] leading-[20px] text-center mb-2 px-1 font-semibold">
                  We are currently preparing and recording clinical therapy courses for{' '}
                  <Text className="text-[#0a2540] font-extrabold">{selectedCategory?.title}</Text>.
                </Text>

                <Text className="text-slate-500 text-[11.5px] leading-[17px] text-center mb-4 px-2">
                  New video lectures, home exercise modules, and therapy guides will be available here soon. If you have any questions or need advice, reach out to our clinical team on chat!
                </Text>

                {/* 3 Value Pillars */}
                <View className="w-full bg-slate-50/80 rounded-2xl p-3.5 mb-5 border border-slate-200/60">
                  <View className="flex-row items-center mb-2">
                    <Feather name="video" size={13} color="#0284c7" style={{ marginRight: 8 }} />
                    <Text className="text-slate-700 text-[11.5px] font-bold">
                      Clinical Video Lessons by Certified Specialists
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <Feather name="file-text" size={13} color="#16a34a" style={{ marginRight: 8 }} />
                    <Text className="text-slate-700 text-[11.5px] font-bold">
                      Downloadable Clinical PDF Workbooks
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={13} color="#d97706" style={{ marginRight: 8 }} />
                    <Text className="text-slate-700 text-[11.5px] font-bold">
                      Coming Very Soon
                    </Text>
                  </View>
                </View>

                {/* Dual Action Buttons */}
                <View className="w-full gap-2.5">
                  <TouchableOpacity
                    onPress={() => {
                      if (navigation?.navigate) {
                        navigation.navigate('Chat');
                      } else {
                        rootNavigate('Chat');
                      }
                    }}
                    activeOpacity={0.85}
                    className="w-full bg-[#0a2540] py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm"
                  >
                    <Feather name="message-circle" size={16} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text className="text-white text-[13px] font-black">
                      Ask Clinical Team on Chat
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setSelectedCategory(null)}
                    activeOpacity={0.85}
                    className="w-full bg-slate-100 py-3 rounded-2xl flex-row items-center justify-center border border-slate-200"
                  >
                    <Feather name="grid" size={14} color="#475569" style={{ marginRight: 8 }} />
                    <Text className="text-slate-700 text-[12.5px] font-bold">
                      Explore All Categories
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pillBadge: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sparkleDoodle: {
    position: 'absolute',
    top: -12,
    left: -8,
    zIndex: 10,
  },
  categoryCard: {
    minHeight: 100,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  categoryImage: {
    width: '100%',
    height: 82,
  },
  iconCircle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryBannerCard: {
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  courseCard: {
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  videoContainer: {
    width: '100%',
    height: 195,
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  playButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 4,
  },
  comingSoonCard: {
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
});
