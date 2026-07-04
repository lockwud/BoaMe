import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

export function AppSplash({ onDone }: { onDone: () => void }) {
  const scale = useRef(new Animated.Value(0.86)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      )
    ]).start();

    const timer = setTimeout(() => onDoneRef.current(), 5000);
    return () => clearTimeout(timer);
  }, [opacity, pulse, scale]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12]
  });

  return (
    <LinearGradient colors={["#F7FAF2", "#E8F4EA"]} style={styles.screen}>
      <Animated.View style={[styles.pulse, { transform: [{ scale: pulseScale }] }]} />
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.heart}>♥</Text>
        </View>
        <Text style={styles.brand}>BoaMe</Text>
        <Text style={styles.tagline}>Verified support. Real impact.</Text>
      </Animated.View>
      <Text style={styles.loading}>Preparing campaigns, streams, and payments...</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.supporting
  },
  pulse: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(46,125,50,0.12)"
  },
  logoWrap: {
    alignItems: "center"
  },
  logoCircle: {
    width: 138,
    height: 138,
    borderRadius: 69,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreen
  },
  heart: {
    color: colors.background,
    fontSize: 76,
    lineHeight: 86,
    fontWeight: "900"
  },
  brand: {
    marginTop: 22,
    color: colors.text,
    fontSize: 44,
    fontWeight: "900"
  },
  tagline: {
    marginTop: 8,
    color: colors.primaryGreen,
    fontSize: 16,
    fontWeight: "800"
  },
  loading: {
    position: "absolute",
    bottom: 64,
    color: colors.muted,
    fontWeight: "800"
  }
});
