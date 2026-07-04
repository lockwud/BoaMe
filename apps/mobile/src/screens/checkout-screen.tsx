import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";
import type { RootStackParamList } from "../navigation/types";
import { verifyDonation } from "../services/donation-service";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

function referenceFromUrl(url: string, fallback: string) {
  try {
    const parsed = new URL(url);
    const reference = parsed.searchParams.get("reference") ?? parsed.searchParams.get("trxref");
    if (reference) return reference;
    return url.includes(`/verify/${fallback}`) || (parsed.hostname === "checkout.paystack.com" && parsed.pathname.includes("close")) ? fallback : null;
  } catch {
    return url.includes(fallback) ? fallback : null;
  }
}

export function CheckoutScreen({ route, navigation }: Props) {
  const { authorizationUrl, reference, amount, campaignTitle, kind, paymentMethod } = route.params;
  const [isVerifying, setIsVerifying] = useState(false);
  const hasVerified = useRef(false);

  async function completeCheckout(nextReference: string) {
    if (hasVerified.current) return;
    hasVerified.current = true;
    setIsVerifying(true);

    try {
      const donation = await verifyDonation(nextReference);
      navigation.replace("DonationSuccess", {
        reference: donation.reference,
        status: donation.status,
        amount: donation.amount ?? amount,
        campaignTitle: donation.campaignTitle ?? campaignTitle,
        kind: donation.kind ?? kind,
        paymentMethod: donation.paymentMethod ?? paymentMethod
      });
    } catch (error) {
      hasVerified.current = false;
      Alert.alert("Payment check failed", error instanceof Error ? error.message : "Could not verify this donation yet.");
    } finally {
      setIsVerifying(false);
    }
  }

  function handleNavigation(navState: WebViewNavigation) {
    const nextReference = referenceFromUrl(navState.url, reference);
    if (nextReference) {
      completeCheckout(nextReference);
    }
  }

  return (
    <View style={styles.screen}>
      <WebView
        source={{ uri: authorizationUrl }}
        onNavigationStateChange={handleNavigation}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.primaryGreen} />
          </View>
        )}
      />
      {isVerifying ? (
        <View style={styles.verifying}>
          <ActivityIndicator color={colors.primaryGreen} />
          <Text style={styles.verifyingText}>Confirming donation</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  },
  verifying: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    minHeight: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.background,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8
  },
  verifyingText: {
    color: colors.text,
    fontWeight: "900"
  }
});
