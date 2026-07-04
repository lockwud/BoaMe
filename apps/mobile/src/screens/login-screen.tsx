import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { RootStackParamList } from "../navigation/types";
import { login } from "../services/auth-service";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    try {
      const response = await login(email, password);
      const userRole = response.user?.role;
      if (userRole === "BENEFICIARY") {
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      }
    } catch (error) {
      Alert.alert("Login failed", error instanceof Error ? error.message : "Could not log in.");
    } finally {
      setIsSubmitting(false);
    }
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
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.copy}>Access campaigns, donations, receipts, and beneficiary support by logging in.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="#94A3B8" value={password} onChangeText={setPassword} secureTextEntry />

        <View style={styles.helperRow}>
          <View style={styles.rememberRow}>
            <View style={styles.checkbox}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </View>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </View>

        <Pressable style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={submit} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? "Checking account..." : "Sign in"}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.signupRow} onPress={() => navigation.navigate("Register")}>
        <Text style={styles.signupMuted}>Don't have an account? </Text>
        <Text style={styles.signupText}>Sign up</Text>
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
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#22C55E"
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900"
  },
  rememberText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700"
  },
  forgotText: {
    color: "#EF4444",
    fontSize: 13,
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
