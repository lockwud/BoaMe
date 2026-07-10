import type { CampaignSummary, DonationKind, DonationMode, DonationType, PaymentMethod } from "@boame/shared-types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SkeletonLoader } from "../components/skeleton-loader";
import type { RootStackParamList } from "../navigation/types";
import { getCampaign } from "../services/campaign-service";
import { initializeDonation } from "../services/donation-service";
import { getCurrentUser } from "../services/auth-service";
import { paymentMethodLabels } from "../services/settings-service";
import { colors } from "../theme/colors";
import { formatGhs } from "../utils/format";

type Props = NativeStackScreenProps<RootStackParamList, "Donate">;

const paymentMethods: PaymentMethod[] = ["MOBILE_MONEY", "CARD", "BANK_TRANSFER", "OFFLINE"];
const donationTypes: DonationType[] = ["ONE_TIME", "DAILY", "WEEKLY", "MONTHLY"];
const donationModes: Array<{ value: DonationMode; label: string; hint: string }> = [
  { value: "INDIVIDUAL", label: "Individual", hint: "Donate from one account." },
  { value: "SPLIT", label: "Split payment", hint: "Split one donation across multiple methods." },
  { value: "GROUP", label: "Group donation", hint: "Create a shared donation for friends, family, or a team." }
];
const donationKinds: Array<{ value: DonationKind; label: string; hint: string }> = [
  { value: "MONEY", label: "Money", hint: "Pay securely by mobile money, card, transfer, or pledge." },
  { value: "ITEMS", label: "Items", hint: "Donate requested goods like food, tents, clothes, books, or medicine." },
  { value: "MONEY_AND_ITEMS", label: "Money + items", hint: "Combine a cash gift with physical items." }
];

function detectCardBrand(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  return "Card";
}

function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function isBundledCampaign(campaign: CampaignSummary) {
  return campaign.id.startsWith("camp_");
}

