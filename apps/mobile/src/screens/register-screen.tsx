import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { UserRole } from "@boame/shared-types";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { RootStackParamList } from "../navigation/types";
import { register } from "../services/auth-service";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Extract<UserRole, "DONOR" | "BENEFICIARY">>("DONOR");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    setIsSubmitting(true);
    try {
      await register({ firstName, lastName, email, phone, password, role, location });
      Alert.alert("Account created", "You can now log in to BoaMe.", [
        { text: "Log in", onPress: () => navigation.replace("Login") }
      ]);
    } catch (error) {
      Alert.alert("Registration failed", error instanceof Error ? error.message : "Could not create account.");
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
          <Text style={styles.brandCopy}>Giving app</Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.copy}>Donate, track receipts, and follow verified campaign updates.</Text>

        <View style={styles.roleGroup}>
          <Pressable style={[styles.roleButton, role === "DONOR" && styles.roleButtonActive]} onPress={() => setRole("DONOR")}>
            <Text style={[styles.roleTitle, role === "DONOR" && styles.roleTitleActive]}>Donor</Text>
            <Text style={[styles.roleHint, role === "DONOR" && styles.roleHintActive]}>I want to support campaigns.</Text>
          </Pressable>
          <Pressable style={[styles.roleButton, role === "BENEFICIARY" && styles.roleButtonActive]} onPress={() => setRole("BENEFICIARY")}>
            <Text style={[styles.roleTitle, role === "BENEFICIARY" && styles.roleTitleActive]}>Beneficiary</Text>
            <Text style={[styles.roleHint, role === "BENEFICIARY" && styles.roleHintActive]}>I need help and will request support.</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <TextInput style={[styles.input, styles.half]} placeholder="First name" placeholderTextColor="#94A3B8" value={firstName} onChangeText={setFirstName} />
          <TextInput style={[styles.input, styles.half]} placeholder="Last name" placeholderTextColor="#94A3B8" value={lastName} onChangeText={setLastName} />
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#94A3B8" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} placeholder="Enter your phone number" placeholderTextColor="#94A3B8" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} placeholder="Town or region" placeholderTextColor="#94A3B8" value={location} onChangeText={setLocation} />
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="Create password" placeholderTextColor="#94A3B8" value={password} onChangeText={setPassword} secureTextEntry />

        <Pressable style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={submit} disabled={isSubmitting}>
          <Text style={styles.buttonText}>{isSubmitting ? "Creating profile..." : "Create account"}</Text>
        </Pressable>
      </View>

      <Pressable style={styles.loginRow} onPress={() => navigation.replace("Login")}>
        <Text style={styles.loginMuted}>Already have an account? </Text>
        <Text style={styles.loginText}>Sign in</Text>
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
    textAlign: "center",
    fontWeight: "600"
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  roleGroup: {
    gap: 10,
    marginBottom: 18
  },
  roleButton: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F1F3F5",
    borderWidth: 1,
    borderColor: "#F1F3F5"
  },
  roleButtonActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: "#EEF7EF"
  },
  roleTitle: {
    color: "#111827",
    fontWeight: "900"
  },
  roleTitleActive: {
    color: colors.primaryGreen
  },
  roleHint: {
    marginTop: 4,
    color: "#64748B",
    fontWeight: "600"
  },
  roleHintActive: {
    color: "#111827"
  },
  half: {
    flex: 1
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
  loginRow: {
    marginTop: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  loginMuted: {
    color: "#111827",
    fontWeight: "600"
  },
  loginText: {
    color: "#111827",
    fontWeight: "900"
  }
});
