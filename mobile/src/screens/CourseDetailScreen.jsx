import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useEnrollment } from '../context/EnrollmentContext';
import { useAuth } from '../context/AuthContext';
import CourseVideoPlayer from '../components/CourseVideoPlayer';
import { navigate as rootNavigate, goBack as rootGoBack } from '../navigation/navigationRef';

// Admin Panel Schema-Aligned Courses Database with YouTube Video IDs
const COURSES_DATABASE = {
  'autism-adhd': {
    id: 'autism-adhd',
    title: 'Autism / ADHD Complete Therapy Program',
    category: 'Autism / ADHD',
    themeColor: '#16a34a',
    mainVideoId: 'aqz-KE-bpKQ',
    lecturesCount: 22,
    language: 'Hindi',
    price: '₹1,299',
    originalPrice: '₹3,999',
    discount: '67% OFF',
    savings: 'Save ₹2,700',
    description:
      'A comprehensive therapy & guidance program designed by certified pediatric specialists to empower parents with sensory regulation techniques, communication boosters, and positive behavioral strategies at home.',
    instructor: {
      name: 'Rehablito Clinical Team',
      role: 'Certified Pediatric Rehabilitation Specialists',
      experience: 'Senior Clinical Mentors',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      bio: 'Leading pediatric neurodevelopmental clinicians specializing in sensory integration, speech stimulation, and holistic family guidance.',
    },
    demoVideos: [
      {
        id: 'demo-1',
        videoId: 'aqz-KE-bpKQ',
        title: 'Understanding Autism vs ADHD: Key Traits & Milestones',
        tag: 'Free Lesson 1',
      },
      {
        id: 'demo-2',
        videoId: 'sBws8MSXN7A',
        title: 'Sensory Overload Signs & Calming Protocols at Home',
        tag: 'Free Lesson 2',
      },
      {
        id: 'demo-3',
        videoId: '1f_33Y4c4b0',
        title: 'Positive Reinforcement for Meltdowns & Tantrums',
        tag: 'Free Lesson 3',
      },
    ],
    studyMaterial: {
      title: 'Autism & ADHD Practical Parent Workbook',
      subtitle: 'Download sensory diet templates, visual routine charts & progress logs.',
      pages: '45 Pages PDF',
      fileSize: '8.4 MB',
    },
    whatYouWillLearn: [
      'Identify sensory triggers and build customized calming sensory diets at home.',
      'Implement visual scheduling & routines to reduce anxiety and transition friction.',
      'Evidence-based communication strategies for non-verbal and verbal children.',
      'Proactive behaviour strategies to prevent meltdowns and encourage co-regulation.',
      'Fine & gross motor exercises for posture, balance, and coordination.',
      'School readiness, teacher collaboration guidelines, and IEP planning tips.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Foundations of Neurodevelopment & Assessment',
        lessons: [
          { title: 'Understanding Autism vs ADHD Spectrum Traits', isFree: true, videoId: 'aqz-KE-bpKQ' },
          { title: 'Brain Development & Sensory Processing Basics', isFree: true, videoId: 'sBws8MSXN7A' },
          { title: 'Setting Realistic Developmental Milestones', isFree: false, videoId: '1f_33Y4c4b0' },
          { title: 'Parent Mindset & Daily Observation Journaling', isFree: false, videoId: 'aqz-KE-bpKQ' },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Sensory Regulation & Calming Protocols',
        lessons: [
          { title: 'Sensory Overload vs Tantrum: Spotting the Difference', isFree: true, videoId: 'sBws8MSXN7A' },
          { title: 'Designing a Daily Sensory Diet at Home', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { title: 'Deep Pressure, Weighted Therapy & Vestibular Activities', isFree: false, videoId: '1f_33Y4c4b0' },
          { title: 'Creating a Low-Sensory Safe Corner in Your Bedroom', isFree: false, videoId: 'sBws8MSXN7A' },
        ],
      },
      {
        id: 3,
        title: 'Module 3: Communication Boosters & Social Engagement',
        lessons: [
          { title: 'Non-Verbal Gestures & Picture Exchange (PECS)', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { title: 'Joint Attention & Eye Contact Play Techniques', isFree: false, videoId: 'sBws8MSXN7A' },
          { title: 'Encouraging First Words & Sentence Expansion', isFree: false, videoId: '1f_33Y4c4b0' },
          { title: 'Peer Play & Turn-Taking Activities at Home', isFree: false, videoId: 'aqz-KE-bpKQ' },
        ],
      },
      {
        id: 4,
        title: 'Module 4: Behavior Management & Emotional Regulation',
        lessons: [
          { title: 'Positive Reinforcement Systems That Actually Work', isFree: true, videoId: '1f_33Y4c4b0' },
          { title: 'De-escalation Steps During Meltdowns', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { title: 'Handling Aggression & Self-Soothing Habits', isFree: false, videoId: 'sBws8MSXN7A' },
          { title: 'Reward Charts & Token Economies', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
      {
        id: 5,
        title: 'Module 5: Daily Living Skills, School & Beyond',
        lessons: [
          { title: 'Stress-Free Morning & Bedtime Routines', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { title: 'Toilet Training & Sensory-Friendly Grooming', isFree: false, videoId: 'sBws8MSXN7A' },
          { title: 'School Transition & Advocating with Teachers', isFree: false, videoId: '1f_33Y4c4b0' },
          { title: 'Long-term Progress Milestones for Parents', isFree: false, videoId: 'aqz-KE-bpKQ' },
        ],
      },
    ],
  },
  'speech-therapy': {
    id: 'speech-therapy',
    title: 'Speech & Language Therapy for Children',
    category: 'Speech Therapy',
    themeColor: '#0284c7',
    mainVideoId: 'sBws8MSXN7A',
    lecturesCount: 18,
    language: 'Hindi',
    price: '₹1,199',
    originalPrice: '₹3,499',
    discount: '65% OFF',
    savings: 'Save ₹2,300',
    description:
      'Step-by-step oral motor, articulation, and language development exercises to help non-verbal and speech-delayed children speak with clarity and confidence.',
    instructor: {
      name: 'Rehablito Clinical Team',
      role: 'Speech-Language Pathologists & Therapy Mentors',
      experience: 'Senior Speech Specialists',
      avatar: 'https://images.unsplash.com/photo-1594824813593-c9069d519448?w=150&auto=format&fit=crop&q=80',
      bio: 'Certified speech pathologists with extensive experience in pediatric articulation, stuttering, and developmental language delay.',
    },
    demoVideos: [
      {
        id: 'speech-demo-1',
        videoId: 'sBws8MSXN7A',
        title: 'Oral Motor Play & Tongue Gym Exercises',
        tag: 'Free Lesson 1',
      },
      {
        id: 'speech-demo-2',
        videoId: 'aqz-KE-bpKQ',
        title: 'Encouraging First Words Through Everyday Play',
        tag: 'Free Lesson 2',
      },
    ],
    studyMaterial: {
      title: 'Speech Sound Cards & Articulation Chart',
      subtitle: 'Printable flashcards, phonics worksheets & home speech practice timetable.',
      pages: '38 Pages PDF',
      fileSize: '6.2 MB',
    },
    whatYouWillLearn: [
      'Stimulate speech sounds and vowel articulation with fun mouth games.',
      'Techniques for late talkers and speech delay intervention.',
      'Eliminate articulation errors and clarify pronunciation.',
      'Expand vocabulary from single words to 2-3 word sentences.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Speech Development Milestones',
        lessons: [
          { title: 'Assessing Your Child’s Current Language Level', isFree: true, videoId: 'sBws8MSXN7A' },
          { title: 'Oral Motor Strength & Breath Control Play', isFree: true, videoId: 'aqz-KE-bpKQ' },
          { title: 'Creating a Language-Rich Environment', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
      {
        id: 2,
        title: 'Module 2: Pronunciation & Sound Articulation',
        lessons: [
          { title: 'Mastering Early Consonants (P, B, M, T, D)', isFree: false, videoId: 'sBws8MSXN7A' },
          { title: 'Correcting Tongue-Tie & Slurred Sounds', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { title: 'Daily Home Practice Drill', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
    ],
  },
  'occupational-therapy': {
    id: 'occupational-therapy',
    title: 'Occupational Therapy & Motor Skills Mastery',
    category: 'Occupational Therapy',
    themeColor: '#ea580c',
    mainVideoId: '1f_33Y4c4b0',
    lecturesCount: 16,
    language: 'Hindi',
    price: '₹1,199',
    originalPrice: '₹3,299',
    discount: '63% OFF',
    savings: 'Save ₹2,100',
    description:
      'Build fine motor grasp, hand-eye coordination, balance, and independence in daily living activities like eating, writing, and dressing.',
    instructor: {
      name: 'Rehablito Clinical Team',
      role: 'Occupational Therapists & Child Development Experts',
      experience: 'Senior Occupational Specialists',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      bio: 'Specialists in sensory integration, hand skill development, and assistive daily living strategies for children.',
    },
    demoVideos: [
      {
        id: 'ot-demo-1',
        videoId: '1f_33Y4c4b0',
        title: 'Pencil Grasp & Finger Strength Play with Clay',
        tag: 'Free Lesson 1',
      },
    ],
    studyMaterial: {
      title: 'Occupational Therapy Activity Workbook',
      subtitle: '50+ indoor sensory-motor games, scissor cutting sheets & grip worksheets.',
      pages: '40 Pages PDF',
      fileSize: '7.1 MB',
    },
    whatYouWillLearn: [
      'Develop tripod pencil grip and neat handwriting posture.',
      'Scissor cutting, buttoning shirts, and shoe tying step-by-step.',
      'Sensory-friendly eating habits and utensil management.',
      'Gross motor coordination, jumping, and balance games.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Fine Motor & Hand Strength',
        lessons: [
          { title: 'Hand Muscle Strengthening Without Expensive Toys', isFree: true, videoId: '1f_33Y4c4b0' },
          { title: 'Pencil Grasp Stages & Progression', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { title: 'Bilateral Coordination & Hand Dominance', isFree: false, videoId: 'sBws8MSXN7A' },
        ],
      },
    ],
  },
  'behaviour-therapy': {
    id: 'behaviour-therapy',
    title: 'Positive Behaviour Therapy & Emotional Regulation',
    category: 'Behaviour Therapy',
    themeColor: '#7c3aed',
    mainVideoId: 'aqz-KE-bpKQ',
    lecturesCount: 14,
    language: 'Hindi',
    price: '₹999',
    originalPrice: '₹2,999',
    discount: '66% OFF',
    savings: 'Save ₹2,000',
    description:
      'Scientifically proven behavioral strategies (positive reinforcement) to handle aggression, defiance, anxiety, and screen addiction in children.',
    instructor: {
      name: 'Rehablito Clinical Team',
      role: 'Child Behavior Analysts & Family Counselors',
      experience: 'Senior Behavior Specialists',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      bio: 'Passionate about gentle parenting, neurodiversity affirmation, and emotional resilience in developing children.',
    },
    demoVideos: [
      {
        id: 'bt-demo-1',
        videoId: 'aqz-KE-bpKQ',
        title: 'Why Tantrums Happen: The ABC of Behavior',
        tag: 'Free Lesson 1',
      },
    ],
    studyMaterial: {
      title: 'Behavior Modification & Routine Builder Toolkit',
      subtitle: 'Printable token economy boards, visual emotion scales & calm-down cards.',
      pages: '32 Pages PDF',
      fileSize: '5.5 MB',
    },
    whatYouWillLearn: [
      'Identify triggers of aggressive behaviour and prevent escalation.',
      'Replace shouting with positive reinforcement and structured routines.',
      'Reduce screen time tantrums and build engaging offline hobbies.',
      'Nurture emotional intelligence and self-regulation in children.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: The Science of Child Behavior',
        lessons: [
          { title: 'The ABC Model: Antecedent, Behavior, Consequence', isFree: true, videoId: 'aqz-KE-bpKQ' },
          { title: 'Co-regulation vs Punishment: What Actually Works', isFree: false, videoId: 'sBws8MSXN7A' },
          { title: 'Managing Aggression, Biting & Screaming', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
    ],
  },
  'special-education': {
    id: 'special-education',
    title: 'Special Education & Cognitive Learning Support',
    category: 'Special Education',
    themeColor: '#d97706',
    mainVideoId: 'sBws8MSXN7A',
    lecturesCount: 15,
    language: 'Hindi',
    price: '₹1,099',
    originalPrice: '₹3,199',
    discount: '65% OFF',
    savings: 'Save ₹2,100',
    description:
      'Customized learning frameworks, multisensory math and reading techniques for children with ADHD, Dyslexia, and developmental learning differences.',
    instructor: {
      name: 'Rehablito Clinical Team',
      role: 'Special Educators & Remedial Tutors',
      experience: 'Senior Education Mentors',
      avatar: 'https://images.unsplash.com/photo-1594824813593-c9069d519448?w=150&auto=format&fit=crop&q=80',
      bio: 'Specialists in remedial education, phonics for dyslexia, and structured academic accommodation for special needs.',
    },
    demoVideos: [
      {
        id: 'se-demo-1',
        videoId: 'sBws8MSXN7A',
        title: 'Multisensory Phonics & Reading Made Easy',
        tag: 'Free Lesson 1',
      },
    ],
    studyMaterial: {
      title: 'Multisensory Phonics & Math Worksheets',
      subtitle: 'Dyslexia-friendly reading cards, number charts & learning games.',
      pages: '42 Pages PDF',
      fileSize: '7.8 MB',
    },
    whatYouWillLearn: [
      'Teach reading and phonics through visual and tactile methods.',
      'Simplify number concepts and math calculations.',
      'Adapt school curriculum and work with teachers on IEP goals.',
      'Boost memory retention and focus through fun educational games.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Learning Styles & Assessment',
        lessons: [
          { title: 'Identifying Visual, Auditory & Kinesthetic Learners', isFree: true, videoId: 'sBws8MSXN7A' },
          { title: 'Multisensory Phonics Breakdown', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { title: 'Memory Boosting Games for Kids', isFree: false, videoId: '1f_33Y4c4b0' },
        ],
      },
    ],
  },
  'pediatric-rehab': {
    id: 'pediatric-rehab',
    title: 'Pediatric Rehabilitation & Holistic Child Development',
    category: 'Pediatric Rehabilitation',
    themeColor: '#0d9488',
    mainVideoId: '1f_33Y4c4b0',
    lecturesCount: 14,
    language: 'Hindi',
    price: '₹1,199',
    originalPrice: '₹3,499',
    discount: '65% OFF',
    savings: 'Save ₹2,300',
    description:
      'Comprehensive physical, sensory, and cognitive rehabilitation protocols to help children reach developmental milestones and thrive with joy.',
    instructor: {
      name: 'Rehablito Clinical Team',
      role: 'Pediatric Physiotherapists & Clinical Mentors',
      experience: 'Senior Rehabilitation Specialists',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      bio: 'Dedicated to pediatric gait training, developmental rehabilitation, and comprehensive physical therapy.',
    },
    demoVideos: [
      {
        id: 'pr-demo-1',
        videoId: '1f_33Y4c4b0',
        title: 'Posture, Core Strength & Balance Exercises at Home',
        tag: 'Free Lesson 1',
      },
    ],
    studyMaterial: {
      title: 'Pediatric Rehabilitation Routine & Exercise Guide',
      subtitle: 'Illustrated posture exercises, gait exercises & daily physical log sheets.',
      pages: '36 Pages PDF',
      fileSize: '6.9 MB',
    },
    whatYouWillLearn: [
      'Home exercise protocols for muscle tone, posture, and coordination.',
      'Gait training, balance exercises, and safe jumping play.',
      'Daily ergonomics for feeding, sitting, and studying postures.',
      'Holistic milestone tracking across motor and cognitive domains.',
    ],
    curriculum: [
      {
        id: 1,
        title: 'Module 1: Physical Development & Posture',
        lessons: [
          { title: 'Core Muscle Assessment for Children', isFree: true, videoId: '1f_33Y4c4b0' },
          { title: 'Fun Balance Exercises with Therapy Balls', isFree: false, videoId: 'aqz-KE-bpKQ' },
          { title: 'Correcting Postural Asymmetries', isFree: false, videoId: 'sBws8MSXN7A' },
        ],
      },
    ],
  },
};

export default function CourseDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const passedParam = route?.params?.course;
  const initialCourseId = passedParam?.id || route?.params?.courseId || route?.params?.id || 'autism-adhd';

  const [remoteCourse, setRemoteCourse] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // If course not passed in params and not in static preset, fetch real-time from Firestore
  useEffect(() => {
    if (!passedParam && !COURSES_DATABASE[initialCourseId]) {
      setLoadingDoc(true);
      getDoc(doc(db, 'courseVideos', initialCourseId))
        .then((snap) => {
          if (snap.exists()) {
            setRemoteCourse({ id: snap.id, ...snap.data() });
          }
        })
        .catch((err) => console.warn('Error fetching course:', err))
        .finally(() => setLoadingDoc(false));
    }
  }, [initialCourseId, passedParam]);

  // Resolve course safely from database using ID or default to 'autism-adhd'
  const course = useMemo(() => {
    const source = passedParam || remoteCourse;
    const courseId = source?.id || initialCourseId || 'autism-adhd';
    const baseData = COURSES_DATABASE[courseId] || COURSES_DATABASE['autism-adhd'];

    // If Firestore lectures exist, construct modules dynamically
    let dynamicCurriculum = baseData.curriculum;
    const rawLectures = source?.lectures;
    if (Array.isArray(rawLectures) && rawLectures.length > 0) {
      dynamicCurriculum = [
        {
          id: 1,
          title: 'Course Masterclass Lectures',
          lessons: rawLectures.map((lec, idx) => ({
            id: String(lec.id || idx + 1),
            title: lec.title || `Lecture ${idx + 1}`,
            videoId: lec.videoId || lec.url,
            isFree: idx === 0, // First lecture preview
            duration: lec.duration || 'Video Lesson',
          })),
        },
      ];
    }

    const priceFormatted = source?.price
      ? (String(source.price).startsWith('₹') ? source.price : `₹${source.price}`)
      : baseData.price;

    const originalPriceFormatted = source?.originalPrice
      ? (String(source.originalPrice).startsWith('₹') ? source.originalPrice : `₹${source.originalPrice}`)
      : baseData.originalPrice;

    const lecturesCount = Array.isArray(rawLectures) && rawLectures.length > 0
      ? rawLectures.length
      : baseData.lecturesCount;

    return {
      ...baseData,
      ...source,
      id: courseId,
      title: source?.title || baseData.title,
      price: priceFormatted,
      originalPrice: originalPriceFormatted,
      lecturesCount: lecturesCount,
      description: source?.description || baseData.description,
      subtitle: source?.subtitle || source?.description || baseData.description,
      themeColor: source?.themeColor || baseData.themeColor,
      category: source?.category || baseData.category,
      curriculum: dynamicCurriculum,
      mainVideoId: source?.mainVideoId || source?.videoId || baseData.mainVideoId,
      demoVideos:
        Array.isArray(source?.demoVideos) && source.demoVideos.length > 0
          ? source.demoVideos
          : baseData.demoVideos,
      studyMaterial: {
        title: source?.studyMaterial?.title || `${source?.title || baseData.title} Practical Parent Workbook`,
        subtitle: source?.studyMaterial?.subtitle || 'Clinical diet templates, routine charts & therapist guidance logs.',
        pages: source?.studyMaterial?.pages || '42 Pages PDF',
        fileSize: source?.studyMaterial?.fileSize || '7.8 MB',
      },
    };
  }, [passedParam, remoteCourse, initialCourseId]);

  const [expandedModule, setExpandedModule] = useState(1);
  const { isCourseEnrolled, enrollInCourse } = useEnrollment();
  const { currentUser, openAuthModal } = useAuth();
  const isEnrolled = isCourseEnrolled(course.id);
  const [playingVideo, setPlayingVideo] = useState(null);

  const toggleModule = (id) => {
    setExpandedModule((prev) => (prev === id ? null : id));
  };

  const handleEnroll = () => {
    if (isEnrolled) {
      if (navigation?.navigate) {
        navigation.navigate('CoursePlayer', { courseId: course.id, course });
      } else {
        rootNavigate('CoursePlayer', { courseId: course.id, course });
      }
      return;
    }

    // Require Login or Signup before purchasing / enrolling
    if (!currentUser) {
      openAuthModal('signup', () => {
        executeEnrollment();
      });
      return;
    }

    executeEnrollment();
  };

  const executeEnrollment = () => {
    Alert.alert(
      '🎉 Enroll in Course',
      `Complete enrollment for "${course.title}" at ${course.price} (${course.discount || 'Special Offer'})?\n\nIncludes lifetime access, video lessons, downloadable PDF workbook, and clinical guidance.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Enroll Now',
          onPress: async () => {
            await enrollInCourse(course.id, course);
            Alert.alert(
              '🎉 Congratulations!',
              `You have successfully enrolled in ${course.title}! Taking you to your course video player now...`,
              [
                {
                  text: 'Open Course',
                  onPress: () => {
                    if (navigation?.navigate) {
                      navigation.navigate('CoursePlayer', { courseId: course.id, course });
                    } else {
                      rootNavigate('CoursePlayer', { courseId: course.id, course });
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handlePlayDemoVideo = (video) => {
    setPlayingVideo(video);
  };

  const handleDownloadMaterial = () => {
    if (course.driveLink) {
      Linking.openURL(course.driveLink).catch(() => {
        Alert.alert('Study Material', 'Opening material link: ' + course.driveLink);
      });
      return;
    }
    Alert.alert(
      '📥 Download Study Material',
      `"${course.studyMaterial.title}" (${course.studyMaterial.fileSize}) is ready. Would you like to save this PDF?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download PDF',
          onPress: () => {
            Alert.alert('✅ Download Started', 'The PDF workbook is downloading to your device.');
          },
        },
      ]
    );
  };

  // Helper for YouTube thumbnail template
  const getYouTubeThumbnail = (videoId, quality = 'hqdefault') => {
    if (!videoId) return 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80';
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Top Floating Header - Clean without Share and Save */}
      <View
        style={{ paddingTop: Math.max(insets.top, 12) + 6 }}
        className="px-4 pb-3 bg-[#081736] flex-row items-center justify-between z-30 border-b border-slate-800"
      >
        {/* Left: Back Button */}
        <TouchableOpacity
          onPress={() => {
            if (navigation?.canGoBack && navigation.canGoBack()) {
              navigation.goBack();
            } else if (navigation?.navigate) {
              navigation.navigate('MainTabs');
            } else {
              rootGoBack();
            }
          }}
          activeOpacity={0.8}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/15"
        >
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>

        {/* Center: Title / Brand */}
        <View className="flex-1 items-center pr-10">
          <Text className="text-white text-[15px] font-black tracking-tight">
            Course Overview
          </Text>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* 1. Course Hero Banner (Navy Blue) - Clean without Rating/Reviews & strictly Hindi */}
        <View className="bg-[#081736] px-4 pt-4 pb-8 relative overflow-hidden">
          {/* Decorative ambient background glows */}
          <View
            style={styles.glowPink}
            className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[#E6007E]"
          />
          <View
            style={styles.glowYellow}
            className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-[#FFD60A]"
          />

          {/* Category Badge & Breadcrumbs */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="px-3 py-1 rounded-full bg-[#FFD60A]">
              <Text className="text-[#0F1B3D] text-[10px] font-black uppercase tracking-wider">
                {course.category}
              </Text>
            </View>
            <Text className="text-slate-400 text-[11px] font-bold">/</Text>
            <Text className="text-slate-300 text-[11px] font-semibold flex-1" numberOfLines={1}>
              Rehablito Certified Program
            </Text>
          </View>

          {/* Main Course Title */}
          <Text className="text-white text-[23px] font-black leading-[29px] mb-2.5">
            {course.title}
          </Text>

          {/* Description */}
          <Text className="text-slate-300 text-[13px] leading-[19px] font-normal mb-4">
            {course.description}
          </Text>

          {/* Meta Tags Row - No Reviews, Language is Hindi */}
          <View className="flex-row flex-wrap items-center gap-2.5">
            {/* Certified */}
            <View className="flex-row items-center bg-emerald-500/15 px-3 py-1.5 rounded-full border border-emerald-400/20">
              <MaterialCommunityIcons name="shield-check" size={14} color="#63DA6B" />
              <Text className="text-emerald-300 text-[11px] font-bold ml-1">
                Certified Expert Guidance
              </Text>
            </View>

            {/* Language - Hindi only */}
            <View className="flex-row items-center bg-sky-500/15 px-3 py-1.5 rounded-full border border-sky-400/20">
              <Feather name="globe" size={12} color="#40D6EF" />
              <Text className="text-sky-300 text-[11px] font-bold ml-1">
                Hindi
              </Text>
            </View>

            {/* Total Lectures */}
            <View className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
              <Feather name="play-circle" size={12} color="#FFD60A" />
              <Text className="text-white text-[11px] font-bold ml-1">
                {course.lecturesCount} Lessons
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Mobile Pricing & Access Card */}
        <View className="px-4 -mt-5 mb-5 z-20">
          <View
            style={styles.pricingCard}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-md"
          >
            {/* Special Offer Header */}
            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <View className="flex-row items-center gap-1.5">
                <View className="w-6 h-6 rounded-full bg-amber-50 items-center justify-center">
                  <Feather name="zap" size={13} color="#d97706" />
                </View>
                <Text className="text-slate-900 text-[12px] font-extrabold">
                  Special Enrolment Offer
                </Text>
              </View>

              <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Text className="text-emerald-700 text-[10.5px] font-black">
                  {course.discount}
                </Text>
              </View>
            </View>

            {/* Price Row */}
            <View className="flex-row items-baseline mb-3">
              <Text className="text-[#081736] text-[28px] font-black mr-2.5">
                {course.price}
              </Text>
              <Text className="text-slate-400 text-[14px] line-through font-semibold mr-2">
                {course.originalPrice}
              </Text>
              <Text className="text-emerald-600 text-[11px] font-bold">
                {course.savings}
              </Text>
            </View>

            {/* Features Checklist */}
            <View className="space-y-2 mb-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="checkmark-circle" size={15} color="#16a34a" />
                <Text className="text-slate-700 text-[11.5px] font-medium ml-2">
                  Full Lifetime Access to all {course.lecturesCount} Lessons
                </Text>
              </View>
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="checkmark-circle" size={15} color="#16a34a" />
                <Text className="text-slate-700 text-[11.5px] font-medium ml-2">
                  Downloadable Practical Parent Workbook (PDF)
                </Text>
              </View>
              <View className="flex-row items-center mb-1.5">
                <Ionicons name="checkmark-circle" size={15} color="#16a34a" />
                <Text className="text-slate-700 text-[11.5px] font-medium ml-2">
                  Interactive Step-by-Step Clinical Guidance
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={15} color="#16a34a" />
                <Text className="text-slate-700 text-[11.5px] font-medium ml-2">
                  Access on Mobile, Tablet & Desktop
                </Text>
              </View>
            </View>

            {/* Big Action Button */}
            <TouchableOpacity
              onPress={handleEnroll}
              activeOpacity={0.85}
              style={[
                styles.enrollPrimaryBtn,
                { backgroundColor: isEnrolled ? '#16a34a' : '#081736' },
              ]}
              className="w-full py-3.5 rounded-2xl flex-row items-center justify-center shadow-lg"
            >
              <Feather
                name={isEnrolled ? 'check-circle' : 'shopping-bag'}
                size={16}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text className="text-white text-[14px] font-black">
                {isEnrolled ? 'Access All Course Modules' : `Enroll Now for ${course.price}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Course Introduction Video Preview - YouTube Template */}
        <View className="px-4 mb-5">
          <View className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm">
            <View className="p-4 border-b border-slate-100 flex-row items-center justify-between bg-slate-50/70">
              <View className="flex-row items-center gap-2">
                <Feather name="play-circle" size={18} color="#081736" />
                <Text className="text-slate-900 text-[14px] font-black">
                  Course Introduction Video
                </Text>
              </View>
              <View className="bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                <Text className="text-[#0284c7] text-[10px] font-bold">
                  Free Preview
                </Text>
              </View>
            </View>

            {/* Video Thumbnail Container with YouTube Template */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                handlePlayDemoVideo({
                  title: `${course.title} - Introduction`,
                  videoId: course.mainVideoId,
                })
              }
              className="relative aspect-video bg-black items-center justify-center overflow-hidden group"
            >
              <Image
                source={{ uri: getYouTubeThumbnail(course.mainVideoId, 'maxresdefault') }}
                style={styles.videoIntroImage}
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/35" />

              {/* Red YouTube-style Play Button */}
              <View
                style={styles.youtubePlayBtn}
                className="w-16 h-12 rounded-2xl bg-[#FF0000] items-center justify-center shadow-2xl"
              >
                <Ionicons name="play" size={24} color="#ffffff" style={{ marginLeft: 3 }} />
              </View>

              <View className="absolute bottom-3 left-3 bg-black/75 px-3 py-1 rounded-full border border-white/20">
                <Text className="text-white text-[10.5px] font-bold">
                  Tap to Watch Free Introduction
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Study Material & Notes Download Card */}
        <View className="px-4 mb-5">
          <View className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-12 h-12 bg-sky-50 rounded-2xl items-center justify-center border border-sky-100">
                <Feather name="file-text" size={22} color="#0284c7" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 text-[14px] font-black">
                  {course.studyMaterial.title}
                </Text>
                <Text className="text-slate-500 text-[11px] leading-[15px] font-medium mt-0.5">
                  {course.studyMaterial.subtitle}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-2 border-t border-slate-100">
              <View className="flex-row items-center gap-2">
                <View className="bg-slate-100 px-2 py-0.5 rounded">
                  <Text className="text-slate-600 text-[10px] font-bold">
                    {course.studyMaterial.pages}
                  </Text>
                </View>
                <Text className="text-slate-400 text-[10px]">• {course.studyMaterial.fileSize}</Text>
              </View>

              <TouchableOpacity
                onPress={handleDownloadMaterial}
                activeOpacity={0.85}
                className="bg-[#081736] px-4 py-2 rounded-xl flex-row items-center shadow-sm"
              >
                <Feather name="download" size={13} color="#ffffff" style={{ marginRight: 4 }} />
                <Text className="text-white text-[11px] font-bold">
                  Download Sample PDF
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. Free Starter Lessons Grid - YouTube Template & No Mins */}
        {course.demoVideos && course.demoVideos.length > 0 && (
          <View className="px-4 mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[#081736] text-[16px] font-black">
                Free Starter Lessons
              </Text>
              <Text className="text-[#0284c7] text-[11px] font-bold">
                {course.demoVideos.length} Free Videos
              </Text>
            </View>

            <View className="space-y-3">
              {course.demoVideos.map((video, idx) => (
                <TouchableOpacity
                  key={video.id || idx}
                  activeOpacity={0.85}
                  onPress={() => handlePlayDemoVideo(video)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex-row items-center p-2.5"
                >
                  {/* YouTube Thumbnail Template */}
                  <View className="w-24 h-16 rounded-xl overflow-hidden relative bg-slate-900 mr-3">
                    <Image
                      source={{ uri: getYouTubeThumbnail(video.videoId, 'hqdefault') }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-black/30 items-center justify-center">
                      <View className="w-7 h-7 rounded-full bg-red-600 items-center justify-center shadow">
                        <Ionicons name="play" size={13} color="#ffffff" style={{ marginLeft: 2 }} />
                      </View>
                    </View>
                  </View>

                  {/* Video Info */}
                  <View className="flex-1 pr-1">
                    <View className="bg-emerald-50 self-start px-2 py-0.5 rounded border border-emerald-200 mb-1">
                      <Text className="text-emerald-700 text-[9px] font-black uppercase">
                        {video.tag || `Free Lesson ${idx + 1}`}
                      </Text>
                    </View>
                    <Text className="text-slate-900 text-[12px] font-bold leading-[16px]" numberOfLines={2}>
                      {video.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 6. Course Curriculum / Syllabus Accordion (No Mins, matching Admin Panel) */}
        <View className="px-4 mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[#081736] text-[16px] font-black">
              Course Curriculum
            </Text>
            <Text className="text-slate-500 text-[11px] font-semibold">
              {course.curriculum.length} Modules • {course.lecturesCount} Lectures
            </Text>
          </View>

          <View className="space-y-2.5">
            {course.curriculum.map((mod) => {
              const isExpanded = expandedModule === mod.id;
              return (
                <View
                  key={mod.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm mb-2.5"
                >
                  {/* Module Header - No Mins */}
                  <TouchableOpacity
                    onPress={() => toggleModule(mod.id)}
                    activeOpacity={0.8}
                    className="p-3.5 flex-row items-center justify-between bg-slate-50/80"
                  >
                    <View className="flex-1 pr-2">
                      <Text className="text-slate-900 text-[13px] font-bold mb-0.5">
                        {mod.title}
                      </Text>
                      <Text className="text-slate-500 text-[10.5px]">
                        {mod.lessons.length} Lectures
                      </Text>
                    </View>
                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#64748b"
                    />
                  </TouchableOpacity>

                  {/* Expanded Lessons List - No Mins */}
                  {isExpanded && (
                    <View className="px-3.5 py-2 border-t border-slate-100 bg-white">
                      {mod.lessons.map((topic, tIdx) => (
                        <TouchableOpacity
                          key={tIdx}
                          activeOpacity={0.8}
                          onPress={() => {
                            if (isEnrolled) {
                              if (navigation?.navigate) {
                                navigation.navigate('CoursePlayer', {
                                  courseId: course.id,
                                  course,
                                  initialLessonId: topic.id,
                                });
                              } else {
                                rootNavigate('CoursePlayer', {
                                  courseId: course.id,
                                  course,
                                  initialLessonId: topic.id,
                                });
                              }
                            } else if (topic.isFree) {
                              handlePlayDemoVideo(topic);
                            } else {
                              handleEnroll();
                            }
                          }}
                          className="flex-row items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
                        >
                          <View className="flex-row items-center flex-1 pr-2">
                            <Ionicons
                              name={
                                topic.isFree || isEnrolled
                                  ? 'play-circle-outline'
                                  : 'lock-closed-outline'
                              }
                              size={17}
                              color={topic.isFree || isEnrolled ? '#0284c7' : '#94a3b8'}
                              style={{ marginRight: 8 }}
                            />
                            <Text
                              className={`text-[12px] font-medium flex-1 ${
                                topic.isFree || isEnrolled ? 'text-slate-800' : 'text-slate-600'
                              }`}
                            >
                              {topic.title}
                            </Text>
                          </View>

                          <View className="flex-row items-center">
                            {topic.isFree && !isEnrolled ? (
                              <View className="bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                                <Text className="text-[#0284c7] text-[9px] font-bold">
                                  Free Preview
                                </Text>
                              </View>
                            ) : (
                              <View className="bg-slate-100 px-2 py-0.5 rounded">
                                <Text className="text-slate-400 text-[9px] font-medium">
                                  Lecture {tIdx + 1}
                                </Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* 7. What You'll Learn Checkmarks */}
        <View className="px-4 mb-5">
          <Text className="text-[#081736] text-[16px] font-black mb-3">
            What You'll Learn in This Program
          </Text>
          <View className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            {course.whatYouWillLearn.map((item, index) => (
              <View key={index} className="flex-row items-start mb-2.5 last:mb-0">
                <View className="w-5 h-5 rounded-full bg-emerald-50 items-center justify-center mr-2.5 mt-0.5 border border-emerald-200">
                  <Ionicons name="checkmark" size={12} color="#16a34a" />
                </View>
                <Text className="text-slate-700 text-[12px] leading-[17px] flex-1 font-medium">
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 8. Specialist Mentor Card - No Dr name */}
        <View className="px-4 mb-6">
          <Text className="text-[#081736] text-[16px] font-black mb-3">
            Your Clinical Guidance Team
          </Text>
          <View className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex-row items-start">
            <Image
              source={{ uri: course.instructor.avatar }}
              style={styles.instructorAvatar}
              className="rounded-2xl mr-3.5 border border-slate-200 shadow-sm"
            />
            <View className="flex-1">
              <View className="flex-row items-center mb-0.5">
                <Text className="text-slate-900 text-[13.5px] font-black mr-1.5">
                  {course.instructor.name}
                </Text>
                <Ionicons name="checkmark-circle" size={14} color="#0284c7" />
              </View>
              <Text className="text-slate-600 text-[11px] font-medium leading-[15px]">
                {course.instructor.role}
              </Text>
              <Text className="text-[#0284c7] text-[10.5px] font-bold mt-1">
                {course.instructor.experience}
              </Text>
              <Text className="text-slate-500 text-[10px] leading-[14px] mt-1.5 font-normal">
                {course.instructor.bio}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 9. Fixed Bottom Sticky Bar for Instant Enrollment */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 12) + 6 },
        ]}
        className="absolute bottom-0 left-0 right-0 bg-white px-4 pt-3 border-t border-slate-200/90 flex-row items-center justify-between shadow-2xl z-40"
      >
        {/* Left: Price Display */}
        <View>
          <View className="flex-row items-baseline">
            <Text className="text-[#081736] text-[22px] font-black mr-2">
              {course.price}
            </Text>
            <Text className="text-slate-400 text-[12px] line-through font-semibold">
              {course.originalPrice}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-emerald-600 text-[10.5px] font-bold mr-1.5">
              {course.discount}
            </Text>
            <Text className="text-slate-400 text-[10px]">• Lifetime Access</Text>
          </View>
        </View>

        {/* Right: Primary Enroll CTA */}
        <TouchableOpacity
          onPress={handleEnroll}
          activeOpacity={0.85}
          style={[
            styles.enrollCtaButton,
            { backgroundColor: isEnrolled ? '#16a34a' : '#081736' },
          ]}
          className="px-6 py-3.5 rounded-2xl flex-row items-center shadow-lg"
        >
          <Text className="text-white text-[14px] font-black mr-1.5">
            {isEnrolled ? 'Open Course' : 'Enroll Now'}
          </Text>
          <Feather name="arrow-right" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Shared Custom Video Player */}
      {playingVideo && (
        <CourseVideoPlayer
          course={course}
          playlist={[
            {
              id: playingVideo.id || 'demo',
              title: playingVideo.title || course.title,
              videoId: playingVideo.videoId || course.mainVideoId || 'aqz-KE-bpKQ',
            },
          ]}
          initialIndex={0}
          onClose={() => setPlayingVideo(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  glowPink: {
    opacity: 0.15,
  },
  glowYellow: {
    opacity: 0.12,
  },
  pricingCard: {
    shadowColor: '#081736',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  enrollPrimaryBtn: {
    shadowColor: '#081736',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  videoIntroImage: {
    width: '100%',
    height: '100%',
  },
  youtubePlayBtn: {
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  instructorAvatar: {
    width: 52,
    height: 52,
  },
  bottomBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  enrollCtaButton: {
    shadowColor: '#081736',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
});
