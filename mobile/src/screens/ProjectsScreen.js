import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';
import { colors } from '../ui';
import { cs, Chip, ErrorBox, label } from '../common';

const STATUSES = ['', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

export default function ProjectsScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(text.trim()), 400);
    return () => clearTimeout(t);
  }, [text]);

  const load = useCallback(
    async (isRefresh) => {
      if (isRefresh) setRefreshing(true);
      setError('');
      try {
        const { data } = await api.get('/projects', {
          params: { search: search || undefined, status: status || undefined },
        });
        setProjects(data.projects);
      } catch (e) {
        setError(e.userMessage || 'Failed to load projects');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status]
  );

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  return (
    <View style={cs.container}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <TextInput style={cs.search} placeholder="Search projects" value={text} onChangeText={setText} />
        <View style={cs.chipRow}>
          {STATUSES.map((s) => (
            <Chip key={s} text={s ? label(s) : 'All'} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
      </View>

      {!!error && <ErrorBox message={error} onRetry={() => load(false)} />}
      {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />}

      <FlatList
        data={projects}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: 16 }}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        ListEmptyComponent={!loading && !error ? <Text style={cs.empty}>No projects found</Text> : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={cs.card}
            onPress={() => navigation.navigate('ProjectDetail', { id: item.id, name: item.name })}
          >
            <Text style={cs.cardTitle}>{item.name}</Text>
            <Text style={cs.meta}>
              {label(item.status)} | {item._count?.tasks ?? 0} tasks
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}