import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';
import { colors } from '../ui';
import { cs, Chip, ErrorBox, label } from '../common';

const STATUSES = ['', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH'];

export default function ProjectDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
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
        const { data } = await api.get('/tasks', {
          params: {
            projectId: id,
            search: search || undefined,
            status: status || undefined,
            priority: priority || undefined,
          },
        });
        setTasks(data.tasks);
      } catch (e) {
        setError(e.userMessage || 'Failed to load tasks');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, search, status, priority]
  );

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  const complete = async (task) => {
    try {
      await api.put(`/tasks/${task.id}`, { status: 'COMPLETED' });
      load(false);
    } catch (e) {
      Alert.alert('Error', e.userMessage || 'Could not update task');
    }
  };

  const remove = (task) => {
    Alert.alert('Delete task', `Delete "${task.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/tasks/${task.id}`);
            load(false);
          } catch (e) {
            Alert.alert('Error', e.userMessage || 'Could not delete task');
          }
        },
      },
    ]);
  };

  return (
    <View style={cs.container}>
      <View style={{ padding: 16, paddingBottom: 0 }}>
        <TextInput style={cs.search} placeholder="Search tasks" value={text} onChangeText={setText} />
        <View style={cs.chipRow}>
          {STATUSES.map((s) => (
            <Chip key={s} text={s ? label(s) : 'Any status'} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </View>
        <View style={cs.chipRow}>
          {PRIORITIES.map((p) => (
            <Chip key={p} text={p || 'Any priority'} active={priority === p} onPress={() => setPriority(p)} />
          ))}
        </View>
      </View>

      {!!error && <ErrorBox message={error} onRetry={() => load(false)} />}
      {loading && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />}

      <FlatList
        data={tasks}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={() => load(true)}
        ListEmptyComponent={!loading && !error ? <Text style={cs.empty}>No tasks found</Text> : null}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={cs.card}
            onPress={() => navigation.navigate('TaskForm', { projectId: id, task: item })}
          >
            <Text style={[cs.cardTitle, item.status === 'COMPLETED' && { textDecorationLine: 'line-through' }]}>
              {item.name}
            </Text>
            <Text style={cs.meta}>
              {item.priority} | {label(item.status)}
              {item.dueDate ? ` | due ${item.dueDate.slice(0, 10)}` : ''}
            </Text>
            <View style={cs.rowBtns}>
              {item.status !== 'COMPLETED' && (
                <TouchableOpacity style={cs.smallBtn} onPress={() => complete(item)}>
                  <Text style={cs.smallBtnText}>Mark completed</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={cs.smallBtn} onPress={() => remove(item)}>
                <Text style={[cs.smallBtnText, { color: colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={cs.fab} onPress={() => navigation.navigate('TaskForm', { projectId: id })}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>+ Add task</Text>
      </TouchableOpacity>
    </View>
  );
}