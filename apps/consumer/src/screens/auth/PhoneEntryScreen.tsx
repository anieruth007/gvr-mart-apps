import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';

export function PhoneEntryScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendOtp } = useAuth();

  const handleContinue = async () => {
    setError(null);
    const normalized = phone.startsWith('+91') ? phone : `+91${phone}`;
    setLoading(true);
    try {
      const { devOtp } = await sendOtp(normalized);
      navigation.navigate('OtpVerify', { phone: normalized, devOtp });
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.logoRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>G</Text>
        </View>
        <Text style={styles.logoText}>
          GVR <Text style={{ color: colors.mango }}>Mart</Text>
        </Text>
      </View>

      <Text style={[typography.h1, styles.title]}>Farm-fresh, delivered in 30 minutes.</Text>
      <Text style={styles.subtitle}>Enter your mobile number to continue</Text>

      <View style={styles.inputRow}>
        <Text style={styles.prefix}>+91</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="98765 43210"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          maxLength={10}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.consentRow} onPress={() => setAgreed((v) => !v)} activeOpacity={0.8}>
        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
          {agreed && <Ionicons name="checkmark" size={13} color={colors.white} />}
        </View>
        <Text style={styles.consentText}>
          I agree to the{' '}
          <Text style={styles.consentLink} onPress={() => navigation.navigate('Policy', { type: 'terms' })}>
            Terms & Conditions
          </Text>{' '}
          and{' '}
          <Text style={styles.consentLink} onPress={() => navigation.navigate('Policy', { type: 'privacy' })}>
            Privacy Policy
          </Text>
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button label="Continue" onPress={handleContinue} loading={loading} disabled={phone.length < 10 || !agreed} style={{ marginTop: 20 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 40, marginBottom: 36 },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.blueDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { color: colors.white, fontFamily: fontFamily.headingBold, fontSize: 20 },
  logoText: { fontFamily: fontFamily.headingBold, fontSize: 22, color: colors.blueDeep },
  title: { marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.body, fontSize: 13.5, color: colors.inkSoft, marginBottom: 28 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md - 2,
    paddingHorizontal: 16,
    height: 54,
    ...shadow.card,
  },
  prefix: { fontFamily: fontFamily.bodyBold, fontSize: 15, color: colors.ink, marginRight: 10 },
  input: { flex: 1, fontFamily: fontFamily.body, fontSize: 16, color: colors.ink },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginTop: 10 },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 20 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.blue, borderColor: colors.blue },
  consentText: { flex: 1, fontFamily: fontFamily.body, fontSize: 12.5, color: colors.inkSoft, lineHeight: 18 },
  consentLink: { fontFamily: fontFamily.bodyBold, color: colors.blueDeep },
});
