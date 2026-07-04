# BoaMe System Testing Flow

## Overview
This document outlines the complete testing flow for the BoaMe platform, from beneficiary registration to admin payout approval.

## Prerequisites
- Backend server running on `http://localhost:5000`
- Database (PostgreSQL) configured and migrated with Prisma
- Frontend web app running on `http://localhost:3000`
- Mobile app (Expo) running

---

## Complete System Flow

### Phase 1: User Registration & Authentication

#### 1.1 Register New Beneficiary (Mobile App)
```
Endpoint: POST /api/v1/auth/mobile/register
Headers: Content-Type: application/json
Body: {
  "email": "beneficiary@test.com",
  "phone": "+233241234567",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "BENEFICIARY"
}

Expected Response: 201 Created
{
  "message": "Mobile device registered"
}
```

#### 1.2 Login Beneficiary
```
Endpoint: POST /api/v1/auth/mobile/login
Headers: Content-Type: application/json
Body: {
  "email": "beneficiary@test.com"
}

Expected Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "beneficiary@test.com",
    "phone": "+233241234567",
    "firstName": "John",
    "lastName": "Doe",
    "role": "BENEFICIARY",
    "status": "ACTIVE"
  }
}

Action: Store accessToken in mobile secure storage
```

#### 1.3 Register New Donor (Web App)
```
Endpoint: POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  "email": "donor@test.com",
  "phone": "+233249998877",
  "password": "SecurePass123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "DONOR"
}

Expected Response: 201 Created
{
  "message": "Registration accepted",
  "user": { ... }
}
```

#### 1.4 Login Donor
```
Endpoint: POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  "email": "donor@test.com",
  "password": "SecurePass123"
}

Expected Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "development-refresh-token",
  "user": { ... }
}

Action: Store tokens in localStorage
```

---

### Phase 2: Campaign Creation (Beneficiary)

#### 2.1 Create Campaign
```
Endpoint: POST /api/v1/campaigns
Headers: 
  Content-Type: application/json
  Authorization: Bearer {beneficiaryAccessToken}
Body: {
  "title": "Emergency Medical Support",
  "description": "Need urgent medical assistance for surgery",
  "category": "MEDICAL",
  "goalAmount": 50000,
  "location": "Accra, Ghana",
  "story": "Detailed story about the medical condition...",
  "minimumDonation": 1
}

Expected Response: 201 Created
{
  "id": "camp_123",
  "slug": "emergency-medical-support",
  "title": "Emergency Medical Support",
  "status": "DRAFT",
  "beneficiaryId": "user-123",
  ...
}

Action: Note the campaign ID for next steps
```

#### 2.2 Upload Verification Documents
```
Endpoint: POST /api/v1/users/verification
Headers: 
  Content-Type: application/json
  Authorization: Bearer {beneficiaryAccessToken}
Body: {
  "identityType": "GHANA_CARD",
  "identityNumber": "GHA-123456789-0",
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-01",
  "documents": [
    "https://storage.example.com/ghana-card-front.jpg",
    "https://storage.example.com/ghana-card-back.jpg"
  ]
}

Expected Response: 201 Created
{
  "message": "Verification submitted",
  "verification": { ... }
}
```

---

### Phase 3: Admin Campaign Verification

#### 3.1 Admin Login
```
Endpoint: POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  "email": "admin@boame.dev",
  "password": "admin123"
}

Expected Response: 200 OK with admin token
```

#### 3.2 View Pending Campaigns
```
Endpoint: GET /api/v1/admin/campaigns
Headers: Authorization: Bearer {adminAccessToken}

Expected Response: 200 OK
[
  {
    "id": "camp_123",
    "title": "Emergency Medical Support",
    "status": "PENDING_APPROVAL",
    "verificationStatus": "PENDING",
    ...
  }
]
```

#### 3.3 Verify Campaign
```
Endpoint: POST /api/v1/admin/campaigns/{campaignId}/verify
Headers: Authorization: Bearer {adminAccessToken}

Expected Response: 200 OK
{
  "message": "Campaign verified",
  "campaignId": "camp_123"
}
```

---

### Phase 4: Donation Flow

#### 4.1 Browse Campaigns (Donor)
```
Endpoint: GET /api/v1/campaigns
Headers: Authorization: Bearer {donorAccessToken}

Expected Response: 200 OK
[
  {
    "id": "camp_123",
    "title": "Emergency Medical Support",
    "status": "ACTIVE",
    "raisedAmount": 0,
    "goalAmount": 50000,
    ...
  }
]
```

