# BoaMe System Documentation

## 1. Purpose

BoaMe is a Ghanaian micro-donation and assistance platform. It lets donors give small amounts, starting from ₵1, to verified beneficiaries and community campaigns. The system is designed around trust, transparency, mobile-first payments, and clear impact reporting.

The product has three main surfaces:

- Web management portal for public browsing, donors, beneficiaries, verifiers, and admins.
- Mobile app for fast donor-first giving through React Native/Expo.
- Express TypeScript backend with Prisma/PostgreSQL for shared business logic and data.

## 2. Repositories

### Main Monorepo

Path:

```text
/home/python/Documents/project/BoaMe
```

Contains:

```text
apps/web              Next.js web portal
apps/mobile           Expo React Native mobile app
apps/api              Early API scaffold kept in the monorepo
packages/shared-types Shared TypeScript domain contracts
packages/ui           Shared design tokens
```

### Production Backend Repository

Path:

```text
/home/python/Documents/project/BoaMe_backend
```

Remote:

```text
https://github.com/lockwud/BoaMe_backend.git
```

This is the backend that should be treated as the primary API service going forward.

## 3. High-Level Architecture

```text
Donor / Beneficiary / Admin
        |
        | Web
        v
Next.js Management Portal
        |
        | REST API
        v
BoaMe Express Backend
        |
        | Prisma ORM
        v
PostgreSQL

Donor iPhone / Android
        |
        | Expo React Native
        v
Mobile App
        |
        | REST API
        v
BoaMe Express Backend
```

The backend owns authentication, campaign data, donation records, payment verification, wallet balances, payout requests, verification status, notifications, settings, and feature flags.

## 4. Applications

### Web Portal

Path:

```text
apps/web
```

Technology:

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Lucide icons
- Static campaign data currently used for the first UI slice

Main responsibilities:

- Public landing page
- Campaign discovery
- Campaign detail and donation UI
- Auth pages
- Donor, beneficiary, and admin dashboard placeholders
- Mobile app promotion

Run:

```bash
cd /home/python/Documents/project/BoaMe
pnpm --filter @boame/web dev
```

### Mobile App

Path:

```text
apps/mobile
```

Technology:

- Expo React Native
- TypeScript
- React Navigation
- EAS-ready iOS build configuration

Main responsibilities:

- Mobile campaign browsing
- Campaign detail view
- Donation initiation UI
- Donation history
- Profile/settings surfaces

Run for development:

```bash
cd /home/python/Documents/project/BoaMe/apps/mobile
pnpm start
```

For iPhone development on Ubuntu, use Expo Go on the iPhone and scan the QR code. Ubuntu cannot run the iOS Simulator.

For iOS cloud builds:

```bash
cd /home/python/Documents/project/BoaMe/apps/mobile
npx eas build --platform ios
```

### Backend

Path:

```text
/home/python/Documents/project/BoaMe_backend
```

Technology:

- Express.js
- TypeScript
- Prisma
- PostgreSQL
- JWT authentication
- Zod validation
- Helmet, CORS, compression, rate limiting

Run:

