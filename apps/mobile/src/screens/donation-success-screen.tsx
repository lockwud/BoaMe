import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../navigation/types";
import { paymentMethodLabels } from "../services/settings-service";
import { colors } from "../theme/colors";
import { formatGhs } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "DonationSuccess">;

export function DonationSuccessScreen({ route, navigation }: Props) {
  const { reference, status, amount, campaignTitle, kind, paymentMethod } = route.params;
  const isItemOnly = kind === "ITEMS";
  const isSuccessful = status === "SUCCESS";

  return (
    <View style={styles.screen}>
      <View style={[styles.mark, !isSuccessful && styles.markPending]}>
        <Text style={styles.markText}>{isSuccessful ? "♡" : "✓"}</Text>
      </View>
      <Text style={styles.title}>{isSuccessful ? "Donated with love" : "Donation submitted"}</Text>
      <Text style={styles.copy}>
        {isItemOnly
          ? "Your item donation pledge has been recorded. BoaMe will coordinate pickup or drop-off with the campaign team."
          : isSuccessful
            ? "Your payment has been confirmed and your receipt is ready in donation history."
            : "Your payment is being confirmed. Pull to refresh donation history in a moment."}
      </Text>

      <View style={styles.receipt}>
        <ReceiptRow label="Campaign" value={campaignTitle} />
        <ReceiptRow label="Reference" value={reference} />
        <ReceiptRow label="Status" value={isSuccessful ? "Donated" : "Confirming"} />
        <ReceiptRow label="Support type" value={kind ?? "MONEY"} />
        <ReceiptRow label="Payment method" value={paymentMethodLabels[paymentMethod]} />
        <ReceiptRow label="Amount" value={isItemOnly ? "Item donation" : formatGhs(amount)} />
      </View>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("MainTabs", { screen: "Donations" })}>
        <Text style={styles.primaryButtonText}>View donation history</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("MainTabs", { screen: "Campaigns" })}>
        <Text style={styles.secondaryButtonText}>Support another campaign</Text>
      </Pressable>
    </View>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={styles.receiptValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.supporting
  },
  mark: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreen
  },
  markPending: {
    backgroundColor: "#111827"
  },
  markText: {
    color: colors.background,
    fontSize: 42,
    fontWeight: "900"
  },
  title: {
    marginTop: 20,
    color: colors.text,
    fontSize: 30,
    fontWeight: "900"
  },
  copy: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 23,
    fontWeight: "700"
  },
  receipt: {
    marginTop: 18,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  receiptRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  receiptLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  receiptValue: {
    marginTop: 4,
    color: colors.text,
    fontWeight: "900"
  },
  primaryButton: {
    height: 52,
    borderRadius: 8,
    marginTop: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreen
  },
  primaryButtonText: {
    color: colors.background,
    fontWeight: "900"
  },
  secondaryButton: {
    height: 52,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "900"
  }
});
