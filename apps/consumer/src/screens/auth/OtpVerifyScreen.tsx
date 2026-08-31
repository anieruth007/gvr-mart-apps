import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, shadow, typography, fontFamily } from '@gvr-mart/theme';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../api/client';

export function OtpVerifyScreen({ route }: any) {
  const { phone, devOtp } = route.params as { phone: string; devOtp?: string };
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifyOtp } = useAuth();

  const handleVerify = async () => {
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(phone, code);
    } catch (e) {
      setError(e instanceof ApiError ? e.messages[0] : 'Could not verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <Text style={[typography.h1, styles.title]}>Verify your number</Text>
      <Text style={styles.subtitle}>Enter the code sent to {phone}</Text>

      {devOtp && (
        <View style={styles.devHint}>
          <Text style={styles.devHintText}>
            Preview build — SMS isn't wired up yet. Your code is <Text style={styles.devHintCode}>{devOtp}</Text>
          </Text>
        </View>
      )}

      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="••••••"
        placeholderTextColor={colors.muted}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.otpInput}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button label="Verify & Continue" onPress={handleVerify} loading={loading} disabled={code.length < 4} style={{ marginTop: 20 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 40, marginBottom: 8 },
  subtitle: { fontFamily: fontFamily.body, fontSize: 13.5, color: colors.inkSoft, marginBottom: 24 },
  devHint: { backgroundColor: colors.mangoSoft, borderRadius: radii.sm, padding: 12, marginBottom: 20 },
  devHintText: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.ink, lineHeight: 18 },
  devHintCode: { fontFamily: fontFamily.bodyExtraBold, color: colors.greenDeep, fontSize: 14 },
  otpInput: {
    backgroundColor: colors.white,
    borderRadius: radii.md - 2,
    height: 54,
    textAlign: 'center',
    fontFamily: fontFamily.headingBold,
    fontSize: 22,
    letterSpacing: 8,
    color: colors.ink,
    ...shadow.card,
  },
  error: { color: colors.tomato, fontFamily: fontFamily.bodyMedium, fontSize: 12.5, marginTop: 10 },
});
