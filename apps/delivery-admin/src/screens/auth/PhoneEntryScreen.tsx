import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';

export function PhoneEntryScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
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

      <Text style={styles.badge}>PARTNER APP</Text>
      <Text style={[typography.h1, styles.title]}>Delivery & Management</Text>
      <Text style={styles.subtitle}>Sign in with the mobile number your admin registered for you.</Text>

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

      {error && <Text style={styles.error}>{error}</Text>}

      <Button label="Continue" onPress={handleContinue} loading={loading} disabled={phone.length < 10} style={{ marginTop: 20 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 40, marginBottom: 20 },
  logoMark: { width: 44, height: 44, borderRadius: 13, backgroundColor: colors.greenDeep, alignItems: 'center', justifyContent: 'center' },
  logoMarkText: { color: colors.white, fontFamily: fontFamily.headingBold, fontSize: 20 },
  logoText: { fontFamily: fontFamily.headingBold, fontSize: 22, color: colors.greenDeep },
  badge: { fontFamily: fontFamily.bodyExtraBold, fontSize: 11, letterSpacing: 1, color: colors.green, marginBottom: 6 },
  title: { marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.body, fontSize: 13.5, color: colors.inkSoft, marginBottom: 28, lineHeight: 19 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.md - 2, paddingHorizontal: 16, height: 54, ...shadow.card },
  prefix: { fontFamily: fontFamily.bodyBold, fontSize: 15, color: colors.ink, marginRight: 10 },
  input: { flex: 1, fontFamily: fontFamily.body, fontSize: 16, color: colors.ink },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginTop: 10 },
});
