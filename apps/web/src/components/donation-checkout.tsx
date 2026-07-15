"use client";

import type { CampaignSummary, DonationKind, DonationMode, PaymentMethod } from "@boame/shared-types";
import { CheckCircle, HeartHandshake, Share2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useMemo, useState } from "react";
import { apiPost } from "@/lib/client-api";
import { formatGhs, progressPercent } from "@/lib/utils";
import { Button } from "./button";
import { ProgressBar } from "./progress-bar";

type DonationResponse = {
  reference: string;
  authorizationUrl: string;
  donation: {
    id?: string;
    status: string;
    campaignTitle: string;
    amount: number;
    raisedAmount?: number;
  };
};

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref?: string;
        channels?: string[];
        metadata?: Record<string, unknown>;
        onSuccess: (transaction: { reference: string }) => void;
        onCancel: () => void;
        onError?: () => void;
      }) => { openIframe: () => void };
    };
  }
}

type DonationCheckoutProps = {
  campaign: CampaignSummary;
};

const PAYSTACK_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";

function hasValidPaystackKey(): boolean {
  return PAYSTACK_KEY.startsWith("pk_") && PAYSTACK_KEY.length > 20 && !PAYSTACK_KEY.includes("xxxxx");
}

function paystackChannels(method: PaymentMethod): string[] {
  switch (method) {
    case "CARD": return ["card"];
    case "MOBILE_MONEY": return ["mobile_money"];
    case "BANK_TRANSFER": return ["bank_transfer"];
    default: return ["card", "mobile_money", "bank_transfer"];
  }
}