```bash
cd /home/python/Documents/project/BoaMe_backend
cp .env.example .env
docker compose up -d
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

Health check:

```bash
curl http://localhost:5000/api/v1/health
```

## 5. User Roles

### Donor

Can:

- Register and log in
- Browse active campaigns
- Initialize donations
- Verify donation payment status
- View donation history
- Manage profile and mobile devices

### Beneficiary

Can:

- Register and submit identity verification
- Create campaigns
- Add campaign updates
- View campaign donations
- Request payouts from wallet balance

### Verifier

Can:

- Approve or reject campaigns
- Support verification workflows

### Admin

Can:

- Manage users
- Block/unblock accounts
- Review all campaigns
- Verify campaigns
- View all donations
- Approve/reject payouts
- View analytics
- Manage system settings
- Manage feature flags

## 6. Core Data Model

The Prisma schema lives at:

```text
/home/python/Documents/project/BoaMe_backend/prisma/schema.prisma
```

Important models:

- `User`: donors, beneficiaries, admins, and verifiers.
- `Campaign`: fundraising campaign owned by a beneficiary.
- `Donation`: payment attempt or completed donation.
- `CampaignDonor`: donor aggregate for a campaign.
- `CampaignUpdate`: public campaign progress updates.
- `PayoutRequest`: beneficiary request to withdraw raised funds.
- `Verification`: identity verification submissions.
- `Session`: web refresh sessions.
- `MobileSession`: mobile device/session records.
- `Notification`: in-app notification records.
- `AuditLog`: audit trail foundation.
- `SystemSetting`: configurable platform settings.
- `FeatureFlag`: feature toggles by platform.

## 7. Main System Flows

### 7.1 Registration and Login

1. User registers through web or mobile.
2. Backend hashes the password with bcrypt.
3. Donor accounts become active by default.
4. Beneficiary accounts start with verification-related status.
5. Login returns an access token and refresh token.
6. Refresh tokens are stored in `Session` or `MobileSession`.

Endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
POST /api/v1/auth/mobile/login
POST /api/v1/auth/mobile/refresh
```

### 7.2 Beneficiary Verification

1. Beneficiary submits identity data and document URLs.
2. Backend creates a `Verification` record.
3. User verification status remains pending until reviewed.
4. Admin/verifier can update verification status.

Endpoints:

```text
POST /api/v1/users/verification
GET  /api/v1/users/verification/status
PUT  /api/v1/admin/users/:id
```

### 7.3 Campaign Creation

1. Beneficiary creates a campaign.
2. Backend creates a campaign with `PENDING_APPROVAL`.
3. Admin or verifier approves the campaign.
4. Approved campaigns become `ACTIVE`.
5. Active campaigns are visible to web and mobile clients.

Endpoints:

```text
POST /api/v1/campaigns
GET  /api/v1/campaigns
GET  /api/v1/campaigns/featured
GET  /api/v1/campaigns/urgent
GET  /api/v1/campaigns/:id
POST /api/v1/campaigns/:id/approve
POST /api/v1/campaigns/:id/reject
POST /api/v1/admin/campaigns/:id/verify
```

### 7.4 Donation Flow

1. Donor chooses a campaign and donation amount.
2. Backend validates campaign status and minimum donation.
3. Backend calculates platform fee and net amount.
4. Backend creates a `Donation` with `PENDING` status.
5. Backend initializes payment through the payment service.
6. In local mock mode, payment verification succeeds automatically.
7. Verification marks donation as `COMPLETED`.
8. A transaction updates:
   - donation status
   - campaign raised amount
   - donor total donated
   - beneficiary total raised
   - beneficiary wallet balance
   - campaign donor aggregate
   - beneficiary notification

Endpoints:

```text
POST /api/v1/donations/initialize
POST /api/v1/donations/mobile/initiate
GET  /api/v1/donations/verify/:reference
GET  /api/v1/donations/history
GET  /api/v1/donations/:id
POST /api/v1/donations/:id/receipt
POST /api/v1/donations/:id/refund
```

### 7.5 Payout Flow

1. Beneficiary requests payout against a campaign.
2. Backend checks ownership and wallet balance.
3. Backend creates a `PayoutRequest`.
4. Admin approves or rejects the payout.
5. Approval decrements beneficiary wallet balance.
6. Payout status changes to `SUCCESS`.

Endpoints:

```text
POST /api/v1/payouts/request
GET  /api/v1/payouts/history
GET  /api/v1/payouts/:id
POST /api/v1/payouts/:id/approve
POST /api/v1/payouts/:id/reject
```

### 7.6 Campaign Updates

1. Beneficiary or admin adds a campaign update.
2. Public updates are visible on campaign detail pages.
3. Updates can be used for transparency and donor retention.

Endpoints:

```text
GET  /api/v1/campaigns/:id/updates
POST /api/v1/campaigns/:id/updates
```

### 7.7 Admin Analytics

Admin analytics aggregate:

