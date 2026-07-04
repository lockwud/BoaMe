import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { CampaignSummary } from "@boame/shared-types";
import { CampaignVideoPlayer } from "../components/campaign-video-player";
import { CampaignVideoPreview } from "../components/campaign-video-preview";
import { MediaFrame } from "../components/media-frame";
import { ProgressBar } from "../components/progress-bar";
import { SkeletonLoader } from "../components/skeleton-loader";
import type { RootStackParamList } from "../navigation/types";
import { getCurrentUser } from "../services/auth-service";
import { getCampaign } from "../services/campaign-service";
import { colors } from "../theme/colors";
import { formatGhs, progressPercent } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "CampaignDetail">;
type CampaignMediaItem = NonNullable<CampaignSummary["campaignMedia"]>[number];

export function CampaignDetailScreen({ route, navigation }: Props) {
  const [campaign, setCampaign] = useState<CampaignSummary | undefined>();
  const [activeMediaId, setActiveMediaId] = useState<string | undefined>();
  const [selectedMedia, setSelectedMedia] = useState<CampaignMediaItem | undefined>();
  const currentUser = getCurrentUser();
  const isBeneficiary = currentUser?.role === "BENEFICIARY";

  useEffect(() => {
    getCampaign(route.params.slug).then(setCampaign);
  }, [route.params.slug]);

  if (!campaign) {
    return (
      <View style={styles.loadingScreen}>
        <SkeletonLoader height={260} borderRadius={0} />
        <View style={styles.loadingContent}>
          <SkeletonLoader height={16} width="28%" />
          <SkeletonLoader height={30} width="86%" />
          <SkeletonLoader height={18} width="100%" />
          <SkeletonLoader height={150} borderRadius={12} />
        </View>
      </View>
    );
  }

  const percent = progressPercent(campaign.raisedAmount, campaign.goalAmount);
  const requestedItems = campaign.requestedItems ?? [];
  const mediaItems = campaign.campaignMedia ?? [];
  const heroMedia = mediaItems.find((item) => item.status === "LIVE") ?? mediaItems[0];
  const activeMedia = mediaItems.find((item) => item.id === activeMediaId) ?? heroMedia;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Pressable style={styles.heroMedia} onPress={() => heroMedia && setActiveMediaId(heroMedia.id)}>
        <MediaFrame uri={heroMedia?.thumbnailUrl ?? campaign.coverImage} title={heroMedia?.title ?? campaign.title} height={260} live={heroMedia?.status === "LIVE"} />
        {heroMedia ? (
          <View style={styles.heroOverlay}>
            <Text style={[styles.mediaBadge, heroMedia.status === "LIVE" && styles.liveBadge]}>{heroMedia.status === "LIVE" ? "LIVE" : heroMedia.durationLabel ?? "VIDEO"}</Text>
            <Text style={styles.heroMediaTitle}>{heroMedia.title}</Text>
          </View>
        ) : null}
      </Pressable>
      <View style={styles.content}>
        <Text style={styles.category}>{campaign.category}</Text>
        <Text style={styles.title}>{campaign.title}</Text>
        <Text style={styles.description}>{campaign.description}</Text>
        <View style={styles.panel}>
          <ProgressBar percent={percent} />
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amount}>{formatGhs(campaign.raisedAmount)}</Text>
              <Text style={styles.goal}>raised of {formatGhs(campaign.goalAmount)}</Text>
            </View>
            <Text style={styles.percent}>{percent}%</Text>
          </View>
          <View style={styles.tiers}>
            {[1, 5, 10, 25, 50].map((amount) => (
              <Text key={amount} style={styles.tier}>₵{amount}</Text>
            ))}
          </View>
          {isBeneficiary ? (
            <View style={styles.ownerNote}>
              <Text style={styles.ownerNoteTitle}>{campaign.status === "ACTIVE" ? "Campaign is live" : "Awaiting admin verification"}</Text>
              <Text style={styles.ownerNoteText}>{campaign.status === "ACTIVE" ? "Donors can now support this campaign. Track raised funds here." : "Admin will review your evidence before donors can see this request."}</Text>
            </View>
          ) : (
            <Pressable style={styles.button} onPress={() => navigation.navigate("Donate", { slug: campaign.slug })}>
              <Text style={styles.buttonText}>Support this campaign</Text>
            </Pressable>
          )}
        </View>
        {mediaItems.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Campaign media</Text>
            <View style={styles.mediaList}>
              <CampaignVideoPreview media={activeMedia} onFullscreen={() => activeMedia && setSelectedMedia(activeMedia)} />
              <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaScroller}>
                {mediaItems.map((item) => (
                  <Pressable key={item.id} style={[styles.mediaTile, activeMedia?.id === item.id && styles.mediaRowActive]} onPress={() => setActiveMediaId(item.id)}>
                    <View style={styles.mediaTileThumb}>
                      <MediaFrame uri={item.thumbnailUrl} title={item.title} height={88} compact live={item.status === "LIVE"} />
                    </View>
                    <Text style={[styles.mediaBadgeSmall, item.status === "LIVE" && styles.liveBadge]}>{item.status === "LIVE" ? "LIVE" : item.durationLabel ?? item.status}</Text>
                    <Text style={styles.mediaTileTitle} numberOfLines={2}>{item.title}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </>
        ) : null}
        {requestedItems.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Requested items</Text>
            <View style={styles.itemList}>
              {requestedItems.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemText}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      {item.quantityReceived}/{item.quantityNeeded} {item.unit} received
                    </Text>
                  </View>
                  <Text style={[styles.priority, item.priority === "HIGH" && styles.priorityHigh]}>{item.priority}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
        <Text style={styles.sectionTitle}>Campaign story</Text>
        <Text style={styles.story}>This campaign has been reviewed for beneficiary identity, supporting documents, and fundraising need. Donations are tracked transparently and updates are shared with donors.</Text>
      </View>
      <CampaignVideoPlayer media={selectedMedia} onClose={() => setSelectedMedia(undefined)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  screenContent: {
    paddingBottom: 34
  },
  heroMedia: {
    position: "relative",
    backgroundColor: colors.text
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.22)"
  },
  mediaBadge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.text,
    backgroundColor: colors.background,
    fontSize: 12,
    fontWeight: "900"
  },
  liveBadge: {
    color: colors.background,
    backgroundColor: colors.urgent
  },
  heroMediaTitle: {
    color: colors.background,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  content: {
    padding: 16,
    gap: 12
  },
  category: {
    color: colors.primaryGreen,
    fontWeight: "900"
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.text
  },
  description: {
    color: colors.muted,
    lineHeight: 23
  },
  panel: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.supporting,
    gap: 14
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  amount: {
    color: colors.primaryGreen,
    fontSize: 24,
    fontWeight: "900"
  },
  goal: {
    color: colors.muted
  },
  percent: {
    fontWeight: "900"
  },
  tiers: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tier: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    fontWeight: "900"
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreen
  },
  buttonText: {
    color: colors.background,
    fontWeight: "900"
  },
  ownerNote: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border
  },
  ownerNoteTitle: {
    color: colors.text,
    fontWeight: "900"
  },
  ownerNoteText: {
    marginTop: 4,
    color: colors.muted,
    lineHeight: 20,
    fontWeight: "600"
  },
  mediaList: {
    gap: 10
  },
  mediaScroller: {
    gap: 10,
    paddingRight: 16
  },
  mediaRow: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.supporting,
    flexDirection: "row"
  },
  mediaRowActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: "#EEF7EF"
  },
  mediaTile: {
    width: 168,
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  mediaTileThumb: {
    height: 88,
    backgroundColor: colors.border
  },
  mediaTileTitle: {
    padding: 10,
    paddingTop: 6,
    color: colors.text,
    fontWeight: "900",
    lineHeight: 18
  },
  mediaThumb: {
    width: 118,
    minHeight: 112,
    backgroundColor: colors.border
  },
  mediaText: {
    flex: 1,
    padding: 12,
    gap: 6
  },
  mediaTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  mediaBadgeSmall: {
    alignSelf: "flex-start",
    marginTop: 8,
    marginLeft: 10,
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: colors.text,
    backgroundColor: colors.background,
    fontSize: 11,
    fontWeight: "900"
  },
  mediaType: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900"
  },
  mediaTitle: {
    color: colors.text,
    fontWeight: "900"
  },
  mediaDescription: {
    color: colors.muted,
    lineHeight: 19,
    fontSize: 13
  },
  itemList: {
    gap: 8
  },
  itemRow: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.supporting,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  itemText: {
    flex: 1
  },
  itemName: {
    color: colors.text,
    fontWeight: "900"
  },
  itemMeta: {
    marginTop: 4,
    color: colors.muted,
    fontWeight: "700"
  },
  priority: {
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: colors.muted,
    backgroundColor: colors.background,
    fontSize: 11,
    fontWeight: "900"
  },
  priorityHigh: {
    color: colors.background,
    backgroundColor: colors.urgent
  },
  sectionTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "900"
  },
  story: {
    color: colors.muted,
    lineHeight: 24
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContent: {
    gap: 14,
    padding: 16
  }
});
