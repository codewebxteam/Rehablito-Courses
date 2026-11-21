import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacySecurityScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [biometric, setBiometric] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Security Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
              <Feather name="shield" size={16} color="#16a34a" />
            </View>
            <Text style={[styles.sectionTitle, { color: '#16a34a' }]}>Security</Text>
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder]}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="fingerprint" size={20} color="#16a34a" />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>Biometric Lock</Text>
                <Text style={styles.settingDesc}>Fingerprint / Face ID se app lock karein</Text>
              </View>
            </View>
            <Switch value={biometric} onValueChange={setBiometric} trackColor={{ false: '#e2e8f0', true: '#bbf7d0' }} thumbColor={biometric ? '#16a34a' : '#94a3b8'} />
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder]}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="two-factor-authentication" size={20} color="#7c3aed" />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                <Text style={styles.settingDesc}>OTP se extra security layer</Text>
              </View>
            </View>
            <Switch value={twoFA} onValueChange={setTwoFA} trackColor={{ false: '#e2e8f0', true: '#e9d5ff' }} thumbColor={twoFA ? '#7c3aed' : '#94a3b8'} />
          </View>

          <TouchableOpacity
            onPress={() => navigation?.navigate?.('AccountInfo')}
            activeOpacity={0.7}
            style={styles.settingRow}
          >
            <View style={styles.settingLeft}>
              <Feather name="key" size={18} color="#d97706" />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingDesc}>Apna password update karein</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Privacy Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
              <Feather name="eye" size={16} color="#0284c7" />
            </View>
            <Text style={[styles.sectionTitle, { color: '#0284c7' }]}>Privacy</Text>
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder]}>
            <View style={styles.settingLeft}>
              <Feather name="eye" size={18} color="#0284c7" />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>Profile Visibility</Text>
                <Text style={styles.settingDesc}>Therapist ko aapki profile dikhana</Text>
              </View>
            </View>
            <Switch value={profileVisible} onValueChange={setProfileVisible} trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }} thumbColor={profileVisible ? '#0284c7' : '#94a3b8'} />
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder]}>
            <View style={styles.settingLeft}>
              <Feather name="bar-chart-2" size={18} color="#8b5cf6" />
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingLabel}>Analytics & Diagnostics</Text>
                <Text style={styles.settingDesc}>App improvement ke liye anonymous data share karein</Text>
              </View>
            </View>
            <Switch value={analytics} onValueChange={setAnalytics} trackColor={{ false: '#e2e8f0', true: '#e9d5ff' }} thumbColor={analytics ? '#8b5cf6' : '#94a3b8'} />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
              <Feather name="database" size={16} color="#d97706" />
            </View>
            <Text style={[styles.sectionTitle, { color: '#d97706' }]}>Data Management</Text>
          </View>

          <TouchableOpacity
            onPress={() => Alert.alert('📥 Download Data', 'Aapka data download request submit ho gaya hai. Aapko email par link milega.')}
            activeOpacity={0.7}
            style={[styles.actionRow, styles.settingRowBorder]}
          >
            <View style={styles.settingLeft}>
              <Feather name="download" size={18} color="#475569" />
              <Text style={styles.actionLabel}>Download My Data</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert('🗑️ Clear Cache', 'App cache clear kar diya gaya hai.')}
            activeOpacity={0.7}
            style={[styles.actionRow, styles.settingRowBorder]}
          >
            <View style={styles.settingLeft}>
              <Feather name="trash" size={18} color="#475569" />
              <Text style={styles.actionLabel}>Clear App Cache</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert('📋 Permissions', 'Camera, Storage, Notifications — sab permissions manage karein.')}
            activeOpacity={0.7}
            style={styles.actionRow}
          >
            <View style={styles.settingLeft}>
              <Feather name="sliders" size={18} color="#475569" />
              <Text style={styles.actionLabel}>Manage Permissions</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Legal */}
        <View style={styles.legalCard}>
          <TouchableOpacity activeOpacity={0.7} style={[styles.legalRow, styles.legalRowBorder]}>
            <Text style={styles.legalText}>Privacy Policy</Text>
            <Feather name="external-link" size={14} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={styles.legalRow}>
            <Text style={styles.legalText}>Terms of Service</Text>
            <Feather name="external-link" size={14} color="#94a3b8" />
          </TouchableOpacity>
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
  sectionCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#64748b', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
    paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  iconCircle: {
    width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  sectionTitle: { fontSize: 14, fontWeight: '900' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12,
  },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12, marginRight: 12 },
  settingTextWrap: { flex: 1 },
  settingLabel: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  settingDesc: { fontSize: 10.5, fontWeight: '500', color: '#94a3b8', marginTop: 2 },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14,
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginLeft: 12 },
  legalCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 4, marginBottom: 14,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  legalRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  legalRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  legalText: { fontSize: 13, fontWeight: '600', color: '#475569' },
});
