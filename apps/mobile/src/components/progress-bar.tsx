import { StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.track} accessibilityLabel={`${percent}% funded`}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, percent))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 9,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.border
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.secondaryGreen
  }
});
