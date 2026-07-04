import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { CampaignSummary } from "@boame/shared-types";
import { useFocusEffect } from "@react-navigation/native";
import { CampaignCard } from "../components/campaign-card";
import { SkeletonLoader } from "../components/skeleton-loader";
import type { RootStackParamList } from "../navigation/types";
import { getCurrentUser } from "../services/auth-service";
import { listCampaigns, listMyCampaignRequests } from "../services/campaign-service";
import { colors } from "../theme/colors";

export function CampaignsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = getCurrentUser();
  const isBeneficiary = currentUser?.role === "BENEFICIARY";

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);
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
    }, [isBeneficiary])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isBeneficiary ? "My campaigns" : "Campaigns"}</Text>
      <Text style={styles.copy}>{isBeneficiary ? "Track your submitted requests, verification status, funds raised, and campaign progress." : "Browse verified causes across Ghana and donate from ₵1."}</Text>
      {isBeneficiary ? (
        <Pressable style={styles.requestButton} onPress={() => navigation.navigate("CreateCampaign")}>
          <Text style={styles.requestButtonText}>Request support</Text>
        </Pressable>
      ) : (
        <TextInput style={styles.search} placeholder="Search campaigns" placeholderTextColor={colors.muted} />
      )}
      {loading ? (
        <View style={styles.skeletonList}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.skeletonCard}>
              <SkeletonLoader height={150} borderRadius={12} />
              <SkeletonLoader height={18} width="70%" />
              <SkeletonLoader height={14} width="92%" />
              <SkeletonLoader height={10} width="100%" borderRadius={999} />
            </View>
          ))}
        </View>
      ) : campaigns.length > 0 ? (
        campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} navigation={navigation} />)
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{isBeneficiary ? "No campaign requests yet" : "No campaigns found"}</Text>
          <Text style={styles.emptyText}>{isBeneficiary ? "Submit a support request and it will appear here while admin reviews it." : "Check again after new campaigns are verified."}</Text>
        </View>
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
    paddingBottom: 96
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text
  },
  copy: {
    marginTop: 6,
    color: colors.muted,
    lineHeight: 22
  },
  requestButton: {
    height: 44,
    alignSelf: "flex-start",
    marginTop: 16,
    paddingHorizontal: 18,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827"
  },
  requestButtonText: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  search: {
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 14,
    marginTop: 16,
    marginBottom: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  skeletonList: {
    gap: 14
  },
  skeletonCard: {
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    backgroundColor: "#FFFFFF"
  },
  empty: {
    marginTop: 18,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEFF3"
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
