// app\App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from './src/screens/Home/Home';
import Visualize from './src/screens/Visualize/Visualize';
import Register from './src/screens/Register/Register';
import Settings from './src/screens/Settings/Settings';
import Goals from './src/screens/Plan/Plan';
import { FinanceProvider } from './src/contexts/FinanceContext';

const Tab = createBottomTabNavigator();

function MyTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'rgb(29, 29, 29)',
          height: 35 + insets.bottom,
          borderTopWidth: 0,
          elevation: 10,
          zIndex: 10,
          padding: insets.bottom > 0 ? insets.bottom : 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Register') {
            iconName = focused ? 'pencil' : 'pencil-outline';
          } else if (route.name === 'Visualize') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Goals') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'construct' : 'construct-outline';
          }

          return <Ionicons name={iconName as any} size={26} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgb(182, 182, 182)',
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Register" component={Register} />
      <Tab.Screen name="Visualize" component={Visualize} />
      <Tab.Screen name="Goals" component={Goals} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <MyTabs />
        </NavigationContainer>
      </FinanceProvider>
    </SafeAreaProvider>
  );
}