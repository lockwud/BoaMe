# BoaMe

BoaMe is a Ghanaian micro-donation platform with a Next.js management portal, Express API, Prisma/PostgreSQL backend, shared TypeScript types, and an Expo React Native mobile app scaffold.

## Apps

- `apps/web`: Next.js 14 portal for donors, beneficiaries, and admins.
- `apps/api`: Express API shared by web and mobile clients.
- `apps/mobile`: Expo React Native mobile application scaffold.
- `packages/shared-types`: Shared TypeScript domain contracts.
- `packages/ui`: Shared design tokens.

## Local Setup

```bash
pnpm install
pnpm dev
```

The API expects a PostgreSQL database URL in `apps/api/.env`. See `apps/api/.env.example` and `apps/web/.env.example`.

## Current Slice

This repository currently contains the first implementation slice: monorepo setup, API route structure, Prisma schema, seed data, shared types, a polished public web experience, dashboard placeholders, and an Expo React Native mobile app scaffold.

## Documentation

- [System Documentation](docs/SYSTEM_DOCUMENTATION.md)

## Mobile App

The mobile app uses Expo React Native so Android can run from Ubuntu, while iOS builds can be produced later through EAS cloud builds.

```bash
cd apps/mobile
pnpm install
pnpm android
```

For iOS without a Mac:

```bash
cd apps/mobile
npx eas build --platform ios
```
