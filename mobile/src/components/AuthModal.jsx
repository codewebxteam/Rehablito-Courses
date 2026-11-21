import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
  login,
  signup,
  resetPassword,
}) {

  const [mode, setMode] = useState(defaultMode); // 'login' | 'signup' | 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password strength state matching web
  const [strength, setStrength] = useState({ score: 0, label: '', color: '#ef4444' });

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setErrors({});
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setStrength({ score: 0, label: '', color: '#ef4444' });
    }
  }, [isOpen, defaultMode]);

  const checkStrength = (pass) => {
    let score = 0;
    if (!pass) {
      setStrength({ score: 0, label: '', color: '#ef4444' });
      return;
    }

    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = ['#ef4444', '#f97316', '#eab308', '#0284c7', '#16a34a'];

    setStrength({
      score,
      label: labels[score - 1] || 'Weak',
      color: colors[score - 1] || '#ef4444',
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email address is required';
    if (!password) newErrors.password = 'Password is required';

    if (mode === 'signup') {
      if (!name.trim()) newErrors.name = 'Full name is required';
      if (!phone.trim()) newErrors.phone = 'Phone number is required';
      else if (phone.trim().length < 10) newErrors.phone = 'Enter valid 10-digit phone number';

      if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      if (mode === 'login') {
        await login(email, password);
        if (onSuccess) onSuccess();
        else onClose();
        Alert.alert('Welcome Back! 🎉', 'You have successfully signed in.');
      } else if (mode === 'signup') {
        await signup(email, password, name, phone);
        if (onSuccess) onSuccess();
        else onClose();
        Alert.alert('Account Created! 🌟', 'Welcome to Rehablito Academy! Your account is ready.');
      }
    } catch (err) {
      let msg = err.message || 'Something went wrong';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        msg = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setErrors({ general: msg });
      Alert.alert('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Please enter your registered email' });
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert('Email Sent ✉️', 'Password reset instructions have been sent to your email.');
      setMode('login');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={styles.closeButton}
          >
            <Feather name="x" size={18} color="#ffffff" />
          </TouchableOpacity>

          {/* VIBRANT TOP HEADER (Rehablito Brand Aesthetic) */}
          <View style={styles.headerContainer}>
            {/* Glowing Blur Orbs */}
            <View style={[styles.glowOrb, { top: -20, right: -20, backgroundColor: '#e6007e' }]} />
            <View style={[styles.glowOrb, { bottom: -20, left: -20, backgroundColor: '#ffd60a' }]} />

            {/* Rainbow Brand Badge */}
            <View style={styles.brandBadge}>
              <Ionicons name="sparkles" size={12} color="#ffd60a" style={{ marginRight: 4 }} />
              <Text style={styles.brandBadgeText}>
                <Text style={{ color: '#F51B22' }}>R</Text>
                <Text style={{ color: '#FF8A16' }}>e</Text>
                <Text style={{ color: '#FFE11A' }}>h</Text>
                <Text style={{ color: '#63B632' }}>a</Text>
                <Text style={{ color: '#2499C7' }}>b</Text>
                <Text style={{ color: '#E6007E' }}>l</Text>
                <Text style={{ color: '#A34773' }}>i</Text>
                <Text style={{ color: '#FFD51A' }}>t</Text>
                <Text style={{ color: '#FFE11A' }}>o</Text>
                <Text style={{ color: '#ffffff' }}> Academy</Text>
              </Text>
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.headerTitle}>
              {mode === 'login'
                ? 'Welcome Back 👋'
                : mode === 'signup'
                ? 'Join Academy 🌟'
                : 'Reset Password 🔑'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {mode === 'login'
                ? 'Continue your child’s learning journey'
                : mode === 'signup'
                ? 'Start clinical therapy guidance today'
                : 'Enter your email to recover your access'}
            </Text>
          </View>

          {/* SCROLLABLE FORM BODY */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* Tabs: Sign In vs Register (if not in reset mode) */}
            {mode !== 'reset' ? (
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setMode('login');
                    setErrors({});
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.tabButton,
                    mode === 'login' && styles.activeLoginTab,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      mode === 'login' ? styles.activeTabText : styles.inactiveTabText,
                    ]}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setMode('signup');
                    setErrors({});
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.tabButton,
                    mode === 'signup' && styles.activeSignupTab,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      mode === 'signup' ? styles.activeTabText : styles.inactiveTabText,
                    ]}
                  >
                    Register
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setMode('login')}
                style={styles.backToLoginBtn}
              >
                <Feather name="arrow-left" size={14} color="#0284c7" />
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </TouchableOpacity>
            )}

            {/* Error Banner if any */}
            {errors.general && (
              <View style={styles.errorBanner}>
                <Feather name="alert-circle" size={14} color="#ef4444" />
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            )}

            {/* FORM FIELDS */}
            <View style={styles.formGroup}>
              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={[styles.inputBox, errors.name && styles.inputBoxError]}>
                    <View style={[styles.inputIconBg, { backgroundColor: '#fce7f3' }]}>
                      <Feather name="user" size={15} color="#e6007e" />
                    </View>
                    <TextInput
                      value={name}
                      onChangeText={(t) => {
                        setName(t);
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      placeholder="e.g. Rahul Sharma"
                      placeholderTextColor="#94a3b8"
                      style={styles.textInput}
                    />
                  </View>
                  {errors.name && <Text style={styles.fieldError}>{errors.name}</Text>}
                </View>
              )}

              {/* Email Address */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[styles.inputBox, errors.email && styles.inputBoxError]}>
                  <View style={[styles.inputIconBg, { backgroundColor: '#e0f2fe' }]}>
                    <Feather name="mail" size={15} color="#0284c7" />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.textInput}
                  />
                </View>
                {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
              </View>

              {/* Phone Number (Sign Up only) */}
              {mode === 'signup' && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={[styles.inputBox, errors.phone && styles.inputBoxError]}>
                    <View style={[styles.inputIconBg, { backgroundColor: '#dcfce7' }]}>
                      <Feather name="phone" size={15} color="#16a34a" />
                    </View>
                    <TextInput
                      value={phone}
                      onChangeText={(t) => {
                        setPhone(t);
                        if (errors.phone) setErrors({ ...errors, phone: null });
                      }}
                      placeholder="+91 98765 43210"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      style={styles.textInput}
                    />
                  </View>
                  {errors.phone && <Text style={styles.fieldError}>{errors.phone}</Text>}
                </View>
              )}

              {/* Password (for login & signup) */}
              {mode !== 'reset' && (
                <View style={styles.inputWrapper}>
                  <View style={styles.passwordHeader}>
                    <Text style={styles.inputLabel}>Password</Text>
                    {mode === 'login' && (
                      <TouchableOpacity onPress={() => setMode('reset')}>
                        <Text style={styles.forgotPassText}>Forgot Password?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={[styles.inputBox, errors.password && styles.inputBoxError]}>
                    <View style={[styles.inputIconBg, { backgroundColor: '#f3e8ff' }]}>
                      <Feather name="lock" size={15} color="#7c3aed" />
                    </View>
                    <TextInput
                      value={password}
                      onChangeText={(t) => {
                        setPassword(t);
                        if (mode === 'signup') checkStrength(t);
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry={!showPassword}
                      style={styles.textInput}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Feather
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={16}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}

                  {/* Password Strength Meter for Signup */}
                  {mode === 'signup' && password.length > 0 && (
                    <View style={styles.strengthMeter}>
                      <View style={styles.strengthTrack}>
                        <View
                          style={[
                            styles.strengthFill,
                            {
                              width: `${(strength.score / 5) * 100}%`,
                              backgroundColor: strength.color,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.strengthLabel, { color: strength.color }]}>
                        {strength.label}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Confirm Password (Sign Up only) */}
              {mode === 'signup' && (
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={[styles.inputBox, errors.confirmPassword && styles.inputBoxError]}>
                    <View style={[styles.inputIconBg, { backgroundColor: '#fce7f3' }]}>
                      <Feather name="shield" size={15} color="#e6007e" />
                    </View>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={(t) => {
                        setConfirmPassword(t);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                      }}
                      placeholder="Re-enter password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry={!showConfirmPassword}
                      style={styles.textInput}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      <Feather
                        name={showConfirmPassword ? 'eye' : 'eye-off'}
                        size={16}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && (
                    <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
                  )}
                </View>
              )}
            </View>

            {/* ACTION BUTTON */}
            {mode === 'reset' ? (
              <TouchableOpacity
                onPress={handleSendReset}
                disabled={loading}
                activeOpacity={0.85}
                style={[styles.mainActionBtn, { backgroundColor: '#0284c7' }]}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.actionBtnText}>Send Reset Link</Text>
                    <Feather name="send" size={16} color="#ffffff" style={{ marginLeft: 8 }} />
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
                style={[
                  styles.mainActionBtn,
                  mode === 'signup'
                    ? { backgroundColor: '#e6007e' }
                    : { backgroundColor: '#071838' },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.btnContent}>
                    <Text style={styles.actionBtnText}>
                      {mode === 'login' ? 'Sign In to Account' : 'Create Student Account'}
                    </Text>
                    {mode === 'login' ? (
                      <Feather name="arrow-right" size={16} color="#ffffff" style={{ marginLeft: 8 }} />
                    ) : (
                      <Ionicons name="sparkles" size={16} color="#ffffff" style={{ marginLeft: 8 }} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Bottom Guarantee Trust Badges */}
            <View style={styles.trustBadgesRow}>
              <View style={styles.trustBadgeItem}>
                <Ionicons name="shield-checkmark" size={13} color="#16a34a" />
                <Text style={styles.trustBadgeText}>256-Bit Encrypted</Text>
              </View>
              <View style={styles.trustBadgeItem}>
                <Ionicons name="sync" size={13} color="#0284c7" />
                <Text style={styles.trustBadgeText}>Cloud Synced</Text>
              </View>
              <View style={styles.trustBadgeItem}>
                <Ionicons name="heart" size={13} color="#e6007e" />
                <Text style={styles.trustBadgeText}>Family Safe</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 24, 56, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '88%',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  headerContainer: {
    backgroundColor: '#071838',
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.35,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 8,
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#cbd5e1',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLoginTab: {
    backgroundColor: '#071838',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  activeSignupTab: {
    backgroundColor: '#e6007e',
    shadowColor: '#e6007e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  activeTabText: {
    color: '#ffffff',
  },
  inactiveTabText: {
    color: '#64748b',
  },
  backToLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  backToLoginText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7',
    marginLeft: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorBannerText: {
    fontSize: 11.5,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 5,
    marginLeft: 2,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    marginHorizontal: 2,
  },
  forgotPassText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284c7',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  inputBoxError: {
    borderColor: '#f87171',
    backgroundColor: '#fff5f5',
  },
  inputIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0f172a',
    paddingVertical: 4,
  },
  eyeButton: {
    padding: 6,
  },
  fieldError: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ef4444',
    marginTop: 3,
    marginLeft: 4,
  },
  strengthMeter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  mainActionBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  trustBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },
});
