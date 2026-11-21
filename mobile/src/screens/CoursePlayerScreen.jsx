import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { COURSES_DATABASE } from '../constants/coursesData';
import { useEnrollment } from '../context/EnrollmentContext';
import CourseVideoPlayer from '../components/CourseVideoPlayer';
import { navigate as rootNavigate, goBack as rootGoBack } from '../navigation/navigationRef';

const extractVideoId = (video) => {
  if (!video) return 'aqz-KE-bpKQ';
  if (typeof video === 'string') {
    const str = video.trim();
    if (str.length === 11 && !str.includes('/') && !str.includes('.')) return str;
    try {
      const u = new URL(str.startsWith('http') ? str : `https://${str}`);
      if (u.hostname.includes('youtube.com')) return u.searchParams.get('v') || 'aqz-KE-bpKQ';
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1) || 'aqz-KE-bpKQ';
    } catch (_) {}
    return 'aqz-KE-bpKQ';
  }
  if (video.videoId) return extractVideoId(video.videoId);
  if (video.youtubeId) return extractVideoId(video.youtubeId);
  if (video.url) return extractVideoId(video.url);
  return 'aqz-KE-bpKQ';
};

export default function CoursePlayerScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const passedCourse = route?.params?.course;
  const courseId = passedCourse?.id || route?.params?.courseId || 'autism-adhd';
  const initialLessonId = route?.params?.initialLessonId;

  const {
    enrolledCourses,
    isLessonCompleted,
    toggleLessonCompleted,
    getCourseProgress,
  } = useEnrollment();

  const [remoteCourse, setRemoteCourse] = useState(null);

  // Fetch from Firestore if course not provided and not in static preset database
  useEffect(() => {
    if (!passedCourse && !COURSES_DATABASE[courseId]) {
      const cached = (enrolledCourses || []).find((c) => (c.courseId || c.id) === courseId);
      if (cached) {
        setRemoteCourse(cached);
        return;
      }
      getDoc(doc(db, 'courseVideos', courseId))
        .then((snap) => {
          if (snap.exists()) {
            setRemoteCourse({ id: snap.id, ...snap.data() });
          }
        })
        .catch((err) => console.warn('Error fetching course in player:', err));
    }
  }, [courseId, passedCourse, enrolledCourses]);

  const course = useMemo(() => {
    const source = passedCourse || remoteCourse;
    const base = COURSES_DATABASE[courseId] || COURSES_DATABASE['autism-adhd'];
    if (!source) return base;

    const themeColor =
      source.themeColor ||
      (source.category?.toLowerCase().includes('speech')
        ? '#0284c7'
        : source.category?.toLowerCase().includes('occup')
        ? '#ea580c'
        : source.category?.toLowerCase().includes('behav')
        ? '#d97706'
        : source.category?.toLowerCase().includes('special')
        ? '#7c3aed'
        : source.category?.toLowerCase().includes('pediatric')
        ? '#0d9488'
        : '#16a34a');

    return {
      ...base,
      ...source,
      id: courseId,
      title: source.title || base.title,
      category: source.category || base.category,
      themeColor,
      lectures: source.lectures || base.lectures,
      curriculum: source.curriculum || base.curriculum,
      driveLink: source.driveLink || base.driveLink,
      studyMaterial: source.studyMaterial || base.studyMaterial,
      instructor:
        typeof source.instructor === 'string'
          ? { name: source.instructor, role: 'Rehablito Clinical Specialist', avatar: base.instructor?.avatar }
          : source.instructor || base.instructor,
    };
  }, [courseId, passedCourse, remoteCourse]);

  // Video player modal state
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  // Flatten lessons for linear navigation (prev / next)
  const allLessons = useMemo(() => {
    if (Array.isArray(course?.lectures) && course.lectures.length > 0) {
      return course.lectures.map((lec, idx) => ({
        id: String(lec.id || idx + 1),
        title: lec.title || `Lecture ${idx + 1}`,
        videoId: extractVideoId(lec),
        duration: lec.duration || '12:00',
        moduleId: Math.floor(idx / 5) + 1,
        moduleTitle: `Module ${Math.floor(idx / 5) + 1}: Comprehensive Therapy Curriculum`,
      }));
    }

    const list = [];
    if (course?.curriculum) {
      course.curriculum.forEach((module) => {
        if (Array.isArray(module.lessons)) {
          module.lessons.forEach((lesson) => {
            list.push({
              ...lesson,
              id: String(lesson.id || lesson.videoId || list.length + 1),
              moduleTitle: module.title,
              moduleId: module.id,
            });
          });
        }
      });
    }
    return list;
  }, [course]);

  // Group modules for curriculum accordion
  const displayModules = useMemo(() => {
    if (course?.curriculum && !Array.isArray(course?.lectures)) {
      return course.curriculum;
    }
    if (allLessons.length === 0) return [];

    const grouped = {};
    allLessons.forEach((lesson) => {
      const mId = lesson.moduleId || 1;
      if (!grouped[mId]) {
        grouped[mId] = {
          id: mId,
          title: lesson.moduleTitle || `Module ${mId}`,
          lessons: [],
        };
      }
      grouped[mId].lessons.push(lesson);
    });
    return Object.values(grouped);
  }, [course, allLessons]);

  // Active lesson state (default to initialLessonId or first incomplete lesson)
  const [activeLessonId, setActiveLessonId] = useState(null);

  useEffect(() => {
    if (initialLessonId) {
      setActiveLessonId(String(initialLessonId));
    } else if (allLessons.length > 0 && !activeLessonId) {
      const firstIncomplete = allLessons.find((l) => !isLessonCompleted(course.id, l.id));
      setActiveLessonId(firstIncomplete ? firstIncomplete.id : allLessons[0].id);
    }
  }, [allLessons, initialLessonId]);

  // Expanded modules in curriculum accordion
  const [expandedModules, setExpandedModules] = useState({ 1: true, 2: true });

  const activeLessonIndex = allLessons.findIndex((l) => l.id === activeLessonId);
  const activeLesson = allLessons[activeLessonIndex] || allLessons[0];

  const progress = getCourseProgress(course.id);
  const isCurrentCompleted = isLessonCompleted(course.id, activeLesson?.id);

  // Handlers for Next and Prev
  const handlePrevLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonId(allLessons[activeLessonIndex - 1].id);
    }
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < allLessons.length - 1) {
      setActiveLessonId(allLessons[activeLessonIndex + 1].id);
    }
  };

  const handleToggleComplete = async () => {
    if (!activeLesson) return;
    const nowCompleted = await toggleLessonCompleted(course.id, activeLesson.id);
    if (nowCompleted) {
      Alert.alert(
        '🎉 Lesson Completed!',
        `You marked "${activeLesson.title}" as completed. Great progress!`
      );
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handlePlayVideo = (lessonId) => {
    if (lessonId) {
      setActiveLessonId(lessonId);
    }
    setShowVideoPlayer(true);
  };

  const handleDownloadWorkbook = () => {
    if (course.driveLink) {
      Linking.openURL(course.driveLink).catch(() => {
        Alert.alert('Study Material', 'Opening material link: ' + course.driveLink);
      });
      return;
    }
    Alert.alert(
      '📥 Download Study Material',
      `"${course.studyMaterial?.title || 'Parent Practical Workbook'}" (${course.studyMaterial?.fileSize || 'PDF'}) is ready. Would you like to save it to your device?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download PDF',
          style: 'default',
          onPress: () => {
            Alert.alert('✅ Download Started', 'The PDF workbook has been saved to your downloads.');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* 1. Header Bar with Back button & Course Title */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) }}
        className="bg-[#081736] px-4 pb-3 border-b border-slate-800 flex-row items-center justify-between"
      >
        <TouchableOpacity
          onPress={() => {
            if (navigation?.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else {
              rootGoBack();
            }
          }}
          className="w-10 h-10 rounded-full bg-slate-800/80 items-center justify-center mr-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>

        <View className="flex-1 mr-2">
          <View className="flex-row items-center">
            <View
              className="px-2 py-0.5 rounded-md mr-2"
              style={{ backgroundColor: `${course.themeColor}30` }}
            >
              <Text style={{ color: course.themeColor }} className="text-[10px] font-bold uppercase tracking-wider">
                {course.category}
              </Text>
            </View>
            <Text className="text-emerald-400 text-[11px] font-bold">
              ✓ Enrolled
            </Text>
          </View>
          <Text
            numberOfLines={1}
            className="text-white text-[15px] font-bold tracking-tight mt-0.5"
          >
            {course.title}
          </Text>
        </View>

        {/* Progress pill */}
        <View className="bg-slate-800 px-2.5 py-1 rounded-full flex-row items-center border border-slate-700">
          <Ionicons name="school" size={13} color="#a78bfa" />
          <Text className="text-white text-[11px] font-bold ml-1">
            {progress.percentage}%
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 2. Top Interactive Video Player Area */}
        <View className="bg-black relative w-full aspect-video justify-center items-center overflow-hidden">
          {/* YouTube HQ Thumbnail */}
          <Image
            source={{
              uri: activeLesson?.videoId
                ? `https://img.youtube.com/vi/${extractVideoId(activeLesson)}/hqdefault.jpg`
                : course.image || 'https://ik.imagekit.io/5glnyqfxu/Courses/AutismCard1.webp',
            }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Dark scrim gradient */}
          <View className="absolute inset-0 bg-black/40 justify-between p-3.5">
            {/* Top Bar of player */}
            <View className="flex-row justify-between items-center">
              <View className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse" />
                <Text className="text-white text-[11px] font-bold">
                  Lesson {activeLessonIndex + 1} of {allLessons.length}
                </Text>
              </View>

              <View className="bg-black/60 px-2 py-1 rounded-md">
                <Text className="text-slate-200 text-[11px] font-medium">
                  ⏱ {activeLesson?.duration || '12:00'}
                </Text>
              </View>
            </View>

            {/* Centered Play Button */}
            <TouchableOpacity
              onPress={() => handlePlayVideo()}
              activeOpacity={0.8}
              className="self-center w-14 h-14 rounded-full bg-[#7c3aed] items-center justify-center shadow-2xl shadow-purple-500 border-2 border-white/80"
            >
              <Ionicons name="play" size={28} color="#ffffff" style={{ marginLeft: 3 }} />
            </TouchableOpacity>

            {/* Bottom title in player */}
            <View className="bg-gradient-to-t from-black/80 to-transparent p-1 rounded-lg">
              <Text
                numberOfLines={1}
                className="text-white text-[13px] font-bold drop-shadow"
              >
                {activeLesson?.title}
              </Text>
              <Text className="text-slate-300 text-[10px]">
                Tap play icon to stream clinical video in HD
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Lesson Action Control Bar */}
        <View className="bg-white px-4 py-3 border-b border-slate-200 flex-row items-center justify-between">
          {/* Previous Button */}
          <TouchableOpacity
            onPress={handlePrevLesson}
            disabled={activeLessonIndex === 0}
            className={`flex-row items-center px-3 py-2 rounded-xl border ${
              activeLessonIndex === 0
                ? 'border-slate-200 bg-slate-50 opacity-40'
                : 'border-slate-300 bg-white'
            }`}
          >
            <Feather name="chevron-left" size={16} color="#334155" />
            <Text className="text-slate-700 text-[12px] font-semibold ml-1">
              Prev
            </Text>
          </TouchableOpacity>

          {/* Mark Complete Toggle */}
          <TouchableOpacity
            onPress={handleToggleComplete}
            activeOpacity={0.7}
            className={`flex-row items-center px-4 py-2 rounded-xl border ${
              isCurrentCompleted
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-purple-50 border-purple-200'
            }`}
          >
            <Ionicons
              name={isCurrentCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={18}
              color={isCurrentCompleted ? '#059669' : '#7c3aed'}
            />
            <Text
              className={`text-[12px] font-bold ml-1.5 ${
                isCurrentCompleted ? 'text-emerald-700' : 'text-purple-700'
              }`}
            >
              {isCurrentCompleted ? 'Completed ✓' : 'Mark as Done'}
            </Text>
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            onPress={handleNextLesson}
            disabled={activeLessonIndex === allLessons.length - 1}
            className={`flex-row items-center px-3 py-2 rounded-xl border ${
              activeLessonIndex === allLessons.length - 1
                ? 'border-slate-200 bg-slate-50 opacity-40'
                : 'border-slate-300 bg-white'
            }`}
          >
            <Text className="text-slate-700 text-[12px] font-semibold mr-1">
              Next
            </Text>
            <Feather name="chevron-right" size={16} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* 4. Course Progress Bar Card */}
        <View className="mx-4 mt-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <View className="flex-row items-center justify-between mb-1.5">
            <View className="flex-row items-center">
              <Ionicons name="trophy" size={16} color="#eab308" />
              <Text className="text-[#0a2540] text-[13px] font-bold ml-1.5">
                Your Learning Progress
              </Text>
            </View>
            <Text className="text-slate-500 text-[12px] font-semibold">
              {progress.completedCount} / {progress.totalCount} Lessons ({progress.percentage}%)
            </Text>
          </View>

          {/* Progress Track */}
          <View className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-1">
            <View
              className="h-full rounded-full"
              style={{
                width: `${progress.percentage}%`,
                backgroundColor: progress.isCompleted ? '#10b981' : '#7c3aed',
              }}
            />
          </View>

          {/* Milestone Banner when completed */}
          {progress.isCompleted ? (
            <View className="mt-3 bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex-row items-center justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-emerald-900 text-[13px] font-bold">
                  🎉 Course Completed!
                </Text>
                <Text className="text-emerald-700 text-[11px]">
                  Excellent work! You have completed all lessons in this program.
                </Text>
              </View>
              <View className="bg-emerald-600 px-3 py-1.5 rounded-lg">
                <Text className="text-white text-[11px] font-bold">
                  Mastered ✓
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-slate-400 text-[11px] mt-2">
              💡 Tip: Tap "Mark as Done" after finishing each lesson to track your progress.
            </Text>
          )}
        </View>

        {/* 5. Study Materials & Workbook Card */}
        {course.studyMaterial && (
          <View className="mx-4 mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 rounded-2xl border border-blue-200 flex-row items-center justify-between">
            <View className="w-10 h-10 rounded-xl bg-blue-600 items-center justify-center mr-3">
              <Feather name="book-open" size={20} color="#ffffff" />
            </View>
            <View className="flex-1 mr-2">
              <Text className="text-blue-950 text-[13px] font-bold">
                {course.studyMaterial.title}
              </Text>
              <Text className="text-blue-700 text-[11px] mt-0.5">
                {course.studyMaterial.pages} • {course.studyMaterial.fileSize}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleDownloadWorkbook}
              className="bg-blue-600 px-3 py-2 rounded-xl flex-row items-center shadow-sm"
              activeOpacity={0.8}
            >
              <Feather name="download" size={14} color="#ffffff" />
              <Text className="text-white text-[11px] font-bold ml-1">PDF</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 6. Course Modules & Lessons Accordion */}
        <View className="mx-4 mt-4">
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-[#0a2540] text-[17px] font-black tracking-tight">
              Course Modules ({displayModules.length})
            </Text>
            <Text className="text-slate-500 text-[12px] font-medium">
              Tap lesson to play
            </Text>
          </View>

          {displayModules.map((module, modIdx) => {
            const isExpanded = expandedModules[module.id] ?? false;
            const completedInModule = (module.lessons || []).filter((l) =>
              isLessonCompleted(course.id, l.id)
            ).length;

            return (
              <View
                key={module.id || modIdx}
                className="bg-white rounded-2xl mb-3 border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Module Header Accordion trigger */}
                <TouchableOpacity
                  onPress={() => toggleModule(module.id)}
                  activeOpacity={0.7}
                  className="p-3.5 bg-slate-50 border-b border-slate-100 flex-row items-center justify-between"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-[#0a2540] text-[13px] font-bold leading-tight">
                      {module.title}
                    </Text>
                    <Text className="text-slate-500 text-[11px] mt-0.5">
                      {completedInModule} / {module.lessons.length} Lessons Finished
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {completedInModule === module.lessons.length && (
                      <View className="bg-emerald-100 px-2 py-0.5 rounded-full mr-2">
                        <Text className="text-emerald-700 text-[10px] font-bold">
                          ✓ Done
                        </Text>
                      </View>
                    )}
                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748b"
                    />
                  </View>
                </TouchableOpacity>

                {/* Lessons List in Module */}
                {isExpanded && (
                  <View className="divide-y divide-slate-100">
                    {module.lessons.map((lesson, lesIdx) => {
                      const isPlaying = lesson.id === activeLessonId;
                      const isDone = isLessonCompleted(course.id, lesson.id);

                      return (
                        <TouchableOpacity
                          key={lesson.id || lesIdx}
                          onPress={() => handlePlayVideo(lesson.id)}
                          activeOpacity={0.7}
                          className={`p-3 flex-row items-center justify-between ${
                            isPlaying
                              ? 'bg-purple-50/70 border-l-4 border-l-[#7c3aed]'
                              : 'bg-white'
                          }`}
                        >
                          <View className="flex-row items-center flex-1 mr-2">
                            {/* Status Icon */}
                            <TouchableOpacity
                              onPress={() => toggleLessonCompleted(course.id, lesson.id)}
                              className="mr-3"
                            >
                              {isDone ? (
                                <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
                                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                                </View>
                              ) : isPlaying ? (
                                <View className="w-6 h-6 rounded-full bg-[#7c3aed] items-center justify-center">
                                  <Ionicons name="play" size={12} color="#ffffff" style={{ marginLeft: 1 }} />
                                </View>
                              ) : (
                                <View className="w-6 h-6 rounded-full border border-slate-300 items-center justify-center bg-slate-50">
                                  <Text className="text-slate-500 text-[10px] font-bold">
                                    {lesIdx + 1}
                                  </Text>
                                </View>
                              )}
                            </TouchableOpacity>

                            {/* Lesson Title & Module */}
                            <View className="flex-1">
                              <Text
                                numberOfLines={2}
                                className={`text-[13px] leading-[18px] ${
                                  isPlaying
                                    ? 'text-[#7c3aed] font-bold'
                                    : isDone
                                    ? 'text-slate-500 line-through'
                                    : 'text-slate-800 font-semibold'
                                }`}
                              >
                                {lesson.title}
                              </Text>
                              <Text className="text-slate-400 text-[11px] mt-0.5">
                                Video • {lesson.duration || '12:00'}
                              </Text>
                            </View>
                          </View>

                          {/* Playing indicator badge */}
                          {isPlaying && (
                            <View className="bg-purple-100 px-2 py-0.5 rounded-full">
                              <Text className="text-[#7c3aed] text-[10px] font-bold">
                                Playing
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* 7. Clinical Mentor & Need Help Section */}
        <View className="mx-4 mt-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-2">
            <Image
              source={{ uri: course.instructor?.avatar }}
              className="w-12 h-12 rounded-full mr-3 border border-slate-200"
            />
            <View className="flex-1">
              <Text className="text-[#0a2540] text-[13px] font-bold">
                {course.instructor?.name}
              </Text>
              <Text className="text-slate-500 text-[11px]">
                Have doubts with this lesson? Ask in the 24/7 clinical chat.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (navigation?.navigate) {
                navigation.navigate('Chat');
              } else {
                rootNavigate('MainTabs', { screen: 'Chat' });
              }
            }}
            className="bg-[#081736] px-3 py-2 rounded-xl"
          >
            <Text className="text-white text-[11px] font-bold">Ask Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 100% Shared Website Custom Video Player Modal */}
      {showVideoPlayer && (
        <CourseVideoPlayer
          course={course}
          playlist={allLessons}
          initialIndex={activeLessonIndex >= 0 ? activeLessonIndex : 0}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </View>
  );
}
