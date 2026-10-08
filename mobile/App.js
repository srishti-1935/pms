import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import { AuthProvider, useAuth } from './src/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import { colors } from './src/ui';

const Stack = createNativeStackNavigator();

function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => {
      setOnline(s.isConnected !== false && s.isInternetReachable !== false);
    });
    return unsub;
  }, []);
  return online;
}

function Root() {
  const { user, loading } = useAuth();
  const online = useOnline();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {!online && (
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.danger }}>
          <Text style={{ color: '#fff', textAlign: 'center', padding: 8 }}>
            No internet connection. Some actions will not work.
          </Text>
        </SafeAreaView>
      )}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: true, title: 'Dashboard' }} />
              <Stack.Screen name="Projects" component={ProjectsScreen} options={{ headerShown: true, title: 'Projects' }} />
              <Stack.Screen
                name="ProjectDetail"
                component={ProjectDetailScreen}
                options={({ route }) => ({ headerShown: true, title: route.params?.name || 'Tasks' })}
              />
              <Stack.Screen
                name="TaskForm"
                component={TaskFormScreen}
                options={({ route }) => ({ headerShown: true, title: route.params?.task ? 'Edit task' : 'New task' })}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}