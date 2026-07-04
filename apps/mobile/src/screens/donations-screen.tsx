import type { DonationRecord } from "@boame/shared-types";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { getCurrentUser } from "../services/auth-service";
import { getDonationHistory } from "../services/donation-service";
import { paymentMethodLabels } from "../services/settings-service";
import { colors } from "../theme/colors";
import { formatGhs } from "../utils/format";

export function DonationsScreen() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentUser = getCurrentUser();
  const isBeneficiary = currentUser?.role === "BENEFICIARY";

  async function loadDonations() {
    const records = await getDonationHistory();
    setDonations(records);
  }

  useEffect(() => {
    loadDonations();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDonations();
    }, [])
  );

  async function refresh() {
    setIsRefreshing(true);
    await loadDonations();
    setIsRefreshing(false);
  }

  const totalDonated = donations.filter((item) => item.status === "SUCCESS").reduce((total, item) => total + item.amount, 0);

  if (isBeneficiary) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Donations Received</Text>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No donations yet</Text>
          <Text style={styles.emptyText}>When donors support your campaigns, their contributions will appear here.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}>
      <Text style={styles.title}>Donation History</Text>
      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>Total donated</Text>
          <Text style={styles.summaryValue}>{formatGhs(totalDonated)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View>
          <Text style={styles.summaryLabel}>Records</Text>
          <Text style={styles.summaryValue}>{donations.length}</Text>
        </View>
      </View>

      {donations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No donations yet</Text>
          <Text style={styles.emptyText}>Your receipts, recurring donations, group donations, split payments, and giving streak will appear here.</Text>
        </View>
      ) : (
        donations.map((donation) => (
          <View key={donation.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.campaignTitle}>{donation.campaignTitle}</Text>
              <Text style={[styles.status, donation.status === "SUCCESS" ? styles.statusSuccess : styles.statusPending]}>{donation.status === "SUCCESS" ? "DONATED" : "CONFIRMING"}</Text>
            </View>
            <Text style={styles.amount}>{donation.kind === "ITEMS" ? "Item donation" : formatGhs(donation.amount)}</Text>
            <Text style={styles.meta}>
              {donation.kind ?? "MONEY"} • {donation.mode ?? "INDIVIDUAL"} • {paymentMethodLabels[donation.paymentMethod]} • {donation.type.replace("_", " ")}
            </Text>
            {donation.groupDonation ? <Text style={styles.meta}>Group: {donation.groupDonation.groupName}</Text> : null}
            {donation.splitPayments ? <Text style={styles.meta}>Split into {donation.splitPayments.length} payments</Text> : null}
            {donation.itemDonations?.map((item) => (
              <Text key={`${donation.id}-${item.itemId}`} style={styles.meta}>
                Item: {item.quantity} {item.itemName} ({item.deliveryMethod.replace("_", " ").toLowerCase()})
              </Text>
            ))}
            <Text style={styles.reference}>Reference: {donation.reference}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.supporting
  },
  content: {
    padding: 16,
    paddingBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: "900"
  },
  summary: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.text,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  summaryLabel: {
    color: colors.border,
    fontWeight: "800"
  },
  summaryValue: {
    marginTop: 4,
    color: colors.background,
    fontSize: 22,
    fontWeight: "900"
  },
  summaryDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  empty: {
    marginTop: 18,
    padding: 20,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900"
  },
  emptyText: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 22
  },
  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  campaignTitle: {
    flex: 1,
    fontWeight: "900",
    color: colors.text
  },
  status: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: "900"
  },
  statusSuccess: {
    color: colors.primaryGreen,
    backgroundColor: "#EEF7EF"
  },
  statusPending: {
    color: "#9A5A00",
    backgroundColor: "#FFF5E5"
  },
  amount: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "900",
    color: colors.primaryGreen
  },
  meta: {
    marginTop: 6,
    color: colors.muted,
    fontWeight: "700"
  },
  reference: {
    marginTop: 10,
    color: colors.text,
    fontSize: 12,
    fontWeight: "800"
  }
});
