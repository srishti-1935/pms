import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../AuthContext';
import { ui } from '../ui';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const e = {};
    if (fullName.trim().length < 2) e.fullName = 'Enter your full name';
    if (!emailRe.test(email.trim())) e.email = 'Enter a valid email';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    setErrors(e);
    setApiError('');
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await register(fullName.trim(), email.trim(), password);
    } catch (err) {
      setApiError(err.userMessage || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={ui.screen} keyboardShouldPersistTaps="handled">
      <Text style={ui.title}>Create account</Text>
      <Text style={ui.sub}>One account works on web and mobile</Text>

      {!!apiError && (
        <View style={ui.banner}>
          <Text style={ui.bannerText}>{apiError}</Text>
        </View>
      )}

      <TextInput style={ui.input} placeholder="Full name" value={fullName} onChangeText={setFullName} />
      {!!errors.fullName && <Text style={ui.err}>{errors.fullName}</Text>}

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
        placeholder="Password (min 8 characters)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {!!errors.password && <Text style={ui.err}>{errors.password}</Text>}

      <TouchableOpacity style={ui.btn} onPress={submit} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={ui.btnText}>Register</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={ui.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}