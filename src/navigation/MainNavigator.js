import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TurfsScreen from '../screens/turfs/TurfsScreen';
import TurfDetailScreen from '../screens/turfs/TurfDetailScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import CreateOfflineBookingScreen from '../screens/bookings/CreateOfflineBookingScreen';
import PayoutsScreen from '../screens/payouts/PayoutsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TurfsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TurfsList" component={TurfsScreen} />
      <Stack.Screen name="TurfDetail" component={TurfDetailScreen} />
    </Stack.Navigator>
  );
}

function BookingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookingsList" component={BookingsScreen} />
      <Stack.Screen name="CreateOfflineBooking" component={CreateOfflineBookingScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Turfs') iconName = focused ? 'football' : 'football-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Payouts') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Turfs" component={TurfsStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="Payouts" component={PayoutsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
