import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, fontFamily } from '@gvr-mart/theme';
import { useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { PhoneEntryScreen } from '../screens/auth/PhoneEntryScreen';
import { OtpVerifyScreen } from '../screens/auth/OtpVerifyScreen';
import { MainTabs } from './MainTabs';
import { ProductDetailScreen } from '../screens/product/ProductDetailScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { OrderTrackingScreen } from '../screens/orders/OrderTrackingScreen';
import { OrderHistoryScreen } from '../screens/orders/OrderHistoryScreen';
import { BulkOrderFormScreen } from '../screens/bulk/BulkOrderFormScreen';
import { MyEnquiriesScreen } from '../screens/bulk/MyEnquiriesScreen';
import { QuotationDetailScreen } from '../screens/bulk/QuotationDetailScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { AddressListScreen } from '../screens/addresses/AddressListScreen';
import { AddAddressScreen } from '../screens/addresses/AddAddressScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.cream },
};

const screenHeaderOptions = {
  headerStyle: { backgroundColor: colors.cream },
  headerShadowVisible: false,
  headerTintColor: colors.blueDeep,
  headerTitleStyle: { fontFamily: fontFamily.headingSemibold, fontSize: 17 },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="PhoneEntry" component={PhoneEntryScreen} />
      <AuthStack.Screen name="OtpVerify" component={OtpVerifyScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <CartProvider>
      <Stack.Navigator screenOptions={screenHeaderOptions}>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Order' }} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ title: 'My Orders' }} />
        <Stack.Screen name="BulkOrderForm" component={BulkOrderFormScreen} options={{ title: 'Bulk Order' }} />
        <Stack.Screen name="MyEnquiries" component={MyEnquiriesScreen} options={{ title: 'Bulk Enquiries' }} />
        <Stack.Screen name="QuotationDetail" component={QuotationDetailScreen} options={{ title: 'Quotation' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="AddressList" component={AddressListScreen} options={{ title: 'Addresses' }} />
        <Stack.Screen name="AddAddress" component={AddAddressScreen} options={{ title: 'Add Address' }} />
      </Stack.Navigator>
    </CartProvider>
  );
}

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.blue} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
