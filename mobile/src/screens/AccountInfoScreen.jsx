import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function AccountInfoScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { currentUser, userProfile, updateUserProfileData, changePassword } = useAuth();

  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    if (userProfile || currentUser) {
      if (userProfile?.name || currentUser?.displayName) setName(userProfile?.name || currentUser?.displayName);
      if (currentUser?.email) setEmail(currentUser?.email);
      if (userProfile?.phone) setPhone(userProfile?.phone);
    }
  }, [userProfile, currentUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (currentUser) {
        await updateUserProfileData({ name: name.trim(), phone: phone.trim() });
      }
      Alert.alert('✅ Account Updated', 'Your account information has been saved and synced.');
      navigation?.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('⚠️ Error', 'Please fill all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('⚠️ Weak Password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('⚠️ Error', 'New password and confirm password do not match.');
      return;
    }

    setChangingPw(true);
    try {
      await changePassword(oldPassword, newPassword);
      Alert.alert('✅ Password Changed', 'Your password has been updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    } catch (err) {
      let msg = err.message || 'Failed to change password';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Current password incorrect hai. Kripya sahi password dalein.';
      }
      Alert.alert('Password Error', msg);
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Personal Info Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Feather name="user" size={16} color="#7c3aed" />
            </View>
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.textInput} placeholder="Enter your name" placeholderTextColor="#94a3b8" />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={styles.inputWithIcon}>
              <Feather name="mail" size={16} color="#94a3b8" />
              <TextInput value={email} onChangeText={setEmail} style={styles.inputInner} placeholder="Enter email" placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={12} color="#16a34a" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.inputWithIcon}>
              <Feather name="phone" size={16} color="#94a3b8" />
              <TextInput value={phone} onChangeText={setPhone} style={styles.inputInner} placeholder="+91 XXXXX XXXXX" placeholderTextColor="#94a3b8" keyboardType="phone-pad" />
            </View>
          </View>
        </View>

        {/* Password Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef3c7', borderColor: '#fde68a' }]}>
              <Feather name="lock" size={16} color="#d97706" />
            </View>
            <Text style={[styles.sectionTitle, { color: '#d97706' }]}>Security</Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowChangePassword(!showChangePassword)}
            activeOpacity={0.7}
            style={styles.changePasswordToggle}
          >
            <View style={styles.cpLeft}>
              <Feather name="key" size={16} color="#475569" />
              <Text style={styles.cpText}>Change Password</Text>
            </View>
            <Feather name={showChangePassword ? 'chevron-up' : 'chevron-down'} size={18} color="#94a3b8" />
          </TouchableOpacity>

          {showChangePassword && (
            <View style={styles.passwordFields}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Current Password</Text>
                <View style={styles.inputWithIcon}>
                  <Feather name="lock" size={16} color="#94a3b8" />
                  <TextInput value={oldPassword} onChangeText={setOldPassword} style={styles.inputInner} placeholder="••••••••" placeholderTextColor="#94a3b8" secureTextEntry={!showPassword} />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>New Password</Text>
                <View style={styles.inputWithIcon}>
                  <Feather name="lock" size={16} color="#94a3b8" />
                  <TextInput value={newPassword} onChangeText={setNewPassword} style={styles.inputInner} placeholder="Enter new password" placeholderTextColor="#94a3b8" secureTextEntry />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Confirm New Password</Text>
                <View style={styles.inputWithIcon}>
                  <Feather name="lock" size={16} color="#94a3b8" />
                  <TextInput value={confirmPassword} onChangeText={setConfirmPassword} style={styles.inputInner} placeholder="Confirm new password" placeholderTextColor="#94a3b8" secureTextEntry />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={changingPw}
                activeOpacity={0.85}
                style={[styles.changePwBtn, changingPw && { opacity: 0.7 }]}
              >
                {changingPw ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather name="shield" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.changePwBtnText}>Update Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={styles.saveBtn}>
          <Feather name="check-circle" size={18} color="#ffffff" />
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={styles.dangerCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
              <Feather name="alert-triangle" size={16} color="#ef4444" />
            </View>
            <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Danger Zone</Text>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert('⚠️ Delete Account', 'Kya aap sure hain? Yeh action undo nahi hoga.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive' }])}
            activeOpacity={0.7}
            style={styles.deleteBtn}
          >
            <Feather name="trash-2" size={16} color="#ef4444" />
            <Text style={styles.deleteBtnText}>Delete Account</Text>
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
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14,
    paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  iconCircle: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: '#f3e8ff',
    borderWidth: 1, borderColor: '#e9d5ff', alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#7c3aed' },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  textInput: {
    backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 13, fontWeight: '600', color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0',
  },
  inputWithIcon: {
    backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: '#e2e8f0', flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  inputInner: { flex: 1, fontSize: 13, fontWeight: '600', color: '#0f172a' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6,
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  changePasswordToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 4,
  },
  cpLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cpText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  passwordFields: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  changePwBtn: {
    backgroundColor: '#d97706', borderRadius: 14, paddingVertical: 13,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#d97706', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  changePwBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  saveBtn: {
    backgroundColor: '#7c3aed', borderRadius: 16, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    marginBottom: 14,
  },
  saveBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  dangerCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#fecaca',
    shadowColor: '#ef4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
  },
  deleteBtnText: { fontSize: 13, fontWeight: '800', color: '#ef4444' },
});
