import type { DonationType, PaymentMethod, UserSettings } from "@boame/shared-types";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { RootStackParamList } from "../navigation/types";
import { getCurrentUser, logout } from "../services/auth-service";
import {
  defaultNotificationPreferences,
  defaultSettings,
  getNotificationPreferences,
  getSettings,
  paymentMethodLabels,
  updateNotificationPreferences,
  updateSettings
} from "../services/settings-service";
import { colors } from "../theme/colors";

const paymentMethods: PaymentMethod[] = ["MOBILE_MONEY", "CARD", "BANK_TRANSFER", "OFFLINE"];
const donationTypes: DonationType[] = ["ONE_TIME", "DAILY", "WEEKLY", "MONTHLY"];
const currencies = ["GHS", "USD"] as const;
const languages = ["English", "Twi", "Ga", "Ewe"] as const;

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentUser = getCurrentUser();
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (currentUser) {
      const userSettings: UserSettings = {
        ...defaultSettings,
        displayName: `${currentUser.firstName} ${currentUser.lastName}`,
        email: currentUser.email,
        phoneNumber: currentUser.phone
      };
      return userSettings;
    }
    return defaultSettings;
  });
  const [preferences, setPreferences] = useState(defaultNotificationPreferences);
  const [activeTab, setActiveTab] = useState<"profile" | "system">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [dropdown, setDropdown] = useState<"payment" | "type" | "currency" | "language" | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      const [loadedSettings, loadedPreferences] = await Promise.all([getSettings(), getNotificationPreferences()]);
      if (isMounted) {
        // Preserve user-specific data from logged-in user
        const user = getCurrentUser();
        if (user) {
          setSettings({
            ...loadedSettings,
            displayName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phoneNumber: user.phone
          });
        } else {
          setSettings(loadedSettings);
        }
        setPreferences(loadedPreferences);
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  async function saveAll() {
    setIsSaving(true);
    try {
      const [savedSettings, savedPreferences] = await Promise.all([updateSettings(settings), updateNotificationPreferences(preferences)]);
      setSettings(savedSettings);
      setPreferences(savedPreferences);
      Alert.alert("Settings saved", "Your account, payment, and notification settings are up to date.");
    } catch (error) {
      Alert.alert("Settings not saved", error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  async function signOut() {
    try {
      await logout();
    } catch {
      // The preview app still signs out locally if the API is offline.
    } finally {
      setSettings(defaultSettings);
      setPreferences(defaultNotificationPreferences);
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{settings.displayName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>{settings.displayName} • {currentUser?.role === "BENEFICIARY" ? "Beneficiary account" : "Donor account"}</Text>
        </View>
      </View>

      <View style={styles.segmented}>
        <Pressable style={[styles.segmentButton, activeTab === "profile" && styles.segmentButtonActive]} onPress={() => setActiveTab("profile")}>
          <Text style={[styles.segmentText, activeTab === "profile" && styles.segmentTextActive]}>Profile</Text>
        </Pressable>
        <Pressable style={[styles.segmentButton, activeTab === "system" && styles.segmentButtonActive]} onPress={() => setActiveTab("system")}>
          <Text style={[styles.segmentText, activeTab === "system" && styles.segmentTextActive]}>System</Text>
        </Pressable>
      </View>

      {activeTab === "profile" ? (
        <>
          <Section title="Profile">
            <Field label="Display name" value={settings.displayName} onChangeText={(displayName) => setSettings({ ...settings, displayName })} />
            <Field label="Email" value={settings.email} keyboardType="email-address" onChangeText={(email) => setSettings({ ...settings, email })} />
            <Field label="Phone number" value={settings.phoneNumber} keyboardType="phone-pad" onChangeText={(phoneNumber) => setSettings({ ...settings, phoneNumber })} />
          </Section>

          <Section title="Donation defaults">
            <DropdownRow label="Payment method" value={paymentMethodLabels[settings.defaultPaymentMethod]} onPress={() => setDropdown("payment")} />
            <DropdownRow label="Donation rhythm" value={settings.defaultDonationType.replace("_", " ").toLowerCase()} onPress={() => setDropdown("type")} />
            <DropdownRow label="Currency" value={settings.currency} onPress={() => setDropdown("currency")} />
            <DropdownRow label="Language" value={settings.language} onPress={() => setDropdown("language")} />
            <ToggleRow label="Donate anonymously" value={settings.defaultAnonymousDonations} onValueChange={(defaultAnonymousDonations) => setSettings({ ...settings, defaultAnonymousDonations })} />
            <ToggleRow label="Generate receipts" value={settings.donationReceipts} onValueChange={(donationReceipts) => setSettings({ ...settings, donationReceipts })} />
          </Section>
        </>
      ) : (
        <>
          <Section title="Security">
            <StatusRow label="Identity verification" value={currentUser?.status === "ACTIVE" ? "Verified" : "Pending review"} tone={currentUser?.status === "ACTIVE" ? "success" : "info"} />
            <StatusRow label="Mobile device" value="This iPhone session" tone="info" />
            <ToggleRow label="Biometric login" value={settings.biometricLogin} onValueChange={(biometricLogin) => setSettings({ ...settings, biometricLogin })} />
            <ToggleRow label="Two-factor authentication" value={settings.twoFactorAuth} onValueChange={(twoFactorAuth) => setSettings({ ...settings, twoFactorAuth })} />
          </Section>

          <Section title="Notifications">
            <ToggleRow label="Push notifications" value={preferences.pushEnabled} onValueChange={(pushEnabled) => setPreferences({ ...preferences, pushEnabled })} />
            <ToggleRow label="Email notifications" value={preferences.emailEnabled} onValueChange={(emailEnabled) => setPreferences({ ...preferences, emailEnabled })} />
            <ToggleRow label="SMS notifications" value={preferences.smsEnabled} onValueChange={(smsEnabled) => setPreferences({ ...preferences, smsEnabled })} />
            <ToggleRow label="Donation receipts" value={preferences.donationReceipts} onValueChange={(donationReceipts) => setPreferences({ ...preferences, donationReceipts })} />
            <ToggleRow label="Campaign updates" value={preferences.campaignUpdates} onValueChange={(campaignUpdates) => setPreferences({ ...preferences, campaignUpdates })} />
            <ToggleRow label="Group invites" value={preferences.groupInvites} onValueChange={(groupInvites) => setPreferences({ ...preferences, groupInvites })} />
            <ToggleRow label="Weekly impact" value={preferences.weeklyImpactSummary} onValueChange={(weeklyImpactSummary) => setPreferences({ ...preferences, weeklyImpactSummary })} />
          </Section>
        </>
      )}

      <Pressable style={styles.saveButton} onPress={saveAll}>
        <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save settings"}</Text>
      </Pressable>

      <Pressable style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <ChoiceModal
        visible={dropdown === "payment"}
        title="Default payment method"
        options={paymentMethods.map((method) => ({ label: paymentMethodLabels[method], value: method }))}
        onClose={() => setDropdown(null)}
        onSelect={(value) => {
          setSettings({ ...settings, defaultPaymentMethod: value as PaymentMethod });
          setDropdown(null);
        }}
      />
      <ChoiceModal
        visible={dropdown === "type"}
        title="Default donation rhythm"
        options={donationTypes.map((type) => ({ label: type.replace("_", " ").toLowerCase(), value: type }))}
        onClose={() => setDropdown(null)}
        onSelect={(value) => {
          setSettings({ ...settings, defaultDonationType: value as DonationType });
          setDropdown(null);
        }}
      />
      <ChoiceModal
        visible={dropdown === "currency"}
        title="Currency"
        options={currencies.map((currency) => ({ label: currency, value: currency }))}
        onClose={() => setDropdown(null)}
        onSelect={(value) => {
          setSettings({ ...settings, currency: value as "GHS" | "USD" });
          setDropdown(null);
        }}
      />
      <ChoiceModal
        visible={dropdown === "language"}
        title="Language"
        options={languages.map((language) => ({ label: language, value: language }))}
        onClose={() => setDropdown(null)}
        onSelect={(value) => {
          setSettings({ ...settings, language: value as "English" | "Twi" | "Ga" | "Ewe" });
          setDropdown(null);
        }}
      />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({ label, value, onChangeText, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: "default" | "email-address" | "phone-pad" }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} style={styles.input} />
    </View>
  );
}

function DropdownRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValueWrap}>
        <Text style={styles.rowValue}>{value}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </View>
    </Pressable>
  );
}

function ToggleRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.accentGreen, false: colors.border }} thumbColor={value ? colors.primaryGreen : colors.background} />
    </View>
  );
}

