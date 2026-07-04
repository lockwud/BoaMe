import { View, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

/**
 * SkeletonLoader Component
 * 
 * Displays a loading skeleton placeholder while content is being fetched.
 * Provides visual feedback to users during data loading operations.
 * 
 * @component
 * @example
 * <SkeletonLoader height={20} width="80%" />
 */
export function SkeletonLoader({ height = 20, width = "100%", borderRadius = 8 }: { height?: number; width?: number | `${number}%`; borderRadius?: number }) {
  return (
    <View
      style={[
        styles.skeleton,
        {
          height,
          width,
          borderRadius
        }
      ]}
    />
  );
}

/**
 * SkeletonCard Component
 * 
 * Displays a card-shaped skeleton loader for list items and campaign cards.
 * Mimics the structure of actual content cards for smooth loading transitions.
 * 
 * @component
 * @example
 * <SkeletonCard />
 */
export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonLoader height={180} borderRadius={12} />
      <View style={styles.cardContent}>
        <SkeletonLoader height={16} width="60%" />
        <SkeletonLoader height={14} width="90%" />
        <SkeletonLoader height={14} width="40%" />
      </View>
    </View>
  );
}

/**
 * SkeletonList Component
 * 
 * Displays multiple skeleton cards in a list layout.
 * Used for loading states in campaign lists and notification lists.
 * 
 * @component
 * @example
 * <SkeletonList count={3} />
 */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E7EAF0",
    overflow: "hidden"
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16
  },
  cardContent: {
    padding: 16,
    gap: 12
  },
  list: {
    gap: 16
  }
});