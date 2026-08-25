import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TurfsScreen from '../screens/turfs/TurfsScreen';
import TurfDetailScreen from '../screens/turfs/TurfDetailScreen';
import TurfWizardScreen from '../screens/turfs/TurfWizardScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import CreateOfflineBookingScreen from '../screens/bookings/CreateOfflineBookingScreen';
import MoneyScreen from '../screens/money/MoneyScreen';
import PayLtpScreen from '../screens/money/PayLtpScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import UpiSetupScreen from '../screens/account/UpiSetupScreen';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="CreateOfflineBooking" component={CreateOfflineBookingScreen} />
    </Stack.Navigator>
  );
}

function TurfsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TurfsList" component={TurfsScreen} />
      <Stack.Screen name="TurfDetail" component={TurfDetailScreen} />
      <Stack.Screen name="TurfWizard" component={TurfWizardScreen} />
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

function MoneyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoneyHome" component={MoneyScreen} />
      <Stack.Screen name="PayLtp" component={PayLtpScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="UpiSetup" component={UpiSetupScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { user } = useAuth();
  const [upiSkipped, setUpiSkipped] = React.useState(false);

  if (user && !user.has_upi && !upiSkipped) {
    return (
      <UpiSetupScreen
        blocking
        onSkip={() => setUpiSkipped(true)}
      />
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Turfs') iconName = focused ? 'football' : 'football-outline';
          else if (route.name === 'Bookings') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Money') iconName = focused ? 'wallet' : 'wallet-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary[600],
        tabBarInactiveTintColor: COLORS.textSecondary,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Turfs" component={TurfsStack} />
      <Tab.Screen name="Bookings" component={BookingsStack} />
      <Tab.Screen name="Money" component={MoneyStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
