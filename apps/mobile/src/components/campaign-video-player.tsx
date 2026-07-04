import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type CampaignVideo = {
  title: string;
  description?: string;
  streamUrl?: string;
  thumbnailUrl?: string;
  status?: "LIVE" | "SCHEDULED" | "RECORDED";
};

export function CampaignVideoPlayer({ media, onClose }: { media?: CampaignVideo; onClose: () => void }) {
  const player = useVideoPlayer(
    media?.streamUrl
      ? {
          uri: media.streamUrl,
          contentType: media.streamUrl.includes(".m3u8") ? "hls" : "auto",
          metadata: {
            title: media.title,
            artist: "BoaMe",
            artwork: media.thumbnailUrl
          }
        }
      : null,
    (videoPlayer) => {
      videoPlayer.loop = false;
      videoPlayer.play();
    }
  );

  return (
    <Modal visible={Boolean(media)} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.status}>{media?.status === "LIVE" ? "LIVE STREAM" : "CAMPAIGN VIDEO"}</Text>
            <Text style={styles.title} numberOfLines={2}>{media?.title ?? "Campaign video"}</Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.background} />
          </Pressable>
        </View>

        {media?.streamUrl ? (
          <VideoView
            player={player}
            style={styles.video}
            nativeControls
            contentFit="contain"
            allowsFullscreen
            allowsPictureInPicture
          />
        ) : (
          <View style={styles.noVideo}>
            <Ionicons name="videocam-off-outline" size={40} color={colors.background} />
            <Text style={styles.noVideoText}>This campaign video is not available yet.</Text>
          </View>
        )}

        {media?.description ? <Text style={styles.description}>{media.description}</Text> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.text,
    paddingTop: 54
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  headerText: {
    flex: 1
  },
  status: {
    color: colors.accentGreen,
    fontSize: 12,
    fontWeight: "900"
  },
  title: {
    marginTop: 4,
    color: colors.background,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900"
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)"
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000"
  },
  noVideo: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000"
  },
  noVideoText: {
    marginTop: 10,
    color: colors.background,
    fontWeight: "800"
  },
  description: {
    padding: 16,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 22,
    fontWeight: "700"
  }
});
