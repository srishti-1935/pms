import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';
import { useAuth } from '../AuthContext';
import { ui, colors } from '../ui';
import { cs, ErrorBox } from '../common';

const CARDS = [
  ['Total projects', 'totalProjects'],
  ['Total tasks', 'totalTasks'],
  ['Completed tasks', 'completedTasks'],
  ['Pending tasks', 'pendingTasks'],
  ['Projects in progress', 'projectsInProgress'],
];

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (isRefresh) => {
    if (isRefresh) setRefreshing(true);
    setError('');
    try {
      const { data } = await api.get('/dashboard');
      setStats(data);
    } catch (e) {
      setError(e.userMessage || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  return (
    <ScrollView
      style={cs.container}
      contentContainerStyle={cs.pad}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      <Text style={[ui.title, { fontSize: 22 }]}>Hi {user?.fullName}</Text>
      <Text style={{ color: colors.muted, marginBottom: 16 }}>Your overview</Text>

      {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />}
      {!!error && <ErrorBox message={error} onRetry={() => load(false)} />}

      {stats &&
        CARDS.map(([text, key]) => (
          <View key={key} style={cs.card}>
            <Text style={cs.meta}>{text}</Text>
            <Text style={{ fontSize: 30, fontWeight: '700', color: colors.text }}>{stats[key]}</Text>
          </View>
        ))}

      <TouchableOpacity style={ui.btn} onPress={() => navigation.navigate('Projects')}>
        <Text style={ui.btnText}>View projects</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[ui.btn, { backgroundColor: colors.muted }]} onPress={logout}>
        <Text style={ui.btnText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}