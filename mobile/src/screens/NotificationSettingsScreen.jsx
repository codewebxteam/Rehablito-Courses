import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NOTIFICATION_GROUPS = [
  {
    title: 'Therapy Reminders',
    icon: 'heart',
    iconColor: '#E6007E',
    iconBg: '#fce7f3',
    iconBorder: '#fbcfe8',
    items: [
      { key: 'dailyExercise', label: 'Daily Exercise Reminders', desc: 'Roz subah therapy exercises ki yaad dilayein' },
      { key: 'sessionReminder', label: 'Session Reminders', desc: '30 min pehle session ki notification' },
      { key: 'milestoneAlert', label: 'Milestone Alerts', desc: 'Bacche ki progress milestones ki updates' },
    ],
  },
  {
    title: 'Course Updates',
    icon: 'book-open',
    iconColor: '#7c3aed',
    iconBg: '#f3e8ff',
    iconBorder: '#e9d5ff',
    items: [
      { key: 'newCourse', label: 'New Courses', desc: 'Naye therapy courses ki notification' },
      { key: 'courseProgress', label: 'Progress Updates', desc: 'Course completion milestones' },
      { key: 'weeklyReport', label: 'Weekly Progress Report', desc: 'Har hafte ki progress summary' },
    ],
  },
  {
    title: 'Chat Notifications',
    icon: 'message-circle',
    iconColor: '#0284c7',
    iconBg: '#e0f2fe',
    iconBorder: '#bae6fd',
    items: [
      { key: 'aiReply', label: 'AI Assistant Replies', desc: 'AI evaluation ka response aane par' },
      { key: 'therapistMsg', label: 'Therapist Messages', desc: 'Certified therapist ka message aane par' },
    ],
  },
  {
    title: 'App Updates',
    icon: 'smartphone',
    iconColor: '#059669',
    iconBg: '#d1fae5',
    iconBorder: '#a7f3d0',
    items: [
      { key: 'appUpdate', label: 'Version Updates', desc: 'Naya app version aane par' },
      { key: 'featureAnnounce', label: 'Feature Announcements', desc: 'Nayi features ki jaankari' },
    ],
  },
];

export default function NotificationSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState({
    dailyExercise: true, sessionReminder: true, milestoneAlert: true,
    newCourse: true, courseProgress: false, weeklyReport: true,
    aiReply: true, therapistMsg: true,
    appUpdate: true, featureAnnounce: false,
  });

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Quiet Hours */}
        <View style={styles.quietCard}>
          <View style={styles.quietLeft}>
            <View style={styles.quietIcon}>
              <MaterialCommunityIcons name="moon-waning-crescent" size={20} color="#6366f1" />
            </View>
            <View style={styles.quietTextWrap}>
              <Text style={styles.quietTitle}>Quiet Hours</Text>
              <Text style={styles.quietDesc}>10:00 PM — 7:00 AM tak koi notification nahi</Text>
            </View>
          </View>
          <Switch
            value={quietHoursEnabled}
            onValueChange={setQuietHoursEnabled}
            trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
            thumbColor={quietHoursEnabled ? '#6366f1' : '#94a3b8'}
          />
        </View>

        {/* Notification Groups */}
        {NOTIFICATION_GROUPS.map((group) => (
          <View key={group.title} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <View style={[styles.groupIcon, { backgroundColor: group.iconBg, borderColor: group.iconBorder }]}>
                <Feather name={group.icon} size={16} color={group.iconColor} />
              </View>
              <Text style={[styles.groupTitle, { color: group.iconColor }]}>{group.title}</Text>
            </View>

            {group.items.map((item, idx) => (
              <View key={item.key} style={[styles.notifRow, idx < group.items.length - 1 && styles.notifRowBorder]}>
                <View style={styles.notifLeft}>
                  <Text style={styles.notifLabel}>{item.label}</Text>
                  <Text style={styles.notifDesc}>{item.desc}</Text>
                </View>
                <Switch
                  value={settings[item.key]}
                  onValueChange={() => toggleSetting(item.key)}
                  trackColor={{ false: '#e2e8f0', true: '#fce7f3' }}
                  thumbColor={settings[item.key] ? '#E6007E' : '#94a3b8'}
                />
              </View>
            ))}
          </View>
        ))}

        {/* Reset */}
        <TouchableOpacity
          onPress={() => Alert.alert('Reset', 'Sab notifications default settings par reset ho jayenge?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', onPress: () => {} }])}
          activeOpacity={0.7}
          style={styles.resetBtn}
        >
          <Feather name="refresh-ccw" size={16} color="#64748b" />
          <Text style={styles.resetText}>Reset to Defaults</Text>
        </TouchableOpacity>
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
  quietCard: {
    backgroundColor: '#eef2ff', borderRadius: 20, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#c7d2fe', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  quietLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  quietIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#e0e7ff',
    borderWidth: 1, borderColor: '#c7d2fe', alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  quietTextWrap: { flex: 1 },
  quietTitle: { fontSize: 13, fontWeight: '800', color: '#312e81' },
  quietDesc: { fontSize: 10.5, fontWeight: '500', color: '#6366f1', marginTop: 2 },
  groupCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  groupHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
    paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  groupIcon: {
    width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  groupTitle: { fontSize: 13, fontWeight: '900' },
  notifRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  notifRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  notifLeft: { flex: 1, marginRight: 12 },
  notifLabel: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  notifDesc: { fontSize: 10.5, fontWeight: '500', color: '#94a3b8', marginTop: 2 },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0',
  },
  resetText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
});
