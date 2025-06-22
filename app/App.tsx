import React from 'react'
import { StatusBar } from 'expo-status-bar';

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Home from '../app/src/screens/Home/Home'
import Visualize from '../app/src/screens/Visualize/Visualize'
import Register from '../app/src/screens/Register/Register'
import Settings from '../app/src/screens/Settings/Settings'
import Goals from '../app/src/screens/Goals/Goals'

const Tab = createBottomTabNavigator();

function MyTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'white',
          height: 35 + insets.bottom,
          borderTopWidth: 0,
          elevation: 10,
          zIndex: 10,
          padding: insets.bottom > 0 ? insets.bottom: 10
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'Início') {
            iconName = focused ? 'person-add' : 'person-add-outline';
          } else if (route.name === 'Register') {
            iconName = focused ? 'person-id' : 'person-add-outline';
          }

          return <Ionicons name={iconName as any} size={26} color={color}/>
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
      })}>
        <Tab.Screen name="Início" component={Home} />
        <Tab.Screen name="Registro" component={Register} />
    </Tab.Navigator>
    );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MyTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
