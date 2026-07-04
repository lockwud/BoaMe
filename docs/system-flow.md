# BoaMe System Flow

## Runtime Topology

- Web/admin portal: `apps/web`
- Real Prisma API: `/home/python/Documents/project/BoaMe_backend`
- API base URL used by web: `http://localhost:5000/api/v1`
- Swagger/OpenAPI JSON: `http://localhost:5000/api/v1/swagger.json`

Run the Prisma backend first:

```bash
cd /home/python/Documents/project/BoaMe_backend
pnpm dev
```

Run the web app:

```bash
cd /home/python/Documents/project/BoaMe
pnpm run dev
```

The root `pnpm run dev` starts the web app only. It intentionally does not start `apps/api`, because admin/mobile flows are wired to the Prisma backend in `BoaMe_backend`.

Seeded admin account:

```text
admin@boame.com / Password123!
```

## Authentication

1. Admin signs in from `/admin`.
2. Web posts to `POST /api/v1/auth/login`.
3. The backend validates the Prisma `User` record and returns a JWT access token.
4. Web stores the token in `localStorage.boame_access_token`.
5. All subsequent admin API calls include `Authorization: Bearer <token>`.

Mobile users use:

- `POST /api/v1/auth/mobile/login`
- `POST /api/v1/auth/mobile/refresh`
- `POST /api/v1/auth/mobile/logout`

## Campaign Verification Flow

1. Beneficiary creates a campaign through `POST /api/v1/campaigns`.
2. Non-admin beneficiary campaigns enter `PENDING_APPROVAL`.
3. Admin portal loads review records from `GET /api/v1/admin/campaigns`.
4. Clicking a campaign opens a full review screen using Prisma campaign data:
   - campaign description/story
   - beneficiary identity status
   - typed evidence files
   - donation trail
   - updates
   - payout requests
5. Evidence documents are loaded from `GET /api/v1/admin/campaigns/:id/documents`.
6. Admins can attach URL-backed evidence metadata with `POST /api/v1/admin/campaigns/:id/documents`.
7. Evidence downloads use `GET /api/v1/admin/campaigns/:id/documents/:documentId/download`.
8. Admin approves with `POST /api/v1/admin/campaigns/:id/verify`.
9. Backend persists `status = ACTIVE` and `isVerified = true`.
10. A notification is created for the beneficiary.

Campaign evidence is stored in Prisma with the `CampaignEvidence` model. A campaign can have many evidence records, and each record can be one of:

- `IMAGE`
- `PDF`
- `VIDEO`
- `REPORT`
- `OTHER`

Each evidence record stores name, MIME type, file size, notes, source URL, uploader, and uploaded date. Older campaigns that still use the legacy `Campaign.documents` URL array are returned by the admin API as legacy evidence items, so previous campaign data remains visible.

## Payout Approval Flow

1. Beneficiary requests payout from mobile/web using `POST /api/v1/payouts/request`.
2. Admin portal loads payout queue from `GET /api/v1/admin/payouts`.
3. Admin approves with `POST /api/v1/admin/payouts/:id/approve`.
4. Backend persists `status = SUCCESS`, sets `approvedAt`, `completedAt`, and decrements beneficiary wallet balance.
5. Admin rejects with `POST /api/v1/admin/payouts/:id/reject`.
6. Backend persists `status = FAILED`.

Because this is stored in Prisma, approved/rejected payouts do not reappear as pending after logging in again.

## Paystack Donation Flow

Mobile money and card donations use Paystack when the backend has `PAYMENT_MOCK_MODE=false`.

1. Mobile signs in with `POST /api/v1/auth/mobile/login`.
2. Mobile initializes a donation with `POST /api/v1/donations/initialize`.
3. Backend creates a pending Prisma `Donation` and calls Paystack transaction initialization.
4. Mobile opens the returned `authorizationUrl`.
5. Paystack redirects to `GET /api/v1/donations/paystack/callback?reference=<reference>`.
6. Backend verifies the transaction with Paystack.
7. Paystack can also call `POST /api/v1/webhooks/paystack`.
8. Successful settlement updates:
   - `Donation.status = COMPLETED`
   - campaign `raisedAmount`
   - donor `totalDonated`
   - beneficiary `totalRaised`
   - beneficiary `walletBalance`
   - `CampaignDonor` contributor totals
   - beneficiary notification

For local mobile testing on the same LAN:

```text
Test Callback URL: http://172.20.10.3:5000/api/v1/donations/paystack/callback
Test Webhook URL: https://<your-public-tunnel>/api/v1/webhooks/paystack
```

Paystack webhooks must be reachable from Paystack servers, so a localhost or LAN address is not enough for webhook testing. Use a tunnel such as ngrok or Cloudflare Tunnel pointing to backend port `5000`.

## Financial Reporting Flow

Admin reports load from `GET /api/v1/admin/financial/reports`.

The report includes:

- total donations
- net raised
- platform fees
- approved payouts
- available payout balance
- recent ledger rows
- active contributors
- contributor support-review status

Admin can mark contributor review status with `POST /api/v1/admin/contributors/:userId/support-review`. This supports tracking active contributors who may also need help and should be reviewed for support outreach.

## People Management Flow

1. Admin loads users from `GET /api/v1/admin/users`.
2. Clicking a user opens a full detail page inside the admin workspace.
3. Admin blocks with `POST /api/v1/admin/users/:id/block`.
4. Backend persists `status = SUSPENDED`.
5. Admin unblocks with `POST /api/v1/admin/users/:id/unblock`.
6. Backend persists `status = ACTIVE`.

## Settings Flow

Admin settings are backed by Prisma:

- `GET /api/v1/admin/feature-flags`
- `POST /api/v1/admin/feature-flags/:id`
- `GET /api/v1/admin/mobile/settings`
- `POST /api/v1/admin/mobile/settings/:id`
- `POST /api/v1/admin/change-password`

Feature flags use the `FeatureFlag` model. Mobile settings use `SystemSetting` keys prefixed with `mobile_`.

Password changes require both `oldPassword` and `password`; the backend validates the old password before saving the new hash.

## Notification Flow

- Admin loads notifications from `GET /api/v1/admin/notifications`.
- Admin marks notification read with `POST /api/v1/admin/notifications/:id/read`.
- Campaign approval creates a beneficiary notification.

## Campaign Town Map Flow

- Overview stats load from `GET /api/v1/admin/overview`.
- The response includes `townStats`, derived from real campaign locations and raised amounts in Prisma.
- The admin map uses those values for city popups and belt breakdowns.

## Swagger Testing

Open or import:

```text
http://localhost:5000/api/v1/swagger.json
```

Most admin endpoints require bearer auth. First call `POST /api/v1/auth/login`, copy `accessToken`, then use it as:

```text
Authorization: Bearer <accessToken>
```
