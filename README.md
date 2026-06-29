# OrderEasy

**The restaurant growth operating system** — not just a QR menu.

OrderEasy is a multi-tenant B2B SaaS platform that helps restaurants increase profit, reduce manual work, speed up service, and modernize operations.

## Features

- **Smart QR Ordering** — Mobile-first digital menu with customization and real-time order placement
- **Kitchen Display System** — Live order queue with status management
- **AI Upselling Engine** — Intelligent combo recommendations to increase AOV
- **Analytics Dashboard** — Revenue tracking, peak hours, best sellers, low performers
- **Billing Engine** — Automatic bill generation with tax calculation
- **Multi-tenant Architecture** — Each restaurant gets isolated system at `/{slug}/order`

## Backend: Firebase or SQLite

OrderEasy supports **two backends** — switch automatically based on your `.env`:

| Backend | When | Best for |
|---------|------|----------|
| **Firebase Firestore** | `FIREBASE_*` env vars set | Production, real-time kitchen sync |
| **SQLite (Prisma)** | No Firebase credentials | Local dev, offline demo |

### Enable Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database**
3. Generate a **service account key** (Project Settings → Service Accounts)
4. Copy `.env.example` → `.env` and fill in credentials
5. Seed demo data:

```bash
npm run firebase:seed
```

The kitchen display automatically uses **Firestore real-time listeners** when Firebase client config is present — orders appear instantly without polling.

### Local demo (no Firebase)

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```


## Demo URLs

| Page | URL |
|------|-----|
| Landing | `/` |
| Customer Ordering | `/bella-vista/order?table=5` |
| Dashboard | `/dashboard/bella-vista` |
| Kitchen Display | `/dashboard/bella-vista/kitchen` |
| Analytics | `/dashboard/bella-vista/analytics` |

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **Framer Motion**
- **Prisma + SQLite**
- **Recharts**
- **Zustand**
- **dnd-kit**

## Architecture

```
ordereasy.com/{restaurant-slug}/order?table=N   → Customer ordering
ordereasy.com/dashboard/{restaurant-slug}        → Restaurant dashboard
ordereasy.com/api/restaurants/{slug}/...         → REST API
```

## License

Private — All rights reserved.
