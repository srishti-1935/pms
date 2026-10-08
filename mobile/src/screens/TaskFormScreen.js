import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import api from '../api';
import { ui } from '../ui';
import { cs, Chip, label } from '../common';

const dateRe = /^\d{4}-\d{2}-\d{2}$/;

export default function TaskFormScreen({ route, navigation }) {
  const { projectId, task } = route.params;
  const editing = !!task;
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'MEDIUM');
  const [status, setStatus] = useState(task?.status || 'PENDING');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e = {};
    if (!name.trim()) e.name = 'Task name is required';
    const d = dueDate.trim();
    if (d && (!dateRe.test(d) || isNaN(Date.parse(d)))) e.dueDate = 'Use format YYYY-MM-DD';
    setErrors(e);
    setApiError('');
    if (Object.keys(e).length) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      priority,
      status,
      dueDate: d ? new Date(d).toISOString() : null,
    };
    setBusy(true);
    try {
      if (editing) await api.put(`/tasks/${task.id}`, payload);
      else await api.post('/tasks', { ...payload, projectId });
      navigation.goBack();
    } catch (err) {
      setApiError(err.userMessage || 'Could not save task');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={cs.container} contentContainerStyle={cs.pad} keyboardShouldPersistTaps="handled">
      {!!apiError && (
        <View style={ui.banner}>
          <Text style={ui.bannerText}>{apiError}</Text>
        </View>
      )}

      <Text style={cs.fieldLabel}>Name</Text>
      <TextInput style={ui.input} value={name} onChangeText={setName} placeholder="Task name" />
      {!!errors.name && <Text style={ui.err}>{errors.name}</Text>}

      <Text style={cs.fieldLabel}>Description</Text>
      <TextInput
        style={[ui.input, { height: 90, textAlignVertical: 'top' }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Optional"
        multiline
      />

      <Text style={cs.fieldLabel}>Priority</Text>
      <View style={cs.chipRow}>
        {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
          <Chip key={p} text={p} active={priority === p} onPress={() => setPriority(p)} />
        ))}
      </View>

      <Text style={cs.fieldLabel}>Status</Text>
      <View style={cs.chipRow}>
        {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
          <Chip key={s} text={label(s)} active={status === s} onPress={() => setStatus(s)} />
        ))}
      </View>

      <Text style={cs.fieldLabel}>Due date (YYYY-MM-DD)</Text>
      <TextInput style={ui.input} value={dueDate} onChangeText={setDueDate} placeholder="2026-10-31" />
      {!!errors.dueDate && <Text style={ui.err}>{errors.dueDate}</Text>}

      <TouchableOpacity style={ui.btn} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={ui.btnText}>{editing ? 'Save changes' : 'Create task'}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}