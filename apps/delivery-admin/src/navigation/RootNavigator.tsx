import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, fontFamily } from '@gvr-mart/theme';
import { useAuth } from '../context/AuthContext';
import { PhoneEntryScreen } from '../screens/auth/PhoneEntryScreen';
import { OtpVerifyScreen } from '../screens/auth/OtpVerifyScreen';
import { DeliveryDashboardScreen } from '../screens/delivery/DeliveryDashboardScreen';
import { AssignedDeliveriesScreen } from '../screens/delivery/AssignedDeliveriesScreen';
import { DeliveryDetailScreen } from '../screens/delivery/DeliveryDetailScreen';
import { DeliveryHistoryScreen } from '../screens/delivery/DeliveryHistoryScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminOrdersScreen } from '../screens/admin/AdminOrdersScreen';
import { AdminOrderDetailScreen } from '../screens/admin/AdminOrderDetailScreen';
import { AdminBulkEnquiriesScreen } from '../screens/admin/AdminBulkEnquiriesScreen';
import { AdminQuotationFormScreen } from '../screens/admin/AdminQuotationFormScreen';
import { AdminProductsScreen } from '../screens/admin/AdminProductsScreen';
import { AdminCustomersScreen } from '../screens/admin/AdminCustomersScreen';
import { AdminDeliveryPartnersScreen } from '../screens/admin/AdminDeliveryPartnersScreen';
import { AdminCouponsScreen } from '../screens/admin/AdminCouponsScreen';
import { AdminReportsScreen } from '../screens/admin/AdminReportsScreen';

const AuthStack = createNativeStackNavigator();
const DeliveryStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.cream } };

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

function DeliveryNavigator() {
  return (
    <DeliveryStack.Navigator screenOptions={screenHeaderOptions}>
      <DeliveryStack.Screen name="DeliveryDashboard" component={DeliveryDashboardScreen} options={{ headerShown: false }} />
      <DeliveryStack.Screen name="AssignedDeliveries" component={AssignedDeliveriesScreen} options={{ title: 'Assigned Deliveries' }} />
      <DeliveryStack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} options={{ title: 'Delivery' }} />
      <DeliveryStack.Screen name="DeliveryHistory" component={DeliveryHistoryScreen} options={{ title: 'History' }} />
    </DeliveryStack.Navigator>
  );
}

function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={screenHeaderOptions}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
      <AdminStack.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ title: 'Orders' }} />
      <AdminStack.Screen name="AdminOrderDetail" component={AdminOrderDetailScreen} options={{ title: 'Order' }} />
      <AdminStack.Screen name="AdminBulkEnquiries" component={AdminBulkEnquiriesScreen} options={{ title: 'Bulk Enquiries' }} />
      <AdminStack.Screen name="AdminQuotationForm" component={AdminQuotationFormScreen} options={{ title: 'Quotation' }} />
      <AdminStack.Screen name="AdminProducts" component={AdminProductsScreen} options={{ title: 'Products' }} />
      <AdminStack.Screen name="AdminCustomers" component={AdminCustomersScreen} options={{ title: 'Customers' }} />
      <AdminStack.Screen name="AdminDeliveryPartners" component={AdminDeliveryPartnersScreen} options={{ title: 'Delivery Partners' }} />
      <AdminStack.Screen name="AdminCoupons" component={AdminCouponsScreen} options={{ title: 'Coupons' }} />
      <AdminStack.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: 'Reports' }} />
    </AdminStack.Navigator>
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
      {!user ? <AuthNavigator /> : user.role === 'ADMIN' ? <AdminNavigator /> : <DeliveryNavigator />}
    </NavigationContainer>
  );
}