export function DonationCheckout({ campaign }: DonationCheckoutProps) {
  const router = useRouter();
  const requestedItems = campaign.requestedItems ?? [];
  const [amount, setAmount] = useState("25");
  const [kind, setKind] = useState<DonationKind>(requestedItems.length ? "MONEY_AND_ITEMS" : "MONEY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");
  const [donationMode, setDonationMode] = useState<DonationMode>("INDIVIDUAL");
  const [phoneNumber, setPhoneNumber] = useState("+233241234567");
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<"MTN" | "VODAFONE" | "AIRTELTIGO">("MTN");
  const [groupName, setGroupName] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(requestedItems[0]?.id ?? "");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [receiptRef, setReceiptRef] = useState<string | null>(null);
  const [latestRaised, setLatestRaised] = useState<number | null>(null);

  const effectiveRaised = latestRaised ?? campaign.raisedAmount;

  const selectedItem = requestedItems.find((item) => item.id === selectedItemId) ?? requestedItems[0];
  const includesMoney = kind !== "ITEMS";
  const includesItems = kind !== "MONEY";
  const numericAmount = Number(amount) || 0;
  const splitAmount = Math.max(1, Math.round(numericAmount / 2));

  const isOnlinePayment = paymentMethod === "CARD" || paymentMethod === "MOBILE_MONEY" || paymentMethod === "BANK_TRANSFER";

  const summary = useMemo(() => {
    if (kind === "ITEMS") return `${itemQuantity} ${selectedItem?.unit ?? "items"} of ${selectedItem?.name ?? "requested items"}`;
    if (kind === "MONEY_AND_ITEMS") return `${formatGhs(numericAmount)} plus ${itemQuantity} ${selectedItem?.unit ?? "items"} of ${selectedItem?.name ?? "requested items"}`;
    return `${formatGhs(numericAmount)} by ${paymentMethod.replace("_", " ").toLowerCase()}`;
  }, [itemQuantity, kind, numericAmount, paymentMethod, selectedItem]);

  function validate(): string | null {
    if (includesMoney && !payerName.trim()) return "Please enter your name.";
    if (includesMoney && !payerEmail.trim()) return "Please enter your email.";
    if (includesMoney && !phoneNumber.trim()) return "Please enter your phone number.";
    if (includesMoney && numericAmount < campaign.minimumDonation) return `Minimum donation is ${formatGhs(campaign.minimumDonation)}.`;
    return null;
  }

  function openCheckout() {
    setStatus(null);
    setCheckoutOpen(true);
  }

  function closeCheckout() {
    setCheckoutOpen(false);
    setStatus(null);
  }

  async function processPayment() {
    const error = validate();
    if (error) {
      setStatus(error);
      return;
    }

    if (isOnlinePayment && typeof window.PaystackPop !== "undefined" && hasValidPaystackKey()) {
      setSubmitting(true);
      setStatus(null);
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: payerEmail,
        amount: numericAmount * 100,
        currency: "GHS",
        channels: paystackChannels(paymentMethod),
        ref: `BOAME-${Date.now()}`,
        metadata: {
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          donorName: payerName,
          phoneNumber
        },
        onSuccess: async (transaction) => {
          await recordDonation(transaction.reference);
        },
        onCancel: () => {
          setStatus("Payment cancelled.");
          setSubmitting(false);
        },
        onError: () => {
          setStatus("Payment failed. Please try again.");
          setSubmitting(false);
        }
      });
      handler.openIframe();
    } else {
      completeDonation(null);
    }
  }

  function completeDonation(paystackRef: string | null) {
    const ref = paystackRef ?? `BOAME-${Date.now()}`;
    setLatestRaised(effectiveRaised + numericAmount);
    setReceiptRef(ref);
    setCheckoutOpen(false);
    setIsComplete(true);
    setSubmitting(false);
    router.refresh();
    apiPost<DonationResponse>(
      "/donations/initialize",
      {
        campaignId: campaign.id,
        amount: includesMoney ? numericAmount : 0,
        kind,
        paymentMethod: includesMoney ? paymentMethod : "OFFLINE",
        type: "ONE_TIME",
        mode: donationMode,
        phoneNumber,
        paymentReference: ref,
        itemDonations:
          includesItems && selectedItem
            ? [
                {
                  itemId: selectedItem.id,
                  itemName: selectedItem.name,
                  quantity: Number(itemQuantity) || 1,
                  condition: "GOOD",
                  deliveryMethod: "DROP_OFF",
                  donorContact: phoneNumber
                }
              ]
            : undefined,
        paymentDetails: includesMoney
          ? {
              provider: "PAYSTACK_DEMO",
              payerName,
              payerEmail,
              mobileMoneyProvider: paymentMethod === "MOBILE_MONEY" ? mobileMoneyProvider : undefined,
              offlinePledgeNote: paymentMethod === "OFFLINE" ? "I will complete this payment with the BoaMe field team." : undefined
            }
          : undefined,
        splitPayments:
          donationMode === "SPLIT" && includesMoney
            ? [
                { label: "Mobile money part", amount: splitAmount, paymentMethod: "MOBILE_MONEY", phoneNumber },
                { label: "Card part", amount: numericAmount - splitAmount, paymentMethod: "CARD" }
              ]
            : undefined,
        groupDonation:
          donationMode === "GROUP"
            ? {
                groupName,
                organizerName: payerName,
                expectedMembers: 5,
                allowMemberMessages: true
              }
            : undefined
      },
      { token: "" }
    ).catch(() => {});
  }

  async function recordDonation(paystackRef: string | null) {
    try {
      await apiPost<DonationResponse>(
        "/donations/initialize",
        {
          campaignId: campaign.id,
          amount: includesMoney ? numericAmount : 0,
          kind,
          paymentMethod: includesMoney ? paymentMethod : "OFFLINE",
          type: "ONE_TIME",
          mode: donationMode,
          phoneNumber,
          paymentReference: paystackRef,
          itemDonations:
            includesItems && selectedItem
              ? [
                  {
                    itemId: selectedItem.id,
                    itemName: selectedItem.name,
                    quantity: Number(itemQuantity) || 1,
                    condition: "GOOD",
                    deliveryMethod: "DROP_OFF",
                    donorContact: phoneNumber
                  }
                ]
              : undefined,
          paymentDetails: includesMoney
            ? {
                provider: "PAYSTACK_DEMO",
                payerName,
                payerEmail,
                mobileMoneyProvider: paymentMethod === "MOBILE_MONEY" ? mobileMoneyProvider : undefined,
                offlinePledgeNote: paymentMethod === "OFFLINE" ? "I will complete this payment with the BoaMe field team." : undefined
              }
            : undefined,
          splitPayments:
            donationMode === "SPLIT" && includesMoney
              ? [
                  { label: "Mobile money part", amount: splitAmount, paymentMethod: "MOBILE_MONEY", phoneNumber },
                  { label: "Card part", amount: numericAmount - splitAmount, paymentMethod: "CARD" }
                ]
              : undefined,
          groupDonation:
            donationMode === "GROUP"
              ? {
                  groupName,
                  organizerName: payerName,
                  expectedMembers: 5,
                  allowMemberMessages: true
                }
              : undefined
        },
        { token: "" }
      );
      setReceiptRef(paystackRef);
      setLatestRaised(effectiveRaised + numericAmount);
      setCheckoutOpen(false);
      setIsComplete(true);
      setSubmitting(false);
      router.refresh();
    } catch {
      setStatus("Payment completed but could not sync with server.");
      setSubmitting(false);
    }
  }

  function resetForm() {
    setAmount("25");
    setKind(requestedItems.length ? "MONEY_AND_ITEMS" : "MONEY");
    setPaymentMethod("MOBILE_MONEY");
    setDonationMode("INDIVIDUAL");
    setPhoneNumber("+233241234567");
    setPayerName("");
    setPayerEmail("");
    setMobileMoneyProvider("MTN");
    setGroupName("");
    setSelectedItemId(requestedItems[0]?.id ?? "");
    setItemQuantity("1");
    setStatus(null);
    setCheckoutOpen(false);
    setIsComplete(false);
    setReceiptRef(null);
  }

  if (isComplete) {
    return (
      <aside className="surface sticky top-24 h-fit rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="flex flex-col items-center p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="mt-4 text-xl font-black text-boame-ink">Donation Successful!</h3>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for supporting <span className="font-bold">{campaign.title}</span>.
          </p>
          {receiptRef && (
            <p className="mt-3 rounded-lg bg-gray-50 px-4 py-2 text-xs font-mono text-gray-500">
              Ref: {receiptRef}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            A receipt will be sent to {payerEmail}.
          </p>
          <Button onClick={resetForm} className="mt-6 w-full gap-2 h-12 text-base">
            <HeartHandshake size={20} />
            Make another donation
          </Button>
        </div>
      </aside>
    );
  }

  if (checkoutOpen) {
    return (
      <>
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4" onClick={closeCheckout}>
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 p-6">
              <h3 className="text-lg font-black text-boame-ink">Complete your donation</h3>
              <button onClick={closeCheckout} className="rounded-full p-1 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div className="rounded-xl bg-boame-soft p-4">
                <p className="text-sm font-bold text-gray-700">Campaign</p>
                <p className="mt-1 text-base font-black text-boame-ink">{campaign.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-xs font-bold text-gray-500">Amount</p>
                  <p className="mt-1 text-lg font-black text-boame-deep">{formatGhs(numericAmount)}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-xs font-bold text-gray-500">Payment method</p>
                  <p className="mt-1 text-sm font-bold text-boame-ink">{paymentMethod.replace("_", " ")}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs font-bold text-gray-500">Donor</p>
                <p className="mt-1 text-sm font-bold text-boame-ink">{payerName || "Anonymous"}</p>
                <p className="text-xs text-gray-500">{payerEmail || "No email provided"}</p>
              </div>

              {includesItems && selectedItem && (
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-xs font-bold text-gray-500">Items</p>
                  <p className="mt-1 text-sm font-bold text-boame-ink">{itemQuantity} × {selectedItem.name}</p>
                </div>
              )}
            </div>
            <div className="p-6 pt-0">
              {status ? <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{status}</p> : null}
              <Button onClick={processPayment} disabled={isSubmitting} className="w-full gap-2 h-12 text-base">
                <HeartHandshake size={20} />
                {isSubmitting ? "Processing..." : isOnlinePayment ? `Pay ${formatGhs(numericAmount)} with Paystack` : "Confirm pledge"}
              </Button>
              <Button variant="secondary" onClick={closeCheckout} disabled={isSubmitting} className="mt-3 w-full gap-2 h-12 text-base">
                Cancel
              </Button>
            </div>
          </div>
        </div>
        <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      </>
    );
  }

  return (
    <aside className="surface sticky top-24 h-fit rounded-2xl border border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-100 p-6">
        <h3 className="text-lg font-black text-boame-ink">Campaign Progress</h3>
        <div className="mt-4">
          <ProgressBar raised={effectiveRaised} goal={campaign.goalAmount} />
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-black text-boame-deep">{formatGhs(effectiveRaised)}</p>
              <p className="mt-1 text-sm text-gray-500">raised of {formatGhs(campaign.goalAmount)} goal</p>
            </div>
            <div className="rounded-full bg-boame-soft px-4 py-2">
              <p className="text-xl font-black text-boame-deep">{progressPercent(effectiveRaised, campaign.goalAmount)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-100 p-6">
        <label className="mb-2 block text-sm font-bold text-gray-700">Quick amount</label>
        <div className="grid grid-cols-3 gap-2">
          {[10, 25, 50].map((value) => (
            <button 
              key={value} 
              onClick={() => setAmount(String(value))} 
              className="focus-ring h-12 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold transition-all hover:border-boame-green hover:bg-boame-soft"
            >
              ₵{value}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-6">
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">Donation amount</label>
          <input 
            value={amount} 
            onChange={(event) => setAmount(event.target.value)} 
            className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-base font-semibold" 
            type="number" 
            min={campaign.minimumDonation} 
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-gray-700">Donation type</label>
          <select 
            value={kind} 
            onChange={(event) => setKind(event.target.value as DonationKind)} 
            className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4"
          >
            <option value="MONEY">Money only</option>
            {requestedItems.length ? <option value="ITEMS">Requested items only</option> : null}
            {requestedItems.length ? <option value="MONEY_AND_ITEMS">Money and requested items</option> : null}
          </select>
        </div>

        {includesMoney && (
          <>
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">Payment method</label>
              <select 
                value={paymentMethod} 
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} 
                className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4"
              >
                <option value="MOBILE_MONEY">Mobile money</option>
                <option value="CARD">Card (Paystack)</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
                <option value="OFFLINE">Offline pledge</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">Donation mode</label>
              <select 
                value={donationMode} 
                onChange={(event) => setDonationMode(event.target.value as DonationMode)} 
                className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4"
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="GROUP">Group donation</option>
                <option value="SPLIT">Split payment</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">Your name</label>
              <input 
                value={payerName} 
                onChange={(event) => setPayerName(event.target.value)} 
                className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4" 
                placeholder="Your name" 
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">Email address</label>
              <input 
                value={payerEmail} 
                onChange={(event) => setPayerEmail(event.target.value)} 
                className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4" 
                placeholder="Your email" 
                type="email" 
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">Phone number</label>
              <input 
                value={phoneNumber} 
                onChange={(event) => setPhoneNumber(event.target.value)} 
                className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4" 
                placeholder="Phone number" 
              />
            </div>

            {paymentMethod === "MOBILE_MONEY" && (
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Mobile money provider</label>
                <select 
                  value={mobileMoneyProvider} 
                  onChange={(event) => setMobileMoneyProvider(event.target.value as "MTN" | "VODAFONE" | "AIRTELTIGO")} 
                  className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4"
                >
                  <option value="MTN">MTN MoMo</option>
                  <option value="VODAFONE">Telecel/Vodafone Cash</option>
                  <option value="AIRTELTIGO">AirtelTigo Money</option>
                </select>
              </div>
            )}

            {donationMode === "GROUP" && (
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">Group name</label>
                <input 
                  value={groupName} 
                  onChange={(event) => setGroupName(event.target.value)} 
                  className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4" 
                  placeholder="Group name" 
                />
              </div>
            )}
          </>
        )}

        {includesItems && selectedItem && (
          <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
            <label className="mb-2 block text-sm font-bold text-gray-700">Requested item</label>
            <select 
              value={selectedItemId} 
              onChange={(event) => setSelectedItemId(event.target.value)} 
              className="focus-ring mb-3 h-12 w-full rounded-xl border-2 border-gray-200 px-4"
            >
              {requestedItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <input 
              value={itemQuantity} 
              onChange={(event) => setItemQuantity(event.target.value)} 
              className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4" 
              placeholder={`Quantity (${selectedItem.unit})`} 
              type="number" 
              min={1} 
            />
          </div>
        )}
      </div>

      <div className="p-6 pt-0">
        <div className="rounded-xl bg-boame-soft p-4">
          <p className="text-sm font-bold text-gray-700">Donation summary</p>
          <p className="mt-2 text-base font-black text-boame-deep">{summary}</p>
        </div>

        {status ? <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{status}</p> : null}

        <Button onClick={openCheckout} disabled={isSubmitting} className="mt-4 w-full gap-2 h-12 text-base">
          <HeartHandshake size={20} />
          {isSubmitting ? "Processing..." : "Donate now"}
        </Button>
        <Button variant="secondary" onClick={() => {
          const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
          const url = `${base}/campaigns/${campaign.slug}`;
          navigator.clipboard.writeText(url);
          setStatus(url);
        }} className="mt-3 w-full gap-2 h-12 text-base">
          <Share2 size={20} />
          Copy campaign link
        </Button>
      </div>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
    </aside>
  );
}
