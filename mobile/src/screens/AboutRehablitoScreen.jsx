import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO_URL = 'https://ik.imagekit.io/5glnyqfxu/Courses/LogoRehab.webp?updatedAt=1782812428525';

const SOCIAL_LINKS = [
  { icon: 'logo-instagram', color: '#E4405F', label: 'Instagram' },
  { icon: 'logo-youtube', color: '#FF0000', label: 'YouTube' },
  { icon: 'logo-facebook', color: '#1877F2', label: 'Facebook' },
  { icon: 'logo-twitter', color: '#1DA1F2', label: 'Twitter' },
];

export default function AboutRehablitoScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Rehablito</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Logo & Version */}
        <View style={styles.logoCard}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
          <Text style={styles.tagline}>Empowering Special Children, One Step at a Time</Text>
        </View>

        {/* Mission */}
        <View style={styles.missionCard}>
          <View style={styles.missionIcon}>
            <Text style={{ fontSize: 24 }}>🎯</Text>
          </View>
          <Text style={styles.missionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            Rehablito ka mission hai ki har special needs child ko world-class pediatric rehabilitation accessible ho — chahe wo kahi bhi ho. Hum technology aur certified therapists ko milaakar parents ko empower karte hain.
          </Text>
        </View>

        {/* What We Offer */}
        <Text style={styles.sectionLabel}>WHAT WE OFFER</Text>
        <View style={styles.offerCard}>
          {[
            { icon: 'book-open', color: '#7c3aed', bg: '#f3e8ff', label: 'Expert Therapy Courses', desc: 'Certified professionals dwara curate kiye gaye' },
            { icon: 'cpu', color: '#E6007E', bg: '#fce7f3', label: 'AI Clinical Evaluation', desc: 'Intelligent symptom analysis aur guidance' },
            { icon: 'users', color: '#0284c7', bg: '#e0f2fe', label: 'Certified Therapists', desc: 'Direct consultation with experts' },
            { icon: 'bar-chart-2', color: '#16a34a', bg: '#dcfce7', label: 'Progress Tracking', desc: 'Bacche ki growth monitor karein' },
          ].map((item) => (
            <View key={item.label} style={styles.offerRow}>
              <View style={[styles.offerIcon, { backgroundColor: item.bg }]}>
                <Feather name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.offerTextWrap}>
                <Text style={styles.offerLabel}>{item.label}</Text>
                <Text style={styles.offerDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Social Media */}
        <Text style={styles.sectionLabel}>FOLLOW US</Text>
        <View style={styles.socialRow}>
          {SOCIAL_LINKS.map((s) => (
            <TouchableOpacity key={s.label} activeOpacity={0.7} style={styles.socialBtn}>
              <Ionicons name={s.icon} size={24} color={s.color} />
              <Text style={styles.socialLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legal Links */}
        <Text style={styles.sectionLabel}>LEGAL</Text>
        <View style={styles.legalCard}>
          {[
            { icon: 'file-text', label: 'Terms of Service' },
            { icon: 'shield', label: 'Privacy Policy' },
            { icon: 'code', label: 'Open Source Licenses' },
            { icon: 'award', label: 'Acknowledgements' },
          ].map((item, idx) => (
            <TouchableOpacity key={item.label} activeOpacity={0.7} style={[styles.legalRow, idx < 3 && styles.legalRowBorder]}>
              <View style={styles.legalLeft}>
                <Feather name={item.icon} size={16} color="#475569" />
                <Text style={styles.legalLabel}>{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footerCard}>
          <Text style={styles.footerEmoji}>❤️</Text>
          <Text style={styles.footerText}>Made with love for special children</Text>
          <Text style={styles.footerCopy}>© 2026 Rehablito. All rights reserved.</Text>
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
  logoCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 24, alignItems: 'center',
    marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#64748b', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  logo: { width: 200, height: 70, marginBottom: 10 },
  versionBadge: {
    backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10,
  },
  versionText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  tagline: { fontSize: 13, fontWeight: '700', color: '#475569', textAlign: 'center', fontStyle: 'italic' },
  missionCard: {
    backgroundColor: '#fef3c7', borderRadius: 20, padding: 20, alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: '#fde68a',
  },
  missionIcon: { marginBottom: 8 },
  missionTitle: { fontSize: 16, fontWeight: '900', color: '#92400e', marginBottom: 8 },
  missionText: { fontSize: 12, fontWeight: '500', color: '#78350f', lineHeight: 18, textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 10, marginTop: 4 },
  offerCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  offerRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  offerIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  offerTextWrap: { flex: 1 },
  offerLabel: { fontSize: 13, fontWeight: '800', color: '#1e293b' },
  offerDesc: { fontSize: 10.5, fontWeight: '500', color: '#94a3b8', marginTop: 2 },
  socialRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  socialBtn: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#64748b', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  socialLabel: { fontSize: 9, fontWeight: '700', color: '#475569', marginTop: 4 },
  legalCard: {
    backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', marginBottom: 20,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  legalRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  legalRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  legalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legalLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  footerCard: {
    alignItems: 'center', paddingVertical: 20,
  },
  footerEmoji: { fontSize: 20, marginBottom: 6 },
  footerText: { fontSize: 13, fontWeight: '700', color: '#E6007E', marginBottom: 4 },
  footerCopy: { fontSize: 10, fontWeight: '500', color: '#94a3b8' },
});
