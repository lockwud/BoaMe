import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { RootStackParamList } from "../navigation/types";
import { apiPost } from "../services/api-client";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost<{ message: string }>("/auth/forgot-password", { email });
      setSent(true);
    } catch (error) {
      Alert.alert("Request failed", error instanceof Error ? error.message : "Could not send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Text style={styles.logoText}>♡</Text>
          </View>
          <View>
            <Text style={styles.brandName}>BoaMe</Text>
            <Text style={styles.brandCopy}>Ghana giving app</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.copy}>
            If an account exists for {email}, you will receive password reset instructions shortly.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back to sign in</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>♡</Text>
        </View>
        <View>
          <Text style={styles.brandName}>BoaMe</Text>
          <Text style={styles.brandCopy}>Ghana giving app</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.copy}>
          Enter the email address linked to your BoaMe account and we will send you instructions to reset your password.
        </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Pressable style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={submit} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? "Sending..." : "Send reset link"}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.signupRow} onPress={() => navigation.goBack()}>
        <Text style={styles.signupMuted}>Remember your password? </Text>
        <Text style={styles.signupText}>Sign in</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
    paddingBottom: 32
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 34
  },
  logoMark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreen
  },
  logoText: {
    color: colors.background,
    fontSize: 22,
    fontWeight: "900"
  },
  brandName: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "900"
  },
  brandCopy: {
    color: "#64748B",
    fontWeight: "700"
  },
  form: {
    width: "100%"
  },
  title: {
    color: "#111827",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center"
  },
  copy: {
    color: "#64748B",
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 26,
    fontWeight: "600",
    textAlign: "center"
  },
  label: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 7,
    marginLeft: 2
  },
  input: {
    height: 52,
    borderRadius: 24,
    borderWidth: 0,
    backgroundColor: "#F1F3F5",
    paddingHorizontal: 18,
    marginBottom: 16,
    color: "#0F172A",
    fontWeight: "700"
  },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050505"
  },
  buttonDisabled: {
    opacity: 0.65
  },
  buttonText: {
    color: colors.background,
    fontWeight: "900"
  },
  signupRow: {
    marginTop: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  signupMuted: {
    color: "#111827",
    fontWeight: "600"
  },
  signupText: {
    color: "#111827",
    fontWeight: "900"
  }
});