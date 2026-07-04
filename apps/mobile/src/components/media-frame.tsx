import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

type Props = {
  uri?: string;
  title: string;
  height?: number;
  live?: boolean;
  compact?: boolean;
};

export function MediaFrame({ uri, title, height = 230, live = false, compact = false }: Props) {
  const [failed, setFailed] = useState(!uri);

  if (!uri || failed) {
    return (
      <LinearGradient colors={live ? ["#1B1B1B", "#B3261E"] : ["#1B1B1B", "#2E7D32"]} style={[styles.fallback, { height }, compact && styles.compact]}>
        <View style={styles.playCircle}>
          <Ionicons name={live ? "radio" : "play"} size={compact ? 18 : 30} color={colors.primaryGreen} />
        </View>
        <Text style={[styles.fallbackTitle, compact && styles.fallbackTitleCompact]} numberOfLines={compact ? 2 : 3}>
          {title}
        </Text>
        <Text style={styles.fallbackMeta}>{live ? "Live campaign stream" : "Campaign media update"}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.imageContainer, { height }, compact && styles.compact]}>
      <Image source={{ uri }} style={[styles.image, { height }, compact && styles.compact]} onError={() => setFailed(true)} resizeMode="cover" />
      <View style={styles.playOverlay}>
        <View style={styles.playCircle}>
          <Ionicons name={live ? "radio" : "play"} size={compact ? 16 : 26} color={colors.primaryGreen} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    position: "relative"
  },
  image: {
    width: "100%",
    backgroundColor: colors.supporting
  },
  compact: {
    height: "100%"
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)"
  },
  fallback: {
    width: "100%",
    padding: 16,
    justifyContent: "center",
    backgroundColor: colors.text
  },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  },
  fallbackTitle: {
    marginTop: 14,
    color: colors.background,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900"
  },
  fallbackTitleCompact: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 16
  },
  fallbackMeta: {
    marginTop: 6,
    color: "rgba(255,255,255,0.78)",
    fontWeight: "800"
  }
});
