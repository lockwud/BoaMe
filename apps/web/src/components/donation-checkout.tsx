"use client";

import type { CampaignSummary, DonationKind, DonationMode, PaymentMethod } from "@boame/shared-types";
import { HeartHandshake, Share2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { apiPost, getStoredToken } from "@/lib/client-api";
import { formatGhs, progressPercent } from "@/lib/utils";
import { Button } from "./button";
import { ProgressBar } from "./progress-bar";

type DonationResponse = {
  reference: string;
  authorizationUrl: string;
  donation: {
    status: string;
    campaignTitle: string;
    amount: number;
  };
};

type DonationCheckoutProps = {
  campaign: CampaignSummary;
  viewMode?: "donate" | "view";
};

export function DonationCheckout({ campaign, viewMode = "donate" }: DonationCheckoutProps) {
  const requestedItems = campaign.requestedItems ?? [];
  const [amount, setAmount] = useState("25");
  const [kind, setKind] = useState<DonationKind>(requestedItems.length ? "MONEY_AND_ITEMS" : "MONEY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");
  const [donationMode, setDonationMode] = useState<DonationMode>("INDIVIDUAL");
  const [phoneNumber, setPhoneNumber] = useState("+233241234567");
  const [payerName, setPayerName] = useState("Ama Mensah");
  const [payerEmail, setPayerEmail] = useState("ama@boame.dev");
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<"MTN" | "VODAFONE" | "AIRTELTIGO">("MTN");
  const [groupName, setGroupName] = useState("Sunday Friends Circle");
  const [selectedItemId, setSelectedItemId] = useState(requestedItems[0]?.id ?? "");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [status, setStatus] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<DonationResponse | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const selectedItem = requestedItems.find((item) => item.id === selectedItemId) ?? requestedItems[0];
  const includesMoney = kind !== "ITEMS";
  const includesItems = kind !== "MONEY";
  const numericAmount = Number(amount) || 0;
  const splitAmount = Math.max(1, Math.round(numericAmount / 2));

  const summary = useMemo(() => {
    if (kind === "ITEMS") return `${itemQuantity} ${selectedItem?.unit ?? "items"} of ${selectedItem?.name ?? "requested items"}`;
    if (kind === "MONEY_AND_ITEMS") return `${formatGhs(numericAmount)} plus ${itemQuantity} ${selectedItem?.unit ?? "items"} of ${selectedItem?.name ?? "requested items"}`;
    return `${formatGhs(numericAmount)} by ${paymentMethod.replace("_", " ").toLowerCase()}`;
  }, [itemQuantity, kind, numericAmount, paymentMethod, selectedItem]);

  async function submit() {
    setSubmitting(true);
    setStatus(null);
    setReceipt(null);

    try {
      const response = await apiPost<DonationResponse>(
        "/donations/initialize",
        {
          campaignId: campaign.id,
          amount: includesMoney ? numericAmount : 0,
          kind,
          paymentMethod: includesMoney ? paymentMethod : "OFFLINE",
          type: "ONE_TIME",
          mode: donationMode,
          phoneNumber,
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
                cardLast4: paymentMethod === "CARD" ? "4081" : undefined,
                mobileMoneyProvider: paymentMethod === "MOBILE_MONEY" ? mobileMoneyProvider : undefined,
                bankName: paymentMethod === "BANK_TRANSFER" ? "GCB Bank" : undefined,
                accountName: paymentMethod === "BANK_TRANSFER" ? payerName : undefined,
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
        { token: getStoredToken() }
      );
      setReceipt(response);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Donation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const isViewMode = viewMode === "view";

  return (
    <aside className="surface sticky top-24 h-fit rounded-2xl border border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-boame-ink">Campaign Progress</h3>
          {isViewMode && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">View Mode</span>
          )}
        </div>
        <div className="mt-4">
          <ProgressBar raised={campaign.raisedAmount} goal={campaign.goalAmount} />
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-3xl font-black text-boame-deep">{formatGhs(campaign.raisedAmount)}</p>
              <p className="mt-1 text-sm text-gray-500">raised of {formatGhs(campaign.goalAmount)} goal</p>
            </div>
            <div className="rounded-full bg-boame-soft px-4 py-2">
              <p className="text-xl font-black text-boame-deep">{progressPercent(campaign.raisedAmount, campaign.goalAmount)}%</p>
            </div>
          </div>
        </div>
      </div>

      {!isViewMode && (
        <>
          <div className="border-b border-gray-100 p-6">
            <label className="mb-2 block text-sm font-bold text-gray-700">Quick amount</label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 25, 50].map((value) => (
                <button 
                  key={value} 
                  onClick={() => setAmount(String(value))} 
                  disabled={isViewMode}
                  className="focus-ring h-12 rounded-xl border-2 border-gray-200 bg-white text-sm font-bold transition-all hover:border-boame-green hover:bg-boame-soft disabled:cursor-not-allowed disabled:opacity-50"
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
                disabled={isViewMode}
                className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 text-base font-semibold disabled:cursor-not-allowed disabled:bg-gray-50" 
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
                disabled={isViewMode}
                className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                    disabled={isViewMode}
                    className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 disabled:cursor-not-allowed disabled:bg-gray-50"
                  >
                    <option value="MOBILE_MONEY">Mobile money</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank transfer</option>
                    <option value="OFFLINE">Offline pledge</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Donation mode</label>
                  <select 
                    value={donationMode} 
                    onChange={(event) => setDonationMode(event.target.value as DonationMode)} 
                    disabled={isViewMode}
                    className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                    disabled={isViewMode}
                    className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 disabled:cursor-not-allowed disabled:bg-gray-50" 
                    placeholder="Payer name" 
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Email address</label>
                  <input 
                    value={payerEmail} 
                    onChange={(event) => setPayerEmail(event.target.value)} 
                    disabled={isViewMode}
                    className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 disabled:cursor-not-allowed disabled:bg-gray-50" 
                    placeholder="Payer email" 
                    type="email" 
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Phone number</label>
                  <input 
                    value={phoneNumber} 
                    onChange={(event) => setPhoneNumber(event.target.value)} 
                    disabled={isViewMode}
                    className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 disabled:cursor-not-allowed disabled:bg-gray-50" 
                    placeholder="MoMo number" 
                  />
                </div>

                {paymentMethod === "MOBILE_MONEY" && (
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Mobile money provider</label>
                    <select 
                      value={mobileMoneyProvider} 
                      onChange={(event) => setMobileMoneyProvider(event.target.value as "MTN" | "VODAFONE" | "AIRTELTIGO")} 
                      disabled={isViewMode}
                      className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 disabled:cursor-not-allowed disabled:bg-gray-50"
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
                      disabled={isViewMode}
                      className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 disabled:cursor-not-allowed disabled:bg-gray-50" 
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
                  disabled={isViewMode}
                  className="focus-ring mb-3 h-12 w-full rounded-xl border-2 border-gray-200 px-4 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  {requestedItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <input 
                  value={itemQuantity} 
                  onChange={(event) => setItemQuantity(event.target.value)} 
                  disabled={isViewMode}
                  className="focus-ring h-12 w-full rounded-xl border-2 border-gray-200 px-4 disabled:cursor-not-allowed disabled:bg-gray-50" 
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
            
            {receipt ? (
              <div className="mt-3 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-800">
                <p>Donation successful.</p>
                <p className="mt-1">Reference: {receipt.reference}</p>
                <Link href="/donations/history" className="mt-3 inline-block underline">View donation history</Link>
              </div>
            ) : null}

            {!isViewMode && (
              <>
                <Button onClick={submit} disabled={isSubmitting} className="mt-4 w-full gap-2 h-12 text-base">
                  <HeartHandshake size={20} />
                  {isSubmitting ? "Processing..." : "Donate now"}
                </Button>
                <Button variant="secondary" className="mt-3 w-full gap-2 h-12 text-base">
                  <Share2 size={20} />
                  Share campaign
                </Button>
              </>
            )}

            {isViewMode && (
              <div className="mt-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                <p className="text-sm font-bold text-gray-600">Sign in to make a donation</p>
                <Link href="/login" className="mt-2 inline-block text-sm font-bold text-boame-deep underline">
                  Log in or create account
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {isViewMode && (
        <div className="p-6">
          <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
            <p className="text-base font-bold text-gray-700">Ready to make a difference?</p>
            <p className="mt-2 text-sm text-gray-600">Sign in to donate and track your impact</p>
            <Link href="/login" className="mt-4 inline-block rounded-xl bg-boame-deep px-6 py-3 text-base font-bold text-white hover:bg-boame-ink">
              Sign in to donate
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}