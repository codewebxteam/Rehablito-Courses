import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FAQ_DATA = [
  { q: 'Rehablito kya hai?', a: 'Rehablito ek online pediatric rehabilitation platform hai jo special needs children ke parents ko therapy courses, AI evaluation, aur certified therapist access provide karta hai.' },
  { q: 'Courses kaise access karein?', a: 'Home screen se ya Courses tab se aap sabhi available courses dekh sakte hain. Course select karein, payment karein aur turant access paayein.' },
  { q: 'AI Chat kya karta hai?', a: 'Hamara AI Assistant aapke bacche ke symptoms evaluate karta hai aur initial clinical guidance deta hai. Ye doctor ki jagah nahi hai, lekin helpful starting point hai.' },
  { q: 'Therapist se kab baat hoti hai?', a: 'Certified Therapist tab par message bhejein. Working hours mein therapist aapke queries ka reply deta hai.' },
  { q: 'Refund policy kya hai?', a: 'Course purchase ke 7 din ke andar refund request kar sakte hain. Help & Support se contact karein.' },
  { q: 'Data safe hai?', a: 'Haan! Aapka data encrypted hai aur HIPAA-compliant servers par stored hai. Privacy Policy mein details hain.' },
];

const CONTACT_CARDS = [
  { icon: 'mail', color: '#E6007E', bg: '#fce7f3', border: '#fbcfe8', title: 'Email Support', value: 'support@rehablito.com', action: 'mailto:support@rehablito.com' },
  { icon: 'message-circle', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0', title: 'WhatsApp', value: '+91 98765 43210', action: 'https://wa.me/919876543210' },
  { icon: 'phone', color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd', title: 'Call Us', value: '+91 98765 43210', action: 'tel:+919876543210' },
];

export default function HelpSupportScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (idx) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Text style={styles.heroEmoji}>🤝</Text>
          <Text style={styles.heroTitle}>Hum Yahaan Hain Aapke Liye!</Text>
          <Text style={styles.heroDesc}>Koi bhi sawal ho, hum madad ke liye tayyar hain</Text>
        </View>

        {/* Contact Cards */}
        <Text style={styles.sectionLabel}>CONTACT US</Text>
        <View style={styles.contactRow}>
          {CONTACT_CARDS.map((card) => (
            <TouchableOpacity
              key={card.title}
              onPress={() => Linking.openURL(card.action).catch(() => {})}
              activeOpacity={0.7}
              style={[styles.contactCard, { borderColor: card.border }]}
            >
              <View style={[styles.contactIcon, { backgroundColor: card.bg, borderColor: card.border }]}>
                <Feather name={card.icon} size={20} color={card.color} />
              </View>
              <Text style={styles.contactTitle}>{card.title}</Text>
              <Text style={[styles.contactValue, { color: card.color }]}>{card.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={styles.faqCard}>
          {FAQ_DATA.map((faq, idx) => (
            <View key={idx}>
              <TouchableOpacity
                onPress={() => toggleFaq(idx)}
                activeOpacity={0.7}
                style={[styles.faqRow, idx < FAQ_DATA.length - 1 && expandedFaq !== idx && styles.faqRowBorder]}
              >
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <View style={[styles.faqChevron, expandedFaq === idx && styles.faqChevronActive]}>
                  <Feather name={expandedFaq === idx ? 'minus' : 'plus'} size={14} color={expandedFaq === idx ? '#ffffff' : '#94a3b8'} />
                </View>
              </TouchableOpacity>
              {expandedFaq === idx && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.a}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Quick Links */}
        <Text style={styles.sectionLabel}>QUICK LINKS</Text>
        <View style={styles.linksCard}>
          {[
            { icon: 'book-open', label: 'User Guide', color: '#7c3aed' },
            { icon: 'video', label: 'Video Tutorials', color: '#E6007E' },
            { icon: 'alert-circle', label: 'Report a Bug', color: '#ef4444' },
          ].map((link) => (
            <TouchableOpacity key={link.label} activeOpacity={0.7} style={styles.linkRow}>
              <View style={styles.linkLeft}>
                <Feather name={link.icon} size={16} color={link.color} />
                <Text style={styles.linkLabel}>{link.label}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ))}
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
  heroBanner: {
    backgroundColor: '#fce7f3', borderRadius: 24, padding: 24, alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: '#fbcfe8',
  },
  heroEmoji: { fontSize: 36, marginBottom: 8 },
  heroTitle: { fontSize: 18, fontWeight: '900', color: '#831843', marginBottom: 4 },
  heroDesc: { fontSize: 12, fontWeight: '600', color: '#9d174d', textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  contactCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1,
    shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  contactIcon: {
    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginBottom: 8,
  },
  contactTitle: { fontSize: 11, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  contactValue: { fontSize: 9, fontWeight: '600', textAlign: 'center' },
  faqCard: {
    backgroundColor: '#ffffff', borderRadius: 20, overflow: 'hidden', marginBottom: 20,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  faqRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  faqRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  faqQuestion: { fontSize: 13, fontWeight: '700', color: '#1e293b', flex: 1, marginRight: 12 },
  faqChevron: {
    width: 26, height: 26, borderRadius: 8, backgroundColor: '#f1f5f9',
    alignItems: 'center', justifyContent: 'center',
  },
  faqChevronActive: { backgroundColor: '#E6007E' },
  faqAnswer: {
    paddingHorizontal: 16, paddingBottom: 14, paddingTop: 0,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  faqAnswerText: { fontSize: 12, fontWeight: '500', color: '#64748b', lineHeight: 18 },
  linksCard: {
    backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  linkLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linkLabel: { fontSize: 13, fontWeight: '700', color: '#334155' },
});
