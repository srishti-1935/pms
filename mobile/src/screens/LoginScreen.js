import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../AuthContext';
import { ui } from '../ui';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }) {
  const { login, notice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e = {};
    if (!emailRe.test(email.trim())) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    setApiError('');
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setApiError(err.userMessage || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const message = apiError || notice;

  return (
    <ScrollView contentContainerStyle={ui.screen} keyboardShouldPersistTaps="handled">
      <Text style={ui.title}>Welcome back</Text>
      <Text style={ui.sub}>Log in to manage your projects</Text>

      {!!message && (
        <View style={ui.banner}>
          <Text style={ui.bannerText}>{message}</Text>
        </View>
      )}

      <TextInput
        style={ui.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {!!errors.email && <Text style={ui.err}>{errors.email}</Text>}

      <TextInput
        style={ui.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {!!errors.password && <Text style={ui.err}>{errors.password}</Text>}

      <TouchableOpacity style={ui.btn} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={ui.btnText}>Log in</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={ui.link}>No account? Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}