- user count
- active campaign count
- donation totals
- payout totals
- mobile session stats

Endpoints:

```text
GET /api/v1/admin/analytics
GET /api/v1/admin/mobile/stats
```

## 8. API Security

The backend uses:

- JWT access tokens
- refresh token sessions
- bcrypt password hashing
- Zod request validation
- Helmet security headers
- CORS allowlist
- Express rate limiting
- Prisma ORM for SQL injection resistance
- role-based authorization middleware

Protected routes require:

```text
Authorization: Bearer <accessToken>
```

## 9. Payment Behavior

The backend currently supports a mock payment mode for local development.

Config:

```env
PAYMENT_MOCK_MODE=true
```

When mock mode is enabled:

- donation initialization returns a local verification URL
- verification marks the payment successful
- all donation-side ledger updates run normally

This lets the product flow work before real Paystack/Hubtel credentials are configured.

For production, replace the payment service internals in:

```text
/home/python/Documents/project/BoaMe_backend/src/services/payment.service.ts
```

The route and database flow should not need to change.

## 10. Local Development

### Install Monorepo

```bash
cd /home/python/Documents/project/BoaMe
pnpm install
pnpm typecheck
```

### Run Web

```bash
pnpm --filter @boame/web dev
```

### Run Mobile

```bash
cd apps/mobile
pnpm start
```

### Install Backend

```bash
cd /home/python/Documents/project/BoaMe_backend
pnpm install
cp .env.example .env
docker compose up -d
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

If Prisma Client generation fails because of a cache permission issue, use:

```bash
HOME=/tmp XDG_CACHE_HOME=/tmp/.cache pnpm prisma generate
```

## 11. Seed Accounts

The backend seed creates:

```text
admin@boame.com
donor@boame.com
beneficiary@boame.com
```

Password:

```text
Password123!
```

## 12. Environment Variables

Backend env file:

```text
/home/python/Documents/project/BoaMe_backend/.env
```

Important values:

```env
PORT=5000
API_URL=http://localhost:5000
WEB_URL=http://localhost:3000
DATABASE_URL=postgresql://boame:boame@localhost:5432/boame
JWT_SECRET=...
JWT_REFRESH_SECRET=...
PAYMENT_MOCK_MODE=true
PLATFORM_FEE_PERCENT=2.5
PLATFORM_FEE_FIXED=0.5
```

Web env file:

```text
apps/web/.env.local
```

Important value:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Mobile API URL is configured in:

```text
apps/mobile/app.json
```

## 13. Deployment Model

### Backend

Recommended:

- PostgreSQL managed database
- Node.js 20+ runtime
- run `pnpm build`
- run `pnpm prisma:deploy`
- start with `pnpm start`

### Web

Recommended:

- Vercel or any Node-compatible Next.js host
- configure `NEXT_PUBLIC_API_URL`

### Mobile

Android:

- Build with Expo/EAS or local Android tooling.

iOS:

- Ubuntu cannot run iOS Simulator or Xcode.
- Use EAS cloud builds and Apple Developer credentials.

```bash
cd apps/mobile
npx eas build --platform ios
```

## 14. Current Integration Status

Implemented:

- Monorepo structure
- Web UI first slice
- Expo React Native mobile app first slice
- Standalone production backend repo
- Backend typecheck and build
- Prisma schema and seed data
- Auth/campaign/donation/payout/admin route surfaces

Still to complete:

- Replace web/mobile mock/static campaign reads with API calls
- Add real Paystack/Hubtel provider calls and webhook signature validation
- Add file upload storage for documents/images
- Add email/SMS providers
- Add automated integration tests
- Add audit logging on sensitive actions
- Add production observability and structured logging

## 15. Recommended Next Work

1. Point web campaign pages at `/api/v1/campaigns`.
2. Point mobile campaign screens at the backend API.
3. Add login/session state to web and mobile.
4. Implement real payment provider adapter.
5. Add tests for donation verification and payout approval transactions.
6. Add deployment workflow for `/home/python/Documents/project/BoaMe_backend`.