function StatusRow({ label, value, tone }: { label: string; value: string; tone: "success" | "info" }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.statusPill, tone === "success" ? styles.statusSuccess : styles.statusInfo]}>{value}</Text>
    </View>
  );
}

function ChoiceModal({ visible, title, options, onSelect, onClose }: { visible: boolean; title: string; options: Array<{ label: string; value: string }>; onSelect: (value: string) => void; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((option) => (
            <Pressable key={option.value} style={styles.modalOption} onPress={() => onSelect(option.value)}>
              <Text style={styles.modalOptionText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  content: {
    padding: 16,
    paddingBottom: 104
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreen
  },
  avatarText: {
    color: colors.background,
    fontSize: 24,
    fontWeight: "900"
  },
  headerText: {
    flex: 1
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text
  },
  subtitle: {
    marginTop: 4,
    color: colors.muted,
    fontWeight: "700"
  },
  segmented: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
    borderRadius: 24,
    backgroundColor: "#F4F6F8",
    marginBottom: 16
  },
  segmentButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentButtonActive: {
    backgroundColor: "#111827"
  },
  segmentText: {
    color: "#64748B",
    fontWeight: "900"
  },
  segmentTextActive: {
    color: "#FFFFFF"
  },
  section: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8
  },
  field: {
    marginTop: 10
  },
  label: {
    marginBottom: 7,
    fontWeight: "900",
    color: colors.text
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    fontSize: 16
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12
  },
  rowLabel: {
    flex: 1,
    color: colors.text,
    fontWeight: "800"
  },
  rowValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  rowValue: {
    maxWidth: 145,
    color: colors.muted,
    fontWeight: "900",
    textAlign: "right",
    textTransform: "capitalize"
  },
  chevron: {
    color: colors.muted,
    fontSize: 22
  },
  statusPill: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontWeight: "900"
  },
  statusSuccess: {
    color: colors.primaryGreen,
    backgroundColor: "#EEF7EF"
  },
  statusInfo: {
    color: "#0B6F91",
    backgroundColor: "#EAF8FD"
  },
  notificationRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: colors.primaryGreen
  },
  readDot: {
    backgroundColor: colors.border
  },
  notificationText: {
    flex: 1
  },
  notificationTitle: {
    fontWeight: "900",
    color: colors.text
  },
  notificationBody: {
    marginTop: 4,
    color: colors.muted,
    lineHeight: 20
  },
  emptyText: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 20
  },
  saveButton: {
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreen
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: "900"
  },
  signOutButton: {
    height: 52,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.urgent
  },
  signOutText: {
    color: colors.urgent,
    fontWeight: "900"
  },
  modalOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)"
  },
  modalCard: {
    borderRadius: 8,
    backgroundColor: colors.background,
    padding: 12
  },
  modalTitle: {
    padding: 10,
    fontSize: 18,
    fontWeight: "900"
  },
  modalOption: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  modalOptionText: {
    fontWeight: "800",
    textTransform: "capitalize"
  }
});
