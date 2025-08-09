// app\App.tsx - VERSÃO FINAL após migração completa para Clean Architecture
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Clean Architecture screens
import { HomeScreen } from './src/clean-architecture/presentation/screens/HomeScreen';
import { RegisterScreen } from './src/clean-architecture/presentation/screens/RegisterScreen';
import { VisualizeScreen } from './src/clean-architecture/presentation/screens/VisualizeScreen';
import { AccountScreen } from './src/clean-architecture/presentation/screens/AccountScreen';
import { GoalScreen } from './src/clean-architecture/presentation/screens/GoalScreen';
import { SettingsScreen } from './src/clean-architecture/presentation/screens/SettingsScreen';

// Clean Architecture DI Container
import { Container } from './src/clean-architecture/shared/di/Container';

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
      <Tab.Screen name="Register" component={RegisterScreen} />
      <Tab.Screen name="Visualize" component={VisualizeScreen} />
      <Tab.Screen name="Accounts" component={AccountScreen} />
      <Tab.Screen name="Goals" component={GoalScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        // Inicializar o Container de DI da Clean Architecture
        await Container.initialize();
        console.log('[Clean Architecture] Container inicializado com sucesso!');
      } catch (err) {
        console.error('[Clean Architecture] Erro ao inicializar container:', err);
      }
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Não precisa mais do FinanceProvider! O Container da Clean Architecture gerencia tudo */}
        <NavigationContainer>
          <StatusBar style="auto" />
          <MyTabs />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ✅ BENEFÍCIOS DA VERSÃO FINAL:
// 
// 1. 🧹 CÓDIGO LIMPO:
//    - Removeu 6 importações de telas antigas (./src/screens/*)
//    - Removeu FinanceProvider 
//    - Removeu db import direto
//    - Removeu MigrationWrapper
//
// 2. 🏗️ ARQUITETURA CONSISTENTE:
//    - Todas as telas seguem Clean Architecture
//    - Container de DI gerencia dependências
//    - Separação clara de responsabilidades
//
// 3. 🎯 MANUTENIBILIDADE:
//    - Fácil adicionar novas telas
//    - Fácil testar (DI permite mocking)
//    - Padrão consistente em todo app
//
// 4. 📦 BUNDLE SIZE:
//    - Código legado removido
//    - Menos dependências
//    - Melhor tree-shaking
