import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'slide-1',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/heroimg2.webp',
    tag: 'Learn • Understand • Support',
    tagBg: '#e0f7ea',
    tagBorder: '#c2f0d5',
    tagColor: '#059669',
    title: 'Helping Every Child\nReach Their Potential',
    titleSize: 22,
    subtitle: 'Expert-guided therapy courses for parents, by professionals.',
    buttonText: 'Explore Courses',
    imageShift: -30,
  },
  {
    id: 'slide-2',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/hero2.webp',
    tag: 'Care • Growth • Guidance',
    tagBg: '#eff6ff',
    tagBorder: '#bfdbfe',
    tagColor: '#0284c7',
    title: 'Early Care\nMade Simple',
    titleSize: 18,
    subtitle: 'Practical guidance by certified specialists.',
    buttonText: 'Get Started',
    imageShift: -10,
  },
  {
    id: 'slide-3',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/hero3.webp',
    tag: 'Play • Learn • Thrive',
    tagBg: '#faf5ff',
    tagBorder: '#e9d5ff',
    tagColor: '#7c3aed',
    title: 'Transforming Lives\nStep by Step',
    titleSize: 20,
    subtitle: 'Proven pediatric therapies tailored for home practice.',
    buttonText: 'Discover More',
    imageShift: -15,
  },
  {
    id: 'slide-4',
    image: 'https://ik.imagekit.io/5glnyqfxu/Courses/hero4.webp',
    tag: 'Compassion • Guidance • Hope',
    tagBg: '#fffbeb',
    tagBorder: '#fef3c7',
    tagColor: '#d97706',
    title: 'Bright Futures\nBegin Here',
    titleSize: 20,
    subtitle: 'Empowering parents with expert developmental guidance.',
    buttonText: 'Explore All',
    imageShift: -15,
  },
];

export default function HeroSection({ onExplorePress }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const activeIndexRef = useRef(0);

  // Keep activeIndexRef in sync
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Automatic Smooth Carousel Auto-Play
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % SLIDES.length;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3800); // Transitions every 3.8 seconds

    return () => clearInterval(timer);
  }, []);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const handleDotPress = (index) => {
    setActiveIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  return (
    <View className="mb-6 -mx-4">
      {/* Full-Screen Edge-to-Edge 4-Slide Auto-Playing Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.id}
            style={[styles.slideContainer, { width: SCREEN_WIDTH }]}
            className="overflow-hidden bg-[#edf6fd]"
          >
            <ImageBackground
              source={{ uri: slide.image }}
              style={styles.backgroundImage}
              imageStyle={[
                styles.imageStyle,
                { transform: [{ translateX: slide.imageShift }] },
              ]}
              resizeMode="cover"
            >
              <View style={styles.contentContainer} className="px-5 py-6 justify-center">
                {/* Left Content Area */}
                <View className="w-[60%] z-10">
                  {/* Tag Pill */}
                  <View
                    style={{ backgroundColor: slide.tagBg, borderColor: slide.tagBorder }}
                    className="self-start px-2.5 py-1 rounded-full mb-2 border shadow-sm"
                  >
                    <Text
                      style={{ color: slide.tagColor }}
                      className="text-[10px] font-bold tracking-wide"
                    >
                      {slide.tag}
                    </Text>
                  </View>

                  {/* Headline */}
                  <Text
                    style={[
                      styles.heroTitle,
                      { fontSize: slide.titleSize, lineHeight: slide.titleSize + 5 },
                    ]}
                    className="text-[#0a2540] font-black mb-1.5"
                  >
                    {slide.title}
                  </Text>

                  {/* Subtitle */}
                  <Text
                    className="text-slate-600 text-[11.5px] leading-[16px] mb-3.5 font-semibold"
                    numberOfLines={2}
                  >
                    {slide.subtitle}
                  </Text>

                  {/* CTA Button */}
                  <TouchableOpacity
                    onPress={onExplorePress}
                    activeOpacity={0.85}
                    style={styles.exploreButton}
                    className="self-start bg-[#0a2540] flex-row items-center px-4 py-2.5 rounded-full shadow-md"
                  >
                    <Text className="text-white text-[11.5px] font-bold mr-1.5">
                      {slide.buttonText}
                    </Text>
                    <Feather name="arrow-right" size={13} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      {/* Carousel Pagination Dots */}
      <View className="flex-row items-center justify-center mt-3 gap-1.5">
        {SLIDES.map((_, dotIdx) => {
          const isActive = dotIdx === activeIndex;
          return (
            <TouchableOpacity
              key={dotIdx}
              onPress={() => handleDotPress(dotIdx)}
              activeOpacity={0.7}
              className={`h-1.5 rounded-full ${
                isActive ? 'w-4 bg-[#0284c7]' : 'w-1.5 bg-slate-300'
              }`}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    minHeight: 200,
  },
  backgroundImage: {
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
  },
  imageStyle: {
    opacity: 1,
    width: '115%',
  },
  contentContainer: {
    flex: 1,
    minHeight: 200,
    backgroundColor: 'transparent',
  },
  heroTitle: {
    letterSpacing: -0.4,
  },
  exploreButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
