import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DEMO_MODE } from '../utils/constants';
import { C, F, R } from '../theme';
import { Button, Logo } from '../components/ui';
import BinGauge from '../components/BinGauge';

// Illustration only: these fills are not real data.
const ILLUSTRATION = [34, 66, 91, 18, 73];

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError("Saisissez votre e-mail (ou nom d'utilisateur) et votre mot de passe.");
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(e?.response?.status === 401
        ? 'Identifiant ou mot de passe incorrect.'
        : "Le serveur ne répond pas. Vérifiez l'adresse du backend et votre connexion.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.brand}>
            <Logo size={22} />
            <Text style={styles.brandText}>SmartBin</Text>
          </View>
          <Text style={styles.headline}>Le bac le plus proche qui a encore de la place.</Text>
          <View style={styles.bins} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {ILLUSTRATION.map((f, i) => (
              <BinGauge key={i} fill={f} threshold={80} size={44} showPct={false} dark />
            ))}
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Connexion</Text>

          {error && (
            <View style={styles.error} accessibilityRole="alert">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.label}>E-mail ou nom d'utilisateur</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="vous@exemple.ma"
            placeholderTextColor={C.muted}
            accessibilityLabel="E-mail ou nom d'utilisateur"
          />
          <Text style={[styles.label, { marginTop: 16 }]}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={C.muted}
            onSubmitEditing={handleLogin}
            accessibilityLabel="Mot de passe"
          />

          {busy
            ? <View style={[styles.busy]}><ActivityIndicator color={C.white} /></View>
            : <Button title="Se connecter" onPress={handleLogin} style={{ marginTop: 24 }} />}

          {DEMO_MODE && (
            <Text style={styles.hint}>
              Mode démo : saisissez n'importe quel identifiant et mot de passe. Les bacs affichés sont fictifs.
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: C.ink, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 0, overflow: 'hidden' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontFamily: F.display, fontSize: 26, color: C.white },
  headline: { fontFamily: F.display, fontSize: 38, lineHeight: 40, color: C.white, marginTop: 36, maxWidth: 340 },
  bins: { flexDirection: 'row', gap: 14, marginTop: 32, alignItems: 'flex-end' },
  form: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  title: { fontFamily: F.display, fontSize: 30, color: C.ink, marginBottom: 18 },
  label: { fontFamily: F.medium, fontSize: 15, color: C.ink2, marginBottom: 6 },
  input: {
    height: 48, borderWidth: 1, borderColor: C.lineStrong, borderRadius: R.control, backgroundColor: C.surface,
    paddingHorizontal: 12, fontFamily: F.regular, fontSize: 16, color: C.ink,
  },
  busy: { marginTop: 24, height: 46, borderRadius: R.control, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  error: { backgroundColor: C.fullSoft, borderRadius: R.control, padding: 12, marginBottom: 16 },
  errorText: { fontFamily: F.regular, fontSize: 15, color: C.fullInk },
  hint: { fontFamily: F.regular, fontSize: 14, lineHeight: 20, color: C.muted, marginTop: 18 },
});
