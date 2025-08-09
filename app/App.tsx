// app\App.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Home from './src/screens/Home/Home';
import Visualize from './src/screens/Visualize/Visualize';
import Register from './src/screens/Register/Register';
import Settings from './src/screens/Settings/Settings';
import Goals from './src/screens/Plan/Plan';
import Accounts from './src/screens/Accounts/Accounts';
import { FinanceProvider } from './src/contexts/FinanceContext';
import { db } from './src/database/db';

// Clean Architecture imports
import { HomeScreen } from './src/clean-architecture/presentation/screens/HomeScreen';
import { FeatureFlagManager } from './src/clean-architecture/shared/feature-flags/FeatureFlags';
import { MigrationWrapper } from './src/clean-architecture/shared/migration/MigrationWrapper';
import { initializeContainer } from './src/clean-architecture/shared/di/Container';

// TODO: Após migrar todas as telas para Clean Architecture, remover:
// - Todas as importações de ./src/screens/* (Home, Visualize, Register, Settings, Goals, Accounts)
// - FinanceProvider (será substituído pelo sistema de DI da Clean Architecture)
// - db import (será gerenciado pela camada de dados da Clean Architecture)
// - MigrationWrapper (quando não houver mais componentes legados)
// 
// APENAS MANTER:
// - React, StatusBar, SafeAreaProvider, NavigationContainer, createBottomTabNavigator, Ionicons, GestureHandlerRootView
// - Imports das novas screens: HomeScreen, RegisterScreen, AccountScreen, GoalScreen, OperationScreen, SettingsScreen
// - Container de DI da Clean Architecture

const Tab = createBottomTabNavigator();

// Inicializar Feature Flag Manager
const featureFlagManager = new FeatureFlagManager();

// Habilitar a nova HomeScreen da Clean Architecture
featureFlagManager.enable('USE_CLEAN_HOME_SCREEN');

// Componente wrapper para a Home Screen com migração
function HomeScreenWrapper({ navigation }: any) {
  return (
    <MigrationWrapper
      featureFlag="USE_CLEAN_HOME_SCREEN"
      featureFlagManager={featureFlagManager}
      legacyComponent={<Home navigation={navigation} />}
      cleanComponent={<HomeScreen navigation={navigation} />}
    />
  );
}

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
      <Tab.Screen name="Home" component={HomeScreenWrapper} />
      <Tab.Screen name="Register" component={Register} />
      <Tab.Screen name="Visualize" component={Visualize} />
      <Tab.Screen name="Accounts" component={Accounts} />
      <Tab.Screen name="Goals" component={Goals} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        console.log('[Cleanup] Iniciando limpeza de duplicatas em budget_items...');
        // Remove duplicatas mantendo o registro mais antigo (menor created_at ou id)
        await db.execAsync(`
          DELETE FROM budget_items
          WHERE id NOT IN (
            SELECT MIN(id) FROM budget_items
            GROUP BY budget_id, category_name, category_type
          );
        `);
        console.log('[Cleanup] Limpeza de duplicatas em budget_items concluída!');
        
        // Inicializar Container de DI da Clean Architecture
        initializeContainer();
      } catch (err) {
        console.error('[Cleanup] Erro ao limpar duplicatas em budget_items:', err);
      }
    })();
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     console.warn('⚠️ Resetando banco e migrando estrutura. Remova este trecho após a migração!');
  //     await resetDatabase();
  //     await setupDatabase();
  //   })();
  // }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FinanceProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <MyTabs />
          </NavigationContainer>
        </FinanceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}