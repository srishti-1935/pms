import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from './ui';

export const label = (s) => (s ? s.replace(/_/g, ' ') : '');

export function Chip({ text, active, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[cs.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
    >
      <Text style={[cs.chipText, active && { color: '#fff' }]}>{text}</Text>
    </TouchableOpacity>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <View style={cs.errorBox}>
      <Text style={cs.errorText}>{message}</Text>
      <TouchableOpacity style={cs.retry} onPress={onRetry}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

export const cs = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pad: { padding: 16 },
  search: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
    marginBottom: 8,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { color: colors.text, fontSize: 13 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { color: colors.muted, fontSize: 13, marginTop: 4 },
  rowBtns: { flexDirection: 'row', marginTop: 10 },
  smallBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  smallBtnText: { fontSize: 13, color: colors.text },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  errorBox: { margin: 16, padding: 16, backgroundColor: '#fef2f2', borderRadius: 12 },
  errorText: { color: colors.danger, marginBottom: 10 },
  retry: { backgroundColor: colors.primary, padding: 10, borderRadius: 8, alignItems: 'center' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    elevation: 4,
  },
  fieldLabel: { fontWeight: '600', color: colors.text, marginTop: 12, marginBottom: 6 },
});