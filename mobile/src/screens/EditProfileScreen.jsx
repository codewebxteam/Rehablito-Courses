import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const CONDITION_OPTIONS = ['Autism', 'ADHD', 'Speech Delay', 'Down Syndrome', 'Cerebral Palsy', 'Other'];

export default function EditProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { currentUser, userProfile, updateUserProfileData, openAuthModal } = useAuth();

  const [childName, setChildName] = useState('');
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [conditions, setConditions] = useState(['Autism']);
  const [quote, setQuote] = useState('Every small step is a big victory.');
  const [saving, setSaving] = useState(false);

  const [avatarUri, setAvatarUri] = useState(
    userProfile?.photoURL ||
    currentUser?.photoURL ||
    'https://ik.imagekit.io/5glnyqfxu/Courses/AutismCard1.webp'
  );

  useEffect(() => {
    if (!currentUser) {
      return;
    }
    setChildName(userProfile?.childName || '');
    setParentName(userProfile?.name || currentUser.displayName || '');
    setEmail(currentUser.email || '');
    setPhone(userProfile?.phone || '');
    setDob(userProfile?.dob || '');
    if (userProfile?.gender) setGender(userProfile.gender);
    if (userProfile?.conditions && Array.isArray(userProfile.conditions)) {
      setConditions(userProfile.conditions);
    } else if (userProfile?.condition) {
      setConditions([userProfile.condition]);
    }
    if (userProfile?.quote) setQuote(userProfile.quote);
    if (userProfile?.photoURL) {
      setAvatarUri(userProfile.photoURL);
    } else if (currentUser?.photoURL) {
      setAvatarUri(currentUser.photoURL);
    }
  }, [userProfile, currentUser]);

  const toggleCondition = (cond) => {
    setConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handlePickPhoto = () => {
    Alert.alert('Change Profile Photo', 'Select image source:', [
      {
        text: '📷 Take Photo (Camera)',
        onPress: async () => {
          try {
            const perm = await ImagePicker.requestCameraPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permission Denied', 'Camera permission is required.');
              return;
            }
            const res = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
              base64: true,
            });
            if (!res.canceled && res.assets && res.assets[0]) {
              const asset = res.assets[0];
              const dataUrl = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
              setAvatarUri(dataUrl);
            }
          } catch (e) {
            console.warn('Camera error:', e);
          }
        },
      },
      {
        text: '🖼️ Gallery (Photos)',
        onPress: async () => {
          try {
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!perm.granted) {
              Alert.alert('Permission Denied', 'Gallery permission is required.');
              return;
            }
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
              base64: true,
            });
            if (!res.canceled && res.assets && res.assets[0]) {
              const asset = res.assets[0];
              const dataUrl = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
              setAvatarUri(dataUrl);
            }
          } catch (e) {
            console.warn('Gallery error:', e);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfileData({
        childName: childName.trim(),
        name: parentName.trim(),
        phone: phone.trim(),
        dob: dob.trim(),
        gender,
        conditions,
        condition: conditions.join(', '),
        quote: quote.trim(),
        photoURL: avatarUri,
      });
      Alert.alert('✅ Profile Updated', 'Your profile and child details have been saved successfully.');
      if (navigation?.goBack) navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
          style={styles.saveHeaderBtn}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.saveHeaderText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarUri }} style={styles.avatarImg} resizeMode="cover" />
            <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.8} style={styles.cameraOverlay}>
              <Feather name="camera" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Child Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="baby-face-outline" size={18} color="#E6007E" />
            <Text style={styles.sectionTitle}>Child Information</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Child's Name</Text>
            <TextInput
              value={childName}
              onChangeText={setChildName}
              style={styles.textInput}
              placeholder="e.g. Aarav"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              style={styles.textInput}
              placeholder="e.g. 12 Mar 2020"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.chipRow}>
              {GENDER_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  activeOpacity={0.7}
                  style={[styles.chip, gender === g && styles.chipActive]}
                >
                  <Text style={[styles.chipText, gender === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Condition / Diagnosis</Text>
            <View style={styles.chipRow}>
              {CONDITION_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => toggleCondition(c)}
                  activeOpacity={0.7}
                  style={[styles.chip, conditions.includes(c) && styles.chipActiveCondition]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      conditions.includes(c) && styles.chipTextActiveCondition,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Parent Info */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather name="users" size={16} color="#0284c7" />
            <Text style={[styles.sectionTitle, { color: '#0284c7' }]}>Parent / Guardian</Text>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Parent Name</Text>
            <TextInput
              value={parentName}
              onChangeText={setParentName}
              style={styles.textInput}
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              editable={false}
              style={[styles.textInput, { backgroundColor: '#f1f5f9', color: '#64748b' }]}
              placeholder="Enter email"
              placeholderTextColor="#94a3b8"
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={styles.textInput}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Quote */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="format-quote-close" size={18} color="#d97706" />
            <Text style={[styles.sectionTitle, { color: '#d97706' }]}>Motivational Quote</Text>
          </View>
          <TextInput
            value={quote}
            onChangeText={setQuote}
            style={[styles.textInput, { minHeight: 64, textAlignVertical: 'top' }]}
            placeholder="Write something inspiring..."
            placeholderTextColor="#94a3b8"
            multiline
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
          style={styles.saveBtn}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Feather name="check-circle" size={18} color="#ffffff" />
              <Text style={styles.saveBtnText}>Save Profile</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#0a2540' },
  saveHeaderBtn: {
    backgroundColor: '#E6007E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveHeaderText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  avatarWrapper: { position: 'relative', marginBottom: 8 },
  avatarImg: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#e0f2fe' },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6007E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#E6007E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  changePhotoText: { color: '#E6007E', fontSize: 13, fontWeight: '700' },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#E6007E' },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: { backgroundColor: '#E6007E', borderColor: '#E6007E' },
  chipText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  chipTextActive: { color: '#ffffff' },
  chipActiveCondition: { backgroundColor: '#0284c7', borderColor: '#0284c7' },
  chipTextActiveCondition: { color: '#ffffff' },
  saveBtn: {
    backgroundColor: '#E6007E',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#E6007E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  saveBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
});