#### 4.2 Initialize Donation
```
Endpoint: POST /api/v1/donations/initialize
Headers: 
  Content-Type: application/json
  Authorization: Bearer {donorAccessToken}
Body: {
  "campaignId": "camp_123",
  "amount": 100,
  "paymentMethod": "MOBILE_MONEY",
  "type": "ONE_TIME",
  "isAnonymous": false
}

Expected Response: 200 OK
{
  "reference": "BOAME-DON-123456",
  "authorizationUrl": "https://payment-provider.com/pay/...",
  "donation": {
    "id": "don_123",
    "campaignId": "camp_123",
    "amount": 100,
    "status": "PENDING",
    ...
  }
}

Action: Redirect donor to authorizationUrl for payment
```

#### 4.3 Verify Donation Payment
```
Endpoint: GET /api/v1/donations/verify/{reference}
Headers: Authorization: Bearer {donorAccessToken}

Expected Response: 200 OK
{
  "id": "don_123",
  "status": "SUCCESS",
  "amount": 100,
  ...
}
```

---

### Phase 5: Beneficiary Payout Request

#### 5.1 Request Payout
```
Endpoint: POST /api/v1/payouts/request
Headers: 
  Content-Type: application/json
  Authorization: Bearer {beneficiaryAccessToken}
Body: {
  "campaignId": "camp_123",
  "amount": 5000,
  "bankName": "GCB Bank",
  "accountNumber": "1234567890",
  "accountName": "John Doe",
  "notes": "Partial withdrawal for medical expenses"
}

Expected Response: 201 Created
{
  "message": "Payout requested",
  "payout": {
    "id": "payout_123",
    "userId": "user-123",
    "campaignId": "camp_123",
    "amount": 5000,
    "status": "PENDING",
    "createdAt": "2026-07-04T14:00:00Z"
  }
}

Action: Note the payout ID for tracking
```

#### 5.2 View Payout History
```
Endpoint: GET /api/v1/payouts/history
Headers: Authorization: Bearer {beneficiaryAccessToken}

Expected Response: 200 OK
[
  {
    "id": "payout_123",
    "campaignId": "camp_123",
    "amount": 5000,
    "status": "PENDING",
    "createdAt": "2026-07-04T14:00:00Z"
  }
]
```

---

### Phase 6: Admin Payout Approval

#### 6.1 View Pending Payouts
```
Endpoint: GET /api/v1/admin/payouts
Headers: Authorization: Bearer {adminAccessToken}
Query Params: ?status=PENDING&page=1&pageSize=10

Expected Response: 200 OK
{
  "data": [
    {
      "id": "payout_123",
      "campaignTitle": "Emergency Medical Support",
      "amount": 5000,
      "status": "PENDING",
      "destination": "GCB Bank - John Doe",
      "requestedBy": "John Doe",
      "method": "Bank transfer",
      "requestedAt": "Today, 14:00"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 1,
  "totalPages": 1
}
```

#### 6.2 View Payout Details
```
Endpoint: GET /api/v1/admin/payouts/{payoutId}
Headers: Authorization: Bearer {adminAccessToken}

Expected Response: 200 OK
{
  "id": "payout_123",
  "campaignTitle": "Emergency Medical Support",
  "amount": 5000,
  "status": "PENDING",
  "destination": "GCB Bank - John Doe",
  "requestedBy": "John Doe",
  "method": "Bank transfer",
  "requestedAt": "Today, 14:00",
  "userId": "user-123",
  "campaignId": "camp_123"
}
```

#### 6.3 Approve Payout
```
Endpoint: POST /api/v1/admin/payouts/{payoutId}/approve
Headers: 
  Content-Type: application/json
  Authorization: Bearer {adminAccessToken}
Body: {
  "amount": 5000  // Optional: custom amount, omit to use requested amount
}

Expected Response: 200 OK
{
  "message": "Payout approved",
  "payout": {
    "id": "payout_123",
    "status": "APPROVED",
    "amount": 5000,
    "approvedAt": "2026-07-04T14:30:00Z"
  }
}
```

#### 6.4 Reject Payout (Alternative)
```
Endpoint: POST /api/v1/admin/payouts/{payoutId}/reject
Headers: 
  Content-Type: application/json
  Authorization: Bearer {adminAccessToken}
Body: {}

Expected Response: 200 OK
{
  "message": "Payout rejected",
  "payout": {
    "id": "payout_123",
    "status": "REJECTED"
  }
}
```

---

### Phase 7: Financial Reports

