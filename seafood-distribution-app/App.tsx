import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { ImportScreen } from './src/screens/ImportScreen';
import { CargoConfirmationScreen } from './src/screens/CargoConfirmationScreen';

// Store
import { useStore } from './src/store/useStore';

// Types
import { RootStackParamList, MainTabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main Tab Navigator (after login)
 */
function MainTabs() {
  const { user } = useStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Encomendas',
          tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📦</span>,
        }}
      />

      {user?.role === 'admin' && (
        <Tab.Screen
          name="Import"
          component={ImportScreen}
          options={{
            tabBarLabel: 'Importar',
            tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>📋</span>,
          }}
        />
      )}

      {user?.role === 'distributor' && (
        <Tab.Screen
          name="MyOrders"
          component={CargoConfirmationScreen}
          options={{
            tabBarLabel: 'Minha Carga',
            tabBarIcon: ({ color }) => <span style={{ fontSize: 24 }}>✅</span>,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

/**
 * Main App Component
 */
export default function App() {
  const { user, setUser, isAuthenticated, isDarkMode } = useStore();

  // Mock login function (replace with real Firebase auth)
  const handleLogin = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user data
    if (email === 'admin@seafood.com' && password === 'admin123') {
      setUser({
        id: '1',
        email,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
      });
    } else if (email === 'dist@seafood.com' && password === 'dist123') {
      setUser({
        id: '2',
        email,
        name: 'João Distribuidor',
        role: 'distributor',
        createdAt: new Date(),
      });
    } else {
      throw new Error('Credenciais inválidas');
    }
  };

  // Check for saved session on mount
  useEffect(() => {
    const checkAuth = async () => {
      // TODO: Check AsyncStorage for saved session
      // TODO: Verify with Firebase Auth
    };

    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Login">
              {() => <LoginScreen onLogin={handleLogin} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
