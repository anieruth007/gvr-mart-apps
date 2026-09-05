import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.blueDeep,
        tabBarInactiveTintColor: '#ABB2A2',
        tabBarStyle: { borderTopColor: colors.border, height: 62, paddingTop: 6, paddingBottom: 8 },
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
