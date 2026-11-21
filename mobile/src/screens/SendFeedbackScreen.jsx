import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EMOJIS = [
  { emoji: '😞', label: 'Very Bad', value: 1 },
  { emoji: '😐', label: 'Okay', value: 2 },
  { emoji: '😊', label: 'Good', value: 3 },
  { emoji: '😍', label: 'Great', value: 4 },
  { emoji: '🤩', label: 'Amazing', value: 5 },
];

const CATEGORIES = ['UI/UX', 'Performance', 'Content', 'Therapy', 'Courses', 'Chat', 'Other'];

export default function SendFeedbackScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [feedback, setFeedback] = useState('');

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = () => {
    if (!rating) {
      Alert.alert('⚠️', 'Please select a rating first!');
      return;
    }
    Alert.alert(
      '🎉 Thank You!',
      'Aapka feedback humne receive kar liya hai. Hum isse app behtar banane mein use karenge!',
      [{ text: 'OK', onPress: () => navigation?.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>💬</Text>
          <Text style={styles.heroTitle}>Aapka Feedback Matters!</Text>
          <Text style={styles.heroDesc}>Hum aapki raay sunna chahte hain taaki Rehablito ko aur behtar bana sakein</Text>
        </View>

        {/* Rating */}
        <Text style={styles.sectionLabel}>HOW WAS YOUR EXPERIENCE?</Text>
        <View style={styles.ratingCard}>
          <View style={styles.emojiRow}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e.value}
                onPress={() => setRating(e.value)}
                activeOpacity={0.7}
                style={[styles.emojiBtn, rating === e.value && styles.emojiBtnActive]}
              >
                <Text style={styles.emojiText}>{e.emoji}</Text>
                <Text style={[styles.emojiLabel, rating === e.value && styles.emojiLabelActive]}>
                  {e.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category */}
        <Text style={styles.sectionLabel}>WHAT IS YOUR FEEDBACK ABOUT?</Text>
        <View style={styles.categoryCard}>
          <View style={styles.catRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => toggleCategory(cat)}
                activeOpacity={0.7}
                style={[styles.catChip, selectedCategories.includes(cat) && styles.catChipActive]}
              >
                <Text style={[styles.catChipText, selectedCategories.includes(cat) && styles.catChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Feedback Text */}
        <Text style={styles.sectionLabel}>TELL US MORE</Text>
        <View style={styles.feedbackCard}>
          <TextInput
            value={feedback}
            onChangeText={setFeedback}
            style={styles.feedbackInput}
            placeholder="Apna feedback yahan likhein... Koi suggestion, complaint ya appreciation — sab welcome hai!"
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{feedback.length}/500</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} style={styles.submitBtn}>
          <Feather name="send" size={18} color="#ffffff" />
          <Text style={styles.submitBtnText}>Submit Feedback</Text>
        </TouchableOpacity>

        {/* Note */}
        <View style={styles.noteCard}>
          <Feather name="info" size={14} color="#64748b" />
          <Text style={styles.noteText}>
            Aapka feedback anonymous hai aur sirf app improvement ke liye use hoga.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14, backgroundColor: '#f8fafc',
    borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#0a2540' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  heroCard: {
    backgroundColor: '#eff6ff', borderRadius: 24, padding: 24, alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: '#bfdbfe',
  },
  heroEmoji: { fontSize: 36, marginBottom: 8 },
  heroTitle: { fontSize: 18, fontWeight: '900', color: '#1e3a5f', marginBottom: 4 },
  heroDesc: { fontSize: 12, fontWeight: '600', color: '#3b82f6', textAlign: 'center', lineHeight: 17 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  ratingCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  emojiBtn: {
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14,
    flex: 1, marginHorizontal: 2,
  },
  emojiBtnActive: { backgroundColor: '#fce7f3', borderWidth: 1, borderColor: '#fbcfe8' },
  emojiText: { fontSize: 28, marginBottom: 4 },
  emojiLabel: { fontSize: 9, fontWeight: '700', color: '#94a3b8' },
  emojiLabelActive: { color: '#E6007E' },
  categoryCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0',
  },
  catChipActive: { backgroundColor: '#E6007E', borderColor: '#E6007E' },
  catChipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  catChipTextActive: { color: '#ffffff' },
  feedbackCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  feedbackInput: {
    backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, fontSize: 13, fontWeight: '500',
    color: '#0f172a', minHeight: 120, borderWidth: 1, borderColor: '#e2e8f0', lineHeight: 19,
  },
  charCount: { fontSize: 10, fontWeight: '600', color: '#94a3b8', textAlign: 'right', marginTop: 6 },
  submitBtn: {
    backgroundColor: '#E6007E', borderRadius: 16, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#E6007E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    marginBottom: 14,
  },
  submitBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  noteCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12,
    backgroundColor: '#f1f5f9', borderRadius: 12,
  },
  noteText: { fontSize: 11, fontWeight: '500', color: '#64748b', flex: 1, lineHeight: 16 },
});
