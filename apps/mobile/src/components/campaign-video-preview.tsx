import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

type CampaignVideo = {
  title: string;
  description?: string;
  streamUrl?: string;
  thumbnailUrl?: string;
  status?: "LIVE" | "SCHEDULED" | "RECORDED";
};

export function CampaignVideoPreview({ media, onFullscreen }: { media?: CampaignVideo; onFullscreen: () => void }) {
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
      videoPlayer.loop = true;
      videoPlayer.muted = true;
      videoPlayer.play();
    }
  );

  if (!media) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.badge, media.status === "LIVE" && styles.liveBadge]}>{media.status === "LIVE" ? "LIVE" : "VIDEO"}</Text>
          <Text style={styles.title}>{media.title}</Text>
        </View>
        <Pressable style={styles.fullscreenButton} onPress={onFullscreen}>
          <Ionicons name="expand-outline" size={20} color={colors.text} />
        </Pressable>
      </View>

      {media.streamUrl ? (
        <VideoView
          player={player}
          style={styles.video}
          nativeControls
          contentFit="cover"
          allowsFullscreen
          allowsPictureInPicture
        />
      ) : (
        <View style={styles.emptyVideo}>
          <Ionicons name="videocam-off-outline" size={34} color={colors.background} />
          <Text style={styles.emptyText}>Video stream is not ready yet.</Text>
        </View>
      )}

      {media.description ? <Text style={styles.description}>{media.description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  header: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  headerText: {
    flex: 1,
    gap: 6
  },
  badge: {
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: colors.primaryGreen,
    backgroundColor: "#EEF7EF",
    fontSize: 11,
    fontWeight: "900"
  },
  liveBadge: {
    color: colors.background,
    backgroundColor: colors.urgent
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  fullscreenButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.supporting
  },
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000"
  },
  emptyVideo: {
    width: "100%",
    aspectRatio: 16 / 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.text
  },
  emptyText: {
    marginTop: 8,
    color: colors.background,
    fontWeight: "800"
  },
  description: {
    padding: 12,
    color: colors.muted,
    lineHeight: 20,
    fontWeight: "700"
  }
});
