// app\App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Clean Architecture imports
import { HomeScreen } from './src/clean-architecture/presentation/screens/HomeScreen';
import { VisualizeScreen } from './src/clean-architecture/presentation/screens/VisualizeScreen';
import { AccountScreen } from './src/clean-architecture/presentation/screens/AccountScreen';
import { GoalScreen } from './src/clean-architecture/presentation/screens/GoalScreen';
import { SettingsScreen } from './src/clean-architecture/presentation/screens/SettingsScreen';
import { initializeContainer } from './src/clean-architecture/shared/di/Container';

// Legacy import temporário (RegisterScreen ainda não tem componente React)
import Register from './src/screens/Register/Register';

// ✅ MIGRAÇÃO CONCLUÍDA - Agora usando Clean Architecture
// - 5/6 screens usando Clean Architecture (HomeScreen, VisualizeScreen, AccountScreen, GoalScreen, SettingsScreen)
// - 1/6 screen legacy temporária (Register - será migrada quando RegisterScreen tiver componente React)
// - FinanceProvider foi removido (substituído pelo sistema de DI da Clean Architecture)
// - MigrationWrapper foi removido (não há mais componentes legados)
// - Feature flags foram removidas (todas as screens são Clean Architecture)

const Tab = createBottomTabNavigator();

// ✅ Usando diretamente as screens Clean Architecture (sem wrappers de migração)

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
          } else if (route.name === 'Accounts') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'construct' : 'construct-outline';
          }

          return <Ionicons name={iconName as any} size={26} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgb(182, 182, 182)',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Register" component={Register} />
      <Tab.Screen name="Visualize" component={VisualizeScreen} />
      <Tab.Screen name="Accounts" component={AccountScreen} />
      <Tab.Screen name="Goals" component={GoalScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Inicializar Container de DI da Clean Architecture
    initializeContainer();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <MyTabs />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}