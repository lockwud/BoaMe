import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border
  },
  value: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryGreen
  },
  label: {
    marginTop: 4,
    color: colors.muted,
    fontWeight: "600"
  }
});
