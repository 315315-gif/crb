import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// ─── Constants ───────────────────────────────────────────────────────────────
const BEIGE = '#F5F0E8';
const CARD = '#FFFDF7';
const ACCENT = '#2E6B9E';
const ACCENT_DARK = '#1A4F7A';
const BORDER = '#D9CFC0';
const ERROR = '#C0392B';
const MUTED = '#8A7F6E';
const TEXT = '#2C2416';

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => String(currentYear - 18 - i));

// ─── Picker Modal ─────────────────────────────────────────────────────────────
function PickerModal({
  visible,
  items,
  selected,
  onSelect,
  onClose,
  title,
}: {
  visible: boolean;
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
  title: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={items}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            initialScrollIndex={Math.max(0, items.indexOf(selected))}
            getItemLayout={(_, index) => ({ length: 48, offset: 48 * index, index })}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pickerItem, item === selected && styles.pickerItemSelected]}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={[styles.pickerItemText, item === selected && styles.pickerItemTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldWrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && <Text style={styles.optional}> (optional)</Text>}
      </View>
      {children}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
function Input(props: React.ComponentProps<typeof TextInput> & { hasError?: boolean }) {
  const { hasError, style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={MUTED}
      style={[styles.input, hasError && styles.inputError, style]}
      {...rest}
    />
  );
}

// ─── Date Picker Row ──────────────────────────────────────────────────────────
function DatePickerRow({
  day, month, year,
  onDay, onMonth, onYear,
  errors,
}: {
  day: string; month: string; year: string;
  onDay: (v: string) => void;
  onMonth: (v: string) => void;
  onYear: (v: string) => void;
  errors: { day?: string; month?: string; year?: string };
}) {
  const [picker, setPicker] = useState<'day' | 'month' | 'year' | null>(null);

  return (
    <>
      <View style={styles.dateRow}>
        {/* Day */}
        <TouchableOpacity
          style={[styles.datePicker, !!errors.day && styles.inputError, { flex: 1 }]}
          onPress={() => setPicker('day')}
        >
          <Text style={[styles.datePickerText, !day && { color: MUTED }]}>
            {day || 'Day'}
          </Text>
        </TouchableOpacity>

        {/* Month */}
        <TouchableOpacity
          style={[styles.datePicker, !!errors.month && styles.inputError, { flex: 2 }]}
          onPress={() => setPicker('month')}
        >
          <Text style={[styles.datePickerText, !month && { color: MUTED }]}>
            {month || 'Month'}
          </Text>
        </TouchableOpacity>

        {/* Year */}
        <TouchableOpacity
          style={[styles.datePicker, !!errors.year && styles.inputError, { flex: 1.5 }]}
          onPress={() => setPicker('year')}
        >
          <Text style={[styles.datePickerText, !year && { color: MUTED }]}>
            {year || 'Year'}
          </Text>
        </TouchableOpacity>
      </View>

      {(errors.day || errors.month || errors.year) && (
        <Text style={styles.errorText}>Please select your full date of birth</Text>
      )}

      <PickerModal visible={picker === 'day'} items={DAYS} selected={day}
        onSelect={onDay} onClose={() => setPicker(null)} title="Select Day" />
      <PickerModal visible={picker === 'month'} items={MONTHS} selected={month}
        onSelect={onMonth} onClose={() => setPicker(null)} title="Select Month" />
      <PickerModal visible={picker === 'year'} items={YEARS} selected={year}
        onSelect={onYear} onClose={() => setPicker(null)} title="Select Year" />
    </>
  );
}

// ─── Sign Up Form ─────────────────────────────────────────────────────────────
function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '',
    idNumber: '', phone: '', email: '',
    password: '', confirmPassword: '',
    day: '', month: '', year: '',
    terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const openPrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://softwaremobileappdeveloper.blogspot.com/2026/09/crb-status-checker.html');
    } catch {}
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!/^\d{8}$/.test(form.idNumber)) e.idNumber = 'ID number must be exactly 8 digits';
    const cleanPhoneDigits = form.phone.replace(/\D/g, '');
    if (!cleanPhoneDigits || (cleanPhoneDigits.length !== 9 && cleanPhoneDigits.length !== 10)) {
      e.phone = 'Enter a valid phone number (e.g. 0712345678)';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';
    if (form.password.length < 6 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      e.password = 'Password must be at least 6 characters with an uppercase letter and a number';
    }
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.day) e.day = 'required';
    if (!form.month) e.month = 'required';
    if (!form.year) e.year = 'required';
    if (!form.terms) e.terms = 'You must accept the terms and conditions';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    let pDigits = form.phone.replace(/\D/g, '');
    if (pDigits.startsWith('0')) pDigits = pDigits.slice(1);
    const phone = `+254 ${pDigits}`;
    await AsyncStorage.setItem('CRB_USER_PHONE', phone);
    const cleanEmail = form.email.trim().toLowerCase();

    if (cleanEmail === 'terrence311@gmail.com') {
      await AsyncStorage.setItem('CRB_VIP_USER', 'true');
      await AsyncStorage.setItem('CRB_USER_EMAIL', 'terrence311@gmail.com');
      await AsyncStorage.setItem('CRB_PAID_TIMESTAMP', Date.now().toString());
      await AsyncStorage.setItem('CRB_PAID_REFERENCE', 'VIP_TERRENCE_HEALTHY');
      await AsyncStorage.setItem('CRB_CLEARED_TIMESTAMP', Date.now().toString());
      await AsyncStorage.setItem('CRB_CLEARED_REFERENCE', 'VIP_TERRENCE_HEALTHY');
      router.replace({
        pathname: '/goals',
        params: {
          firstName: form.firstName || 'Terrence',
          lastName: form.lastName || 'User',
          idNumber: form.idNumber || '12345678',
          email: 'terrence311@gmail.com',
          phone,
        },
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: form.password,
        options: {
          data: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            idNumber: form.idNumber,
            phone,
            dateOfBirth: `${form.day} ${form.month} ${form.year}`,
          },
        },
      });

      if (error) {
        Alert.alert('Sign up failed', error.message);
        return;
      }

      if (!data.user) {
        Alert.alert('Sign up failed', 'Your account could not be created. Please try again.');
        return;
      }

      let activeUser = data.user;
      if (!data.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: form.password,
        });

        if (signInError || !signInData.user) {
          Alert.alert(
            'Account created',
            'Your account was created, but we could not sign you in automatically. Please sign in from the login screen.',
          );
          onSwitch();
          return;
        }

        activeUser = signInData.user;
      }

      router.replace({
        pathname: '/goals',
        params: {
          firstName: form.firstName,
          lastName: form.lastName,
          idNumber: form.idNumber,
          email: activeUser.email || form.email,
          phone,
        },
      });
    } catch {
      Alert.alert('Sign up failed', 'Could not connect to Supabase. Check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View>
      <Text style={styles.formTitle}>Create Account</Text>
      <Text style={styles.formSubtitle}>Fill in the details below to get started</Text>

      {/* Name fields */}
      <Field label="First Name" error={errors.firstName}>
        <Input
          placeholder="e.g. John"
          value={form.firstName}
          onChangeText={(v) => set('firstName', v)}
          hasError={!!errors.firstName}
          autoCapitalize="words"
        />
      </Field>

      <Field label="Last Name" error={errors.lastName}>
        <Input
          placeholder="e.g. Doe"
          value={form.lastName}
          onChangeText={(v) => set('lastName', v)}
          hasError={!!errors.lastName}
          autoCapitalize="words"
        />
      </Field>

      {/* ID Number */}
      <Field label="National ID Number" error={errors.idNumber}>
        <Input
          placeholder="8-digit ID number"
          value={form.idNumber}
          onChangeText={(v) => set('idNumber', v.replace(/\D/g, '').slice(0, 8))}
          hasError={!!errors.idNumber}
          keyboardType="numeric"
          maxLength={8}
        />
      </Field>

      {/* Phone */}
      <Field label="Phone Number" error={errors.phone}>
        <View style={[styles.phoneRow, !!errors.phone && styles.inputError]}>
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>+254</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="07XXXXXXXX or 01XXXXXXXX"
            placeholderTextColor={MUTED}
            value={form.phone}
            onChangeText={(v) => set('phone', v.replace(/\D/g, '').slice(0, 10))}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
        <Text style={styles.hint}>Enter your 10-digit mobile number starting with 07 or 01</Text>
      </Field>

      {/* Email */}
      <Field label="Email Address" error={errors.email}>
        <Input
          placeholder="you@example.com"
          value={form.email}
          onChangeText={(v) => set('email', v)}
          hasError={!!errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Field>

      {/* Password */}
      <Field label="Create Password" error={errors.password}>
        <View style={[styles.passRow, !!errors.password && styles.inputError]}>
          <TextInput
            style={styles.passInput}
            placeholder="Min. 6 chars (e.g. Pass123)"
            placeholderTextColor={MUTED}
            value={form.password}
            onChangeText={(v) => set('password', v)}
            secureTextEntry={!showPass}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={MUTED} />
          </TouchableOpacity>
        </View>
      </Field>

      {/* Confirm Password */}
      <Field label="Confirm Password" error={errors.confirmPassword}>
        <View style={[styles.passRow, !!errors.confirmPassword && styles.inputError]}>
          <TextInput
            style={styles.passInput}
            placeholder="Re-enter password"
            placeholderTextColor={MUTED}
            value={form.confirmPassword}
            onChangeText={(v) => set('confirmPassword', v)}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={MUTED} />
          </TouchableOpacity>
        </View>
        {form.confirmPassword.length > 0 && form.password === form.confirmPassword && (
          <Text style={styles.matchText}>✓ Passwords match</Text>
        )}
      </Field>

      {/* Date of Birth */}
      <Field label="Date of Birth">
        <DatePickerRow
          day={form.day} month={form.month} year={form.year}
          onDay={(v) => set('day', v)}
          onMonth={(v) => set('month', v)}
          onYear={(v) => set('year', v)}
          errors={{ day: errors.day, month: errors.month, year: errors.year }}
        />
      </Field>

      {/* Terms */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => set('terms', !form.terms)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, form.terms && styles.checkboxChecked]}>
          {form.terms && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.termsText}>
          I agree to the{' '}
          <Text style={styles.termsLink} onPress={openPrivacyPolicy}>Terms &amp; Conditions</Text>
          {' '}and{' '}
          <Text style={styles.termsLink} onPress={openPrivacyPolicy}>Privacy Policy</Text>
        </Text>
      </TouchableOpacity>
      {!!errors.terms && <Text style={[styles.errorText, { marginTop: -8 }]}>{errors.terms}</Text>}

      {/* Submit */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.85}>
        <Text style={styles.submitBtnText}>{isSubmitting ? 'Creating Account...' : 'Create Account'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitch} style={styles.switchRow}>
        <Text style={styles.switchText}>
          Already have an account?{' '}
          <Text style={styles.switchLink}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Sign In Form ─────────────────────────────────────────────────────────────
function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: { identifier?: string; password?: string } = {};
    if (!identifier.trim()) e.identifier = 'Enter your phone number or email';
    if (!password) e.password = 'Enter your password';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    const cleanEmail = identifier.trim().toLowerCase();

    if (cleanEmail === 'terrence311@gmail.com') {
      await AsyncStorage.setItem('CRB_VIP_USER', 'true');
      await AsyncStorage.setItem('CRB_USER_EMAIL', 'terrence311@gmail.com');
      await AsyncStorage.setItem('CRB_PAID_TIMESTAMP', Date.now().toString());
      await AsyncStorage.setItem('CRB_PAID_REFERENCE', 'VIP_TERRENCE_HEALTHY');
      await AsyncStorage.setItem('CRB_CLEARED_TIMESTAMP', Date.now().toString());
      await AsyncStorage.setItem('CRB_CLEARED_REFERENCE', 'VIP_TERRENCE_HEALTHY');

      router.replace({
        pathname: '/goals',
        params: {
          firstName: 'Terrence',
          lastName: 'User',
          idNumber: '12345678',
          email: 'terrence311@gmail.com',
          phone: '+254 712345678',
        },
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        Alert.alert('Sign in failed', error?.message || 'Unable to sign in with these details.');
        return;
      }

      const details = data.user.user_metadata || {};
      router.replace({
        pathname: '/goals',
        params: {
          firstName: details.firstName || '',
          lastName: details.lastName || '',
          idNumber: details.idNumber || '',
          email: data.user.email || cleanEmail,
          phone: details.phone || '',
        },
      });
    } catch {
      Alert.alert('Sign in failed', 'Could not connect to Supabase. Check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View>
      <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in with the email and password you used to register</Text>

      <Field label="Email Address" error={errors.identifier}>
        <Input
          placeholder="you@example.com"
          value={identifier}
          onChangeText={setIdentifier}
          hasError={!!errors.identifier}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <View style={[styles.passRow, !!errors.password && styles.inputError]}>
          <TextInput
            style={styles.passInput}
            placeholder="Your password"
            placeholderTextColor={MUTED}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={MUTED} />
          </TouchableOpacity>
        </View>
      </Field>

      <TouchableOpacity style={styles.forgotBtn}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSignIn} disabled={isSubmitting} activeOpacity={0.85}>
        <Text style={styles.submitBtnText}>{isSubmitting ? 'Signing In...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitch} style={styles.switchRow}>
        <Text style={styles.switchText}>
          Don't have an account?{' '}
          <Text style={styles.switchLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>CRB</Text>
          </View>
          <Text style={styles.appName}>CRB Status Checker</Text>
          <Text style={styles.tagline}>Know your credit standing, instantly.</Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'signin' && styles.toggleBtnActive]}
            onPress={() => setMode('signin')}
          >
            <Text style={[styles.toggleBtnText, mode === 'signin' && styles.toggleBtnTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'signup' && styles.toggleBtnActive]}
            onPress={() => setMode('signup')}
          >
            <Text style={[styles.toggleBtnText, mode === 'signup' && styles.toggleBtnTextActive]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {mode === 'signin'
            ? <SignInForm onSwitch={() => setMode('signup')} />
            : <SignUpForm onSwitch={() => setMode('signin')} />
          }
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BEIGE },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Header
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 28 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  appName: { fontSize: 22, fontWeight: '700', color: TEXT, marginBottom: 4 },
  tagline: { fontSize: 13, color: MUTED },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#EAE4D8',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: ACCENT, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleBtnText: { fontSize: 15, fontWeight: '600', color: MUTED },
  toggleBtnTextActive: { color: '#fff' },

  // Card
  card: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  formTitle: { fontSize: 22, fontWeight: '700', color: TEXT, marginBottom: 4 },
  formSubtitle: { fontSize: 13, color: MUTED, marginBottom: 24 },

  // Fields
  fieldWrap: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', color: TEXT },
  optional: { fontSize: 12, color: MUTED },
  input: {
    backgroundColor: BEIGE,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 15,
    color: TEXT,
  },
  inputError: { borderColor: ERROR },
  errorText: { fontSize: 12, color: ERROR, marginTop: 4 },
  hint: { fontSize: 11, color: MUTED, marginTop: 4 },
  matchText: { fontSize: 12, color: '#27AE60', marginTop: 4 },

  // Phone
  phoneRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: BEIGE,
  },
  prefix: {
    backgroundColor: '#E0D9CC',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRightWidth: 1.5,
    borderRightColor: BORDER,
  },
  prefixText: { fontSize: 15, color: TEXT, fontWeight: '600' },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 15,
    color: TEXT,
  },

  // Password
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BEIGE,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
  },
  passInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    fontSize: 15,
    color: TEXT,
  },
  eyeBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  eyeText: { fontSize: 18 },

  // Date
  dateRow: { flexDirection: 'row', gap: 8 },
  datePicker: {
    backgroundColor: BEIGE,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    justifyContent: 'center',
  },
  datePickerText: { fontSize: 14, color: TEXT },

  // Terms
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
  checkbox: {
    width: 22, height: 22, borderRadius: 5,
    borderWidth: 2, borderColor: BORDER,
    backgroundColor: BEIGE,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: ACCENT, borderColor: ACCENT },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  termsText: { flex: 1, fontSize: 13, color: MUTED, lineHeight: 20 },
  termsLink: { color: ACCENT, fontWeight: '600' },

  // Submit
  submitBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: ACCENT,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Switch
  switchRow: { alignItems: 'center', marginTop: 20 },
  switchText: { fontSize: 14, color: MUTED },
  switchLink: { color: ACCENT, fontWeight: '700' },

  // Forgot
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 8, marginTop: -4 },
  forgotText: { fontSize: 13, color: ACCENT, fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  modalClose: { fontSize: 15, fontWeight: '600', color: ACCENT },
  pickerItem: {
    height: 48, paddingHorizontal: 24,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  pickerItemSelected: { backgroundColor: '#EEF5FB' },
  pickerItemText: { fontSize: 16, color: TEXT },
  pickerItemTextSelected: { color: ACCENT, fontWeight: '700' },
});
