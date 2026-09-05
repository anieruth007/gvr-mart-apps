import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily } from '@gvr-mart/theme';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CategoryListScreen } from '../screens/catalog/CategoryListScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { AccountScreen } from '../screens/account/AccountScreen';
import { useCart } from '../context/CartContext';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const ICONS: Record<keyof MainTabParamList, { outline: IconName; filled: IconName }> = {
  Home: { outline: 'home-outline', filled: 'home' },
  Categories: { outline: 'grid-outline', filled: 'grid' },
  Cart: { outline: 'cart-outline', filled: 'cart' },
  Account: { outline: 'person-outline', filled: 'person' },
};

export function MainTabs() {
  const { cart } = useCart();
  const insets = useSafeAreaInsets();
  // Bottom tabs default to a fixed height, which ignores the device's gesture-nav / 3-button
  // inset and leaves the bar sitting flush against it. Add the inset back in explicitly.
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.blueDeep,
        tabBarInactiveTintColor: '#ABB2A2',
        tabBarStyle: { borderTopColor: colors.border, height: 54 + bottomInset, paddingTop: 6, paddingBottom: bottomInset },
        tabBarLabelStyle: { fontFamily: fontFamily.bodyBold, fontSize: 10.5 },
        tabBarIcon: ({ focused, color }) => {
          const icon = ICONS[route.name as keyof MainTabParamList];
          return <Ionicons name={focused ? icon.filled : icon.outline} size={21} color={color} />;
        },
        tabBarBadge: route.name === 'Cart' && cart && cart.itemCount > 0 ? cart.itemCount : undefined,
        tabBarBadgeStyle: { backgroundColor: colors.tomato, fontSize: 9.5 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories" component={CategoryListScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