export function DonateScreen({ route, navigation }: Props) {
  const [campaign, setCampaign] = useState<CampaignSummary | null>(null);
  const [loadError, setLoadError] = useState("");
  const [amount, setAmount] = useState("25");
  const [kind, setKind] = useState<DonationKind>("MONEY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");
  const [donationType, setDonationType] = useState<DonationType>("ONE_TIME");
  const [mode, setMode] = useState<DonationMode>("INDIVIDUAL");
  const [phoneNumber, setPhoneNumber] = useState("+233");
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<"MTN" | "VODAFONE" | "AIRTELTIGO">("MTN");
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bankName, setBankName] = useState("GCB Bank");
  const [accountName, setAccountName] = useState("Ama Mensah");
  const [transferReference, setTransferReference] = useState("");
  const [offlinePledgeNote, setOfflinePledgeNote] = useState("I will deliver payment to the BoaMe field team.");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [dropdown, setDropdown] = useState<"payment" | "type" | null>(null);
  const [splitPrimaryAmount, setSplitPrimaryAmount] = useState("15");
  const [splitSecondaryAmount, setSplitSecondaryAmount] = useState("10");
  const [splitSecondaryMethod, setSplitSecondaryMethod] = useState<PaymentMethod>("CARD");
  const [groupName, setGroupName] = useState("");
  const [organizerName, setOrganizerName] = useState("Ama Mensah");
  const [expectedMembers, setExpectedMembers] = useState("5");
  const [allowMemberMessages, setAllowMemberMessages] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [itemCondition, setItemCondition] = useState<"NEW" | "GOOD" | "USED">("GOOD");
  const [deliveryMethod, setDeliveryMethod] = useState<"PICKUP" | "DROP_OFF">("PICKUP");
  const [donorContact, setDonorContact] = useState("+233");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCampaign() {
      setLoadError("");
      try {
        const loadedCampaign = await getCampaign(route.params.slug);
        if (!isMounted) return;

        const nextItems = loadedCampaign.requestedItems ?? [];
        setCampaign(loadedCampaign);
        setKind(nextItems.length > 0 ? "MONEY_AND_ITEMS" : "MONEY");
        setSelectedItemId(nextItems[0]?.id ?? "");
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : "Could not load this campaign.");
      }
    }

    loadCampaign();
    return () => {
      isMounted = false;
    };
  }, [route.params.slug]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      setPayerName(fullName || user.email);
      setPayerEmail(user.email);
    }
  }, []);

  if (!campaign) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <SkeletonLoader height={16} width="36%" />
        <View style={styles.loadingGap}>
          <SkeletonLoader height={32} width="82%" />
          <SkeletonLoader height={18} width="100%" />
          <SkeletonLoader height={18} width="74%" />
        </View>
        <View style={styles.card}>
          <SkeletonLoader height={22} width="48%" />
          <View style={styles.loadingGap}>
            <SkeletonLoader height={52} />
            <SkeletonLoader height={52} />
            <SkeletonLoader height={52} />
          </View>
        </View>
        {loadError ? <Text style={styles.warningText}>{loadError}</Text> : null}
      </ScrollView>
    );
  }

  const loadedCampaign = campaign;
  const requestedItems = loadedCampaign.requestedItems ?? [];
  const numericAmount = Number(amount) || 0;
  const includesMoney = kind !== "ITEMS";
  const includesItems = kind !== "MONEY";
  const splitTotal = (Number(splitPrimaryAmount) || 0) + (Number(splitSecondaryAmount) || 0);
  const selectedItem = requestedItems.find((item) => item.id === selectedItemId) ?? requestedItems[0];
  const hasValidItems = !includesItems || Boolean(selectedItem && Number(itemQuantity) > 0 && donorContact.trim().length >= 6);
  const hasValidGroup = mode !== "GROUP" || (groupName.trim().length > 1 && organizerName.trim().length > 1 && Number(expectedMembers) >= 2);
  const hasValidPayment =
    !includesMoney ||
    (numericAmount >= loadedCampaign.minimumDonation &&
      payerName.trim().length > 1 &&
      payerEmail.includes("@") &&
      (paymentMethod !== "CARD" || cardNumber.replace(/\D/g, "").length >= 12) &&
      (paymentMethod !== "BANK_TRANSFER" || (bankName.trim().length > 1 && accountName.trim().length > 1)) &&
      (paymentMethod !== "OFFLINE" || offlinePledgeNote.trim().length > 8));
  const canSubmit = hasValidPayment && hasValidItems && hasValidGroup && !isSubmitting && (mode !== "SPLIT" || !includesMoney || Math.abs(splitTotal - numericAmount) < 0.01);
  const cardBrand = detectCardBrand(cardNumber);
  const cardDigits = cardNumber.replace(/\D/g, "");
  const summary =
    kind === "ITEMS"
      ? `${itemQuantity || "0"} ${selectedItem?.unit ?? "items"} of ${selectedItem?.name ?? "requested items"} by ${deliveryMethod.replace("_", " ").toLowerCase()}.`
      : kind === "MONEY_AND_ITEMS"
        ? `${formatGhs(numericAmount)} plus ${itemQuantity || "0"} ${selectedItem?.unit ?? "items"} of ${selectedItem?.name ?? "requested items"}.`
        : mode === "GROUP"
          ? `${groupName || "Your group"} will invite ${expectedMembers || "0"} people to raise ${formatGhs(numericAmount)}.`
          : mode === "SPLIT"
            ? `${formatGhs(splitTotal)} split between ${paymentMethodLabels[paymentMethod]} and ${paymentMethodLabels[splitSecondaryMethod]}.`
            : `${formatGhs(numericAmount)} using ${paymentMethodLabels[paymentMethod]}.`;

  async function submitDonation() {
    if (!canSubmit) {
      Alert.alert("Check donation", mode === "SPLIT" ? "Split payment amounts must equal the total donation." : `Minimum donation is ${formatGhs(loadedCampaign.minimumDonation)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isBundledCampaign(loadedCampaign)) {
        throw new Error("This campaign is not available from the backend yet. Refresh campaigns and try again.");
      }

      const response = await initializeDonation({
        campaignId: loadedCampaign.id,
        amount: includesMoney ? numericAmount : 0,
        kind,
        paymentMethod: includesMoney ? paymentMethod : "OFFLINE",
        type: donationType,
        mode,
        isAnonymous,
        message: message.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        callbackUrl: "https://checkout.paystack.com/close",
        itemDonations:
          includesItems && selectedItem
            ? [
                {
                  itemId: selectedItem.id,
                  itemName: selectedItem.name,
                  quantity: Number(itemQuantity) || 1,
                  condition: itemCondition,
                  deliveryMethod,
                  donorContact
                }
              ]
            : undefined,
        paymentDetails: includesMoney
          ? {
              provider: "PAYSTACK_DEMO",
              payerName,
              payerEmail,
              cardLast4: paymentMethod === "CARD" ? cardNumber.replace(/\D/g, "").slice(-4) : undefined,
              mobileMoneyProvider: paymentMethod === "MOBILE_MONEY" ? mobileMoneyProvider : undefined,
              bankName: paymentMethod === "BANK_TRANSFER" ? bankName : undefined,
              accountName: paymentMethod === "BANK_TRANSFER" ? accountName : undefined,
              transferReference: paymentMethod === "BANK_TRANSFER" ? transferReference || undefined : undefined,
              offlinePledgeNote: paymentMethod === "OFFLINE" ? offlinePledgeNote : undefined
            }
          : undefined,
        splitPayments:
          mode === "SPLIT" && includesMoney
            ? [
                { label: "Primary payment", amount: Number(splitPrimaryAmount), paymentMethod, phoneNumber },
                { label: "Second payment", amount: Number(splitSecondaryAmount), paymentMethod: splitSecondaryMethod }
              ]
            : undefined,
        groupDonation:
          mode === "GROUP"
            ? {
                groupName: groupName.trim(),
                organizerName: organizerName.trim(),
                expectedMembers: Number(expectedMembers) || 2,
                allowMemberMessages
              }
            : undefined
      });

      if (response.authorizationUrl && includesMoney && paymentMethod !== "OFFLINE") {
        navigation.navigate("Checkout", {
          authorizationUrl: response.authorizationUrl,
          reference: response.reference,
          amount: response.donation.amount,
          campaignTitle: response.donation.campaignTitle,
          kind: response.donation.kind,
          paymentMethod: response.donation.paymentMethod
        });
        return;
      }

      navigation.replace("DonationSuccess", {
        reference: response.reference,
        status: response.donation.status,
        amount: response.donation.amount,
        campaignTitle: response.donation.campaignTitle,
        kind: response.donation.kind,
        paymentMethod: response.donation.paymentMethod
      });
    } catch (error) {
      Alert.alert("Donation failed", error instanceof Error ? error.message : "Could not initialize the donation.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.kicker}>Verified donation</Text>
      <Text style={styles.title}>{loadedCampaign.title}</Text>
      <Text style={styles.copy}>Choose whether you want to give money, requested items, or both. BoaMe will keep the same campaign reference across payments, item pledges, and group support.</Text>

      <View style={styles.segmentGroup}>
        {donationKinds.map((item) => (
          <Pressable
            key={item.value}
            style={[styles.modeButton, kind === item.value && styles.modeButtonActive, item.value !== "MONEY" && requestedItems.length === 0 && styles.buttonDisabled]}
            disabled={item.value !== "MONEY" && requestedItems.length === 0}
            onPress={() => setKind(item.value)}
          >
            <Text style={[styles.modeTitle, kind === item.value && styles.modeTitleActive]}>{item.label}</Text>
            <Text style={[styles.modeHint, kind === item.value && styles.modeHintActive]}>{item.hint}</Text>
          </Pressable>
        ))}
      </View>

      {includesMoney ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Money donation</Text>
          <Text style={styles.label}>Amount</Text>
          <TextInput keyboardType="numeric" value={amount} onChangeText={setAmount} style={styles.input} />

          <Text style={styles.label}>Payment method</Text>
          <Pressable style={styles.dropdownButton} onPress={() => setDropdown("payment")}>
            <Text style={styles.dropdownText}>{paymentMethodLabels[paymentMethod]}</Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>

          <Text style={styles.label}>Donation rhythm</Text>
          <Pressable style={styles.dropdownButton} onPress={() => setDropdown("type")}>
            <Text style={styles.dropdownText}>{donationType.replace("_", " ").toLowerCase()}</Text>
            <Text style={styles.chevron}>⌄</Text>
          </Pressable>

          <Text style={styles.label}>Payer name</Text>
          <TextInput value={payerName} onChangeText={setPayerName} style={styles.input} />
          <Text style={styles.label}>Payer email</Text>
          <TextInput keyboardType="email-address" autoCapitalize="none" value={payerEmail} onChangeText={setPayerEmail} style={styles.input} />

          {paymentMethod === "MOBILE_MONEY" ? (
            <>
              <Text style={styles.label}>Mobile money network</Text>
              <View style={styles.inlineWrap}>
                {(["MTN", "VODAFONE", "AIRTELTIGO"] as const).map((provider) => (
                  <Pressable key={provider} style={[styles.chip, mobileMoneyProvider === provider && styles.chipActive]} onPress={() => setMobileMoneyProvider(provider)}>
                    <Text style={[styles.chipText, mobileMoneyProvider === provider && styles.chipTextActive]}>{provider}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.label}>Mobile money number</Text>
              <TextInput keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} style={styles.input} />
            </>
          ) : null}

          {paymentMethod === "CARD" ? (
            <>
              <View style={styles.cardPreview}>
                <View>
                  <Text style={styles.cardPreviewLabel}>Card type</Text>
                  <Text style={styles.cardPreviewBrand}>{cardBrand}</Text>
                </View>
                <Text style={styles.cardPreviewNumber}>{cardDigits ? `•••• ${cardDigits.slice(-4)}` : "Enter card"}</Text>
              </View>
              <Text style={styles.label}>Card number</Text>
              <TextInput keyboardType="number-pad" value={formatCardNumber(cardNumber)} onChangeText={(value) => setCardNumber(value.replace(/\D/g, "").slice(0, 19))} placeholder="Card number" style={styles.input} />
              <View style={styles.twoColumn}>
                <View style={styles.column}>
                  <Text style={styles.label}>Expiry</Text>
                  <TextInput value={cardExpiry} onChangeText={setCardExpiry} placeholder="MM/YY" style={styles.input} />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput keyboardType="number-pad" secureTextEntry value={cardCvv} onChangeText={(value) => setCardCvv(value.replace(/\D/g, "").slice(0, 4))} placeholder="CVV" style={styles.input} />
                </View>
              </View>
            </>
          ) : null}

          {paymentMethod === "BANK_TRANSFER" ? (
            <>
              <Text style={styles.label}>Bank name</Text>
              <TextInput value={bankName} onChangeText={setBankName} style={styles.input} />
              <Text style={styles.label}>Account name</Text>
              <TextInput value={accountName} onChangeText={setAccountName} style={styles.input} />
              <Text style={styles.label}>Transfer reference</Text>
              <TextInput value={transferReference} onChangeText={setTransferReference} placeholder="Optional bank reference" style={styles.input} />
            </>
          ) : null}

          {paymentMethod === "OFFLINE" ? (
            <>
              <Text style={styles.label}>Offline pledge note</Text>
              <TextInput value={offlinePledgeNote} onChangeText={setOfflinePledgeNote} multiline style={[styles.input, styles.textArea]} />
            </>
          ) : null}

          <Text style={styles.helper}>Paystack demo checkout will return a success reference after submit.</Text>
        </View>
      ) : null}

      {includesItems && selectedItem ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Requested items</Text>
          <Text style={styles.copy}>Select what you can give from the campaign’s verified request list.</Text>
          <View style={styles.inlineWrap}>
            {requestedItems.map((item) => (
              <Pressable key={item.id} style={[styles.chip, selectedItemId === item.id && styles.chipActive]} onPress={() => setSelectedItemId(item.id)}>
                <Text style={[styles.chipText, selectedItemId === item.id && styles.chipTextActive]}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Quantity ({selectedItem.unit})</Text>
          <TextInput keyboardType="numeric" value={itemQuantity} onChangeText={setItemQuantity} style={styles.input} />
          <Text style={styles.label}>Condition</Text>
          <View style={styles.inlineWrap}>
            {(["NEW", "GOOD", "USED"] as const).map((condition) => (
              <Pressable key={condition} style={[styles.chip, itemCondition === condition && styles.chipActive]} onPress={() => setItemCondition(condition)}>
                <Text style={[styles.chipText, itemCondition === condition && styles.chipTextActive]}>{condition}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Delivery</Text>
          <View style={styles.inlineWrap}>
            {(["PICKUP", "DROP_OFF"] as const).map((delivery) => (
              <Pressable key={delivery} style={[styles.chip, deliveryMethod === delivery && styles.chipActive]} onPress={() => setDeliveryMethod(delivery)}>
                <Text style={[styles.chipText, deliveryMethod === delivery && styles.chipTextActive]}>{delivery.replace("_", " ")}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Donor contact</Text>
          <TextInput keyboardType="phone-pad" value={donorContact} onChangeText={setDonorContact} style={styles.input} />
          <Text style={styles.helper}>
            Needed: {selectedItem.quantityNeeded - selectedItem.quantityReceived} more {selectedItem.unit}
          </Text>
        </View>
      ) : null}

      <View style={styles.segmentGroup}>
        {donationModes.map((item) => (
          <Pressable key={item.value} style={[styles.modeButton, mode === item.value && styles.modeButtonActive]} onPress={() => setMode(item.value)}>
            <Text style={[styles.modeTitle, mode === item.value && styles.modeTitleActive]}>{item.label}</Text>
            <Text style={[styles.modeHint, mode === item.value && styles.modeHintActive]}>{item.hint}</Text>
          </Pressable>
        ))}
      </View>

      {mode === "SPLIT" && includesMoney ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Split payment</Text>
          <Text style={styles.copy}>Use this when one donation should be collected from more than one payment source.</Text>
          <Text style={styles.label}>Primary amount ({paymentMethodLabels[paymentMethod]})</Text>
          <TextInput keyboardType="numeric" value={splitPrimaryAmount} onChangeText={setSplitPrimaryAmount} style={styles.input} />
          <Text style={styles.label}>Second payment method</Text>
          <View style={styles.inlineWrap}>
            {paymentMethods.filter((method) => method !== paymentMethod).map((method) => (
              <Pressable key={method} style={[styles.chip, splitSecondaryMethod === method && styles.chipActive]} onPress={() => setSplitSecondaryMethod(method)}>
                <Text style={[styles.chipText, splitSecondaryMethod === method && styles.chipTextActive]}>{paymentMethodLabels[method]}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Second amount</Text>
          <TextInput keyboardType="numeric" value={splitSecondaryAmount} onChangeText={setSplitSecondaryAmount} style={styles.input} />
          <Text style={[styles.helper, Math.abs(splitTotal - numericAmount) > 0.01 && styles.warningText]}>
            Split total: {formatGhs(splitTotal)} of {formatGhs(numericAmount)}
          </Text>
        </View>
      ) : null}

      {mode === "GROUP" ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Group donation</Text>
          <Text style={styles.copy}>Create a group donation for a church, class, workplace, family, or friends circle.</Text>
          <Text style={styles.label}>Group name</Text>
          <TextInput value={groupName} onChangeText={setGroupName} placeholder="e.g. North Legon Friends" style={styles.input} />
          <Text style={styles.label}>Organizer name</Text>
          <TextInput value={organizerName} onChangeText={setOrganizerName} style={styles.input} />
          <Text style={styles.label}>Expected members</Text>
          <TextInput keyboardType="numeric" value={expectedMembers} onChangeText={setExpectedMembers} style={styles.input} />
          <SettingSwitch label="Allow member messages" value={allowMemberMessages} onValueChange={setAllowMemberMessages} />
          {!hasValidGroup ? <Text style={styles.warningText}>Add a group name, organizer name, and at least 2 expected members.</Text> : null}
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Receipt details</Text>
        <SettingSwitch label="Donate anonymously" value={isAnonymous} onValueChange={setIsAnonymous} />
        <Text style={styles.label}>Message</Text>
        <TextInput value={message} onChangeText={setMessage} placeholder="Optional note for the campaign" multiline style={[styles.input, styles.textArea]} />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>{summary}</Text>
      </View>

      <Pressable disabled={!canSubmit} style={[styles.button, !canSubmit && styles.buttonDisabled]} onPress={submitDonation}>
        <Text style={styles.buttonText}>{isSubmitting ? "Processing..." : includesMoney ? "Pay and submit support" : "Submit item donation"}</Text>
      </Pressable>

      <ChoiceModal
        visible={dropdown === "payment"}
        title="Payment method"
        options={paymentMethods.map((method) => ({ label: paymentMethodLabels[method], value: method }))}
        onClose={() => setDropdown(null)}
        onSelect={(value) => {
          setPaymentMethod(value as PaymentMethod);
          setDropdown(null);
        }}
      />
      <ChoiceModal
        visible={dropdown === "type"}
        title="Donation rhythm"
        options={donationTypes.map((type) => ({ label: type.replace("_", " ").toLowerCase(), value: type }))}
        onClose={() => setDropdown(null)}
        onSelect={(value) => {
          setDonationType(value as DonationType);
          setDropdown(null);
        }}
      />
    </ScrollView>
  );
}

function SettingSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.accentGreen, false: colors.border }} thumbColor={value ? colors.primaryGreen : colors.background} />
    </View>
  );
}

function ChoiceModal({ visible, title, options, onSelect, onClose }: { visible: boolean; title: string; options: Array<{ label: string; value: string }>; onSelect: (value: string) => void; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((option) => (
            <Pressable key={option.value} style={styles.modalOption} onPress={() => onSelect(option.value)}>
              <Text style={styles.modalOptionText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.supporting
  },
  content: {
    padding: 16,
    paddingBottom: 36
  },
  loadingGap: {
    marginTop: 14,
    gap: 12
  },
  kicker: {
    color: colors.primaryGreen,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  title: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: "900",
    color: colors.text
  },
  copy: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 21
  },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  label: {
    marginTop: 14,
    marginBottom: 8,
    fontWeight: "900",
    color: colors.text
  },
  input: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: colors.background
  },
  twoColumn: {
    flexDirection: "row",
    gap: 10
  },
  column: {
    flex: 1
  },
  textArea: {
    minHeight: 86,
    paddingTop: 12,
    textAlignVertical: "top"
  },
  dropdownButton: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropdownText: {
    fontWeight: "800",
    textTransform: "capitalize"
  },
  cardPreview: {
    marginTop: 14,
    minHeight: 76,
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border
  },
  cardPreviewLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  cardPreviewBrand: {
    marginTop: 4,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  cardPreviewNumber: {
    color: colors.primaryGreen,
    fontWeight: "900"
  },
  chevron: {
    fontSize: 24,
    color: colors.muted
  },
  segmentGroup: {
    marginTop: 16,
    gap: 10
  },
  modeButton: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background
  },
  modeButtonActive: {
    borderColor: colors.primaryGreen,
    backgroundColor: "#EEF7EF"
  },
  modeTitle: {
    fontWeight: "900",
    color: colors.text
  },
  modeTitleActive: {
    color: colors.primaryGreen
  },
  modeHint: {
    marginTop: 4,
    color: colors.muted,
    lineHeight: 19
  },
  modeHintActive: {
    color: colors.text
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900"
  },
  inlineWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  chipActive: {
    backgroundColor: colors.primaryGreen,
    borderColor: colors.primaryGreen
  },
  chipText: {
    fontWeight: "800",
    color: colors.text
  },
  chipTextActive: {
    color: colors.background
  },
  helper: {
    marginTop: 10,
    color: colors.muted,
    fontWeight: "800"
  },
  warningText: {
    color: colors.warning
  },
  switchRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  switchLabel: {
    flex: 1,
    paddingRight: 12,
    fontWeight: "800",
    color: colors.text
  },
  summary: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.text
  },
  summaryTitle: {
    color: colors.background,
    fontWeight: "900"
  },
  summaryText: {
    marginTop: 6,
    color: colors.background,
    lineHeight: 21
  },
  button: {
    height: 52,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryGreen
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: colors.background,
    fontWeight: "900"
  },
  modalOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)"
  },
  modalCard: {
    borderRadius: 8,
    backgroundColor: colors.background,
    padding: 12
  },
  modalTitle: {
    padding: 10,
    fontSize: 18,
    fontWeight: "900"
  },
  modalOption: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  modalOptionText: {
    fontWeight: "800",
    textTransform: "capitalize"
  }
});
