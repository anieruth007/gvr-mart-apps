import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '@gvr-mart/theme';
import { ScreenContainer } from '../../components/ScreenContainer';

// Placeholder legal copy so the consent flow is fully wired up end-to-end. This needs a real
// legal review before launch — especially the data-collection section, given India's DPDP Act.
const TERMS = `Last updated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}

1. About GVR Mart
GVR Mart is a quick-commerce grocery delivery service. By creating an account, you agree to these Terms & Conditions.

2. Orders & Payment
Orders are currently accepted on a Cash on Delivery basis. Prices, discounts, and delivery fees are shown at checkout before you place an order. We reserve the right to cancel an order if an item becomes unavailable after ordering.

3. Delivery
We aim to deliver within the estimated time shown at checkout, but delivery times may vary due to weather, traffic, or other factors outside our control.

4. Your Responsibilities
You agree to provide accurate delivery address and contact details, and to be reasonably available to receive your order.

5. Bulk Orders
Bulk orders are subject to a separate quotation process and confirmation before they are treated as placed.

6. Changes to These Terms
We may update these terms from time to time. Continued use of the app after a change means you accept the updated terms.

7. Contact
For questions about these terms, contact GVR Mart support through the app.`;

const PRIVACY = `Last updated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}

1. What We Collect
To provide our delivery service, we collect your phone number, name (optional), delivery address(es), and your order history.

2. How We Use It
- Your phone number is used to verify your identity via a one-time code and to contact you about your orders.
- Your delivery address is shared with the delivery partner assigned to your order, solely to complete delivery.
- Your order history is used to show you past orders and to improve product recommendations.

3. What We Don't Do
We do not sell your personal information to third parties.

4. Data Retention
We retain your account and order data for as long as your account is active, or as required by law.

5. Your Rights
You may request a copy of your data or ask us to delete your account by contacting GVR Mart support through the app.

6. Security
We take reasonable technical measures to protect your data, but no method of transmission over the internet is 100% secure.

7. Contact
For privacy questions or requests, contact GVR Mart support through the app.`;

export function PolicyScreen({ route, navigation }: any) {
  const type: 'terms' | 'privacy' = route?.params?.type ?? 'terms';
  const title = type === 'terms' ? 'Terms & Conditions' : 'Privacy Policy';
  const body = type === 'terms' ? TERMS : PRIVACY;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.blueDeep} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <ScreenContainer>
        <Text style={styles.body}>{body}</Text>
      </ScreenContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 4 },
  backBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  headerTitle: { fontFamily: fontFamily.headingBold, fontSize: 17, color: colors.blueDeep },
  body: { fontFamily: fontFamily.body, fontSize: 13, color: colors.ink, lineHeight: 21 },
});
