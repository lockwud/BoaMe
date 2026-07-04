import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CampaignSummary } from "@boame/shared-types";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { formatGhs, progressPercent } from "../utils/format";
import { MediaFrame } from "./media-frame";
import { ProgressBar } from "./progress-bar";

type Props = {
  campaign: CampaignSummary;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export function CampaignCard({ campaign, navigation }: Props) {
  const percent = progressPercent(campaign.raisedAmount, campaign.goalAmount);
  const urgent = campaign.category === "EMERGENCY";
  const liveMedia = campaign.campaignMedia?.find((item) => item.status === "LIVE");
  const coverImage = liveMedia?.thumbnailUrl ?? campaign.coverImage;
  const requestedCount = campaign.requestedItems?.length ?? 0;
  const mediaCount = campaign.campaignMedia?.length ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => navigation.navigate("CampaignDetail", { slug: campaign.slug })}
    >
      <View style={styles.imageWrap}>
        <MediaFrame uri={coverImage} title={liveMedia?.title ?? campaign.title} height={190} live={Boolean(liveMedia)} />
        {liveMedia ? (
          <View style={styles.livePill}>
            <Text style={styles.livePillText}>LIVE</Text>
          </View>
        ) : null}
        {mediaCount ? (
          <View style={styles.mediaPill}>
            <Ionicons name="play-circle" size={14} color={colors.background} />
            <Text style={styles.mediaPillText}>{mediaCount} media</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{campaign.category}</Text>
          <Text style={[styles.statusBadge, campaign.status === "ACTIVE" ? styles.statusActive : styles.statusPending]}>{campaign.status.replace("_", " ")}</Text>
          {urgent ? <Text style={styles.urgent}>Urgent</Text> : null}
        </View>
        <Text style={styles.title}>{campaign.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{campaign.description}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color={colors.muted} />
          <Text style={styles.meta}>{campaign.location}</Text>
        </View>
        {requestedCount ? (
          <View style={styles.needRow}>
            <Ionicons name="gift-outline" size={15} color={colors.primaryGreen} />
            <Text style={styles.needText}>{requestedCount} requested item categories</Text>
          </View>
        ) : null}
        <ProgressBar percent={percent} />
        <View style={styles.amountRow}>
          <View>
            <Text style={styles.amount}>{formatGhs(campaign.raisedAmount)}</Text>
            <Text style={styles.goal}>of {formatGhs(campaign.goalAmount)}</Text>
          </View>
          <Text style={styles.percent}>{percent}%</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16
  },
  pressed: {
    opacity: 0.9
  },
  imageWrap: {
    position: "relative"
  },
  livePill: {
    position: "absolute",
    top: 12,
    left: 12,
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.urgent
  },
  livePillText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "900"
  },
  mediaPill: {
    position: "absolute",
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(0,0,0,0.62)"
  },
  mediaPillText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: "900"
  },
  content: {
    padding: 16,
    gap: 10
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    color: colors.primaryGreen,
    backgroundColor: colors.supporting,
    fontSize: 12,
    fontWeight: "800"
  },
  statusBadge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  statusActive: {
    color: colors.primaryGreen,
    backgroundColor: "#EEF7EF"
  },
  statusPending: {
    color: "#64748B",
    backgroundColor: "#F1F5F9"
  },
  urgent: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    color: colors.background,
    backgroundColor: colors.urgent,
    fontSize: 12,
    fontWeight: "800"
  },
  title: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.text
  },
  description: {
    lineHeight: 21,
    color: colors.muted
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  needRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#EEF7EF"
  },
  needText: {
    color: colors.primaryGreen,
    fontSize: 12,
    fontWeight: "900"
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  amount: {
    fontWeight: "900",
    fontSize: 18,
    color: colors.primaryGreen
  },
  goal: {
    color: colors.muted,
    fontSize: 12
  },
  percent: {
    fontWeight: "900",
    color: colors.text
  }
});
