import type { CampaignSummary } from "@boame/shared-types";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CampaignCard } from "../components/campaign-card";
import { SkeletonLoader } from "../components/skeleton-loader";
import type { RootStackParamList } from "../navigation/types";
import { getCurrentUser } from "../services/auth-service";
import { listCampaigns, listMyCampaignRequests } from "../services/campaign-service";
import { colors } from "../theme/colors";
import { formatGhs } from "../utils/format";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();
  const isBeneficiary = currentUser?.role === "BENEFICIARY";

  useEffect(() => {
    let mounted = true;

    (isBeneficiary ? listMyCampaignRequests() : listCampaigns())
      .then((items) => {
        if (mounted) setCampaigns(items);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isBeneficiary]);

  const featured = useMemo(() => campaigns.filter((campaign) => campaign.isFeatured).slice(0, 3), [campaigns]);
  const visibleCampaigns = isBeneficiary ? campaigns.slice(0, 3) : featured.length > 0 ? featured : campaigns.slice(0, 3);
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raisedAmount, 0);
  const activeCampaigns = campaigns.length;
  function openPrimaryAction() {
    if (isBeneficiary) {
      navigation.navigate("CreateCampaign");
      return;
    }

    navigation.navigate("MainTabs", { screen: "Campaigns" });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>BoaMe</Text>
          <Text style={styles.title}>{isBeneficiary ? "Your support workspace" : "Verified giving made simple"}</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={() => navigation.navigate("MainTabs", { screen: "Notifications" })}>
          <Ionicons name="notifications" size={19} color={colors.primaryGreen} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{isBeneficiary ? "Track your campaign requests." : "Support real needs across Ghana."}</Text>
        <Text style={styles.heroCopy}>{isBeneficiary ? "See verification status, raised funds, campaign progress, and donor activity for your own requests." : "Donate, pledge items, follow verified updates, and keep every receipt in one place."}</Text>
        <Pressable style={styles.primaryButton} onPress={openPrimaryAction}>
          <Text style={styles.primaryButtonText}>{isBeneficiary ? "Request support" : "View campaigns"}</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        {loading ? (
          <>
            <SkeletonLoader height={72} width="48%" borderRadius={14} />
            <SkeletonLoader height={72} width="48%" borderRadius={14} />
          </>
        ) : (
          <>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatGhs(totalRaised)}</Text>
              <Text style={styles.statLabel}>{isBeneficiary ? "Raised for you" : "Raised"}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{activeCampaigns}</Text>
              <Text style={styles.statLabel}>{isBeneficiary ? "Your campaigns" : "Campaigns"}</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{isBeneficiary ? "Recent requests" : "Featured campaigns"}</Text>
        <Pressable onPress={() => navigation.navigate("MainTabs", { screen: "Campaigns" })}>
          <Text style={styles.sectionLink}>See all</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.skeletonList}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.skeletonCard}>
              <SkeletonLoader height={128} borderRadius={12} />
              <SkeletonLoader height={18} width="70%" />
              <SkeletonLoader height={14} width="92%" />
              <SkeletonLoader height={10} width="100%" borderRadius={999} />
            </View>
          ))}
        </View>
      ) : (
        visibleCampaigns.length > 0 ? (
          visibleCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} navigation={navigation} />)
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{isBeneficiary ? "No requests yet" : "No campaigns yet"}</Text>
            <Text style={styles.emptyText}>{isBeneficiary ? "Create your first support request so admin can review and publish it." : "Verified campaigns will appear here."}</Text>
          </View>
        )
      )}
    </ScrollView>
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
    justifyContent: "space-between",
    marginBottom: 18
  },
  kicker: {
    color: colors.primaryGreen,
    fontSize: 13,
    fontWeight: "900"
  },
  title: {
    marginTop: 3,
    color: "#111827",
    fontSize: 24,
    fontWeight: "900"
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7F8"
  },
  hero: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#F7F8FA",
    marginBottom: 14
  },
  heroTitle: {
    color: "#111827",
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900"
  },
  heroCopy: {
    marginTop: 8,
    color: "#64748B",
    lineHeight: 20,
    fontWeight: "600"
  },
  primaryButton: {
    alignSelf: "flex-start",
    height: 42,
    marginTop: 16,
    paddingHorizontal: 18,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827"
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22
  },
  statBox: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEFF3"
  },
  statValue: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900"
  },
  statLabel: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900"
  },
  sectionLink: {
    color: colors.primaryGreen,
    fontWeight: "900"
  },
  skeletonList: {
    gap: 14
  },
  skeletonCard: {
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECEFF3"
  },
  empty: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    backgroundColor: "#FFFFFF"
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900"
  },
  emptyText: {
    marginTop: 6,
    color: "#64748B",
    lineHeight: 20,
    fontWeight: "600"
  }
});