#### 7.1 View Financial Reports (Admin)
```
Endpoint: GET /api/v1/admin/financial/reports
Headers: Authorization: Bearer {adminAccessToken}

Expected Response: 200 OK
{
  "summary": {
    "donationTotal": 100,
    "payoutTotal": 5000,
    "platformFees": 2.5,
    "netRaised": -4902.5,
    "availableForPayout": 5000,
    "donationCount": 1,
    "payoutCount": 1
  },
  "ledger": [
    {
      "id": "don_123",
      "type": "DONATION",
      "title": "Emergency Medical Support",
      "party": "Donor - don_123",
      "amount": 100,
      "fee": 2.5,
      "netAmount": 97.5,
      "status": "SUCCESS",
      "reference": "BOAME-DON-123456",
      "createdAt": "2026-07-04T14:00:00Z"
    },
    {
      "id": "payout_123",
      "type": "PAYOUT",
      "title": "Emergency Medical Support",
      "party": "Beneficiary - John Doe",
      "amount": -5000,
      "fee": 0,
      "netAmount": -5000,
      "status": "APPROVED",
      "reference": "PAYOUT-payout_123",
      "createdAt": "2026-07-04T14:00:00Z"
    }
  ],
  "activeContributors": [...]
}
```

---

## Testing Checklist

### Backend API Tests
- [ ] Health check endpoint responds
- [ ] User registration works for both DONOR and BENEFICIARY
- [ ] Login returns valid JWT tokens
- [ ] Campaign creation succeeds with valid data
- [ ] Campaign verification by admin works
- [ ] Donation initialization creates pending donation
- [ ] Donation verification updates status to SUCCESS
- [ ] Payout request creates pending payout
- [ ] Admin can view all payouts
- [ ] Admin can approve payouts
- [ ] Admin can reject payouts
- [ ] Financial reports calculate correctly
- [ ] All endpoints require proper authentication
- [ ] Invalid tokens are rejected

### Frontend Web Tests
- [ ] Login page renders and submits
- [ ] Registration page validates inputs
- [ ] Campaign listing loads from API
- [ ] Campaign detail shows real data
- [ ] Donation checkout initializes payment
- [ ] Donation history shows real donations
- [ ] Admin dashboard loads reports
- [ ] Admin payout approvals list payouts
- [ ] Admin can approve/reject from UI
- [ ] Financial reports display correctly
- [ ] Refresh buttons work (no duplicates)
- [ ] Pagination works on all tables

### Mobile App Tests
- [ ] Login screen works
- [ ] Registration screen works
- [ ] Home screen loads campaigns
- [ ] Campaign detail shows data
- [ ] Donation flow completes
- [ ] Donation history displays
- [ ] Profile screen loads
- [ ] Settings can be updated

### Integration Tests
- [ ] Full flow: Register → Create Campaign → Verify → Donate → Request Payout → Approve
- [ ] Multiple donors can donate to same campaign
- [ ] Campaign raised amount updates correctly
- [ ] Payout amount cannot exceed raised amount
- [ ] Financial ledger balances correctly
- [ ] Notifications sent on key events

---

## Database Verification

### Check Database Records
```bash
# Connect to PostgreSQL
psql -U postgres -d boame

# Verify tables exist
\dt

# Check users
SELECT id, email, role, status FROM users;

# Check campaigns
SELECT id, title, status, raised_amount, goal_amount FROM campaigns;

# Check donations
SELECT id, campaign_id, amount, status FROM donations;

# Check payouts
SELECT id, user_id, campaign_id, amount, status FROM payout_requests;

# Check ledger balance
SELECT 
  (SELECT SUM(amount) FROM donations WHERE status = 'SUCCESS') -
  (SELECT SUM(amount) FROM payout_requests WHERE status = 'APPROVED')
  AS balance;
```

---

## Common Issues & Solutions

### Issue: "Invalid credentials" on login
**Solution:** Ensure password is provided in login request body

### Issue: "Authentication required" on admin endpoints
**Solution:** Include valid Bearer token in Authorization header

### Issue: "Route not found"
**Solution:** Ensure API URL includes `/api/v1` prefix

### Issue: Database connection errors
**Solution:** 
1. Check DATABASE_URL in .env
2. Run `pnpm prisma migrate dev`
3. Run `pnpm prisma generate`

---

## Next Steps

1. Remove all mock/hardcoded data from routes
2. Implement proper database queries in all route handlers
3. Add input validation with Zod schemas
4. Implement proper error handling
5. Add request logging
6. Set up database seeding for development
7. Write automated integration tests