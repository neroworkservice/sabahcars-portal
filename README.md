# SabahCar Portal 🚗

A multi-role car rental management system built for Sabah, Malaysia.
Handles the full business operations — from customer inquiry to supplier payout.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)

## Overview

SabahCar Portal is a SaaS platform designed for car rental companies in Sabah.
It streamlines operations across 6 user roles — from sales inquiry management
to runner dispatch and supplier payouts.

## Features

- 🔐 **Role-based Authentication** — 6 roles: Admin, Sales, Agent, Supplier, Runner, Customer
- 📋 **Lead Management** — Customer inquiry to sales pipeline
- 💰 **Pricing Engine** — Auto-calculate rates, discounts, holiday uplift & SST *(coming soon)*
- 📅 **Booking System** — Full booking lifecycle management *(coming soon)*
- 💳 **Payment Integration** — HitPay FPX & card payments *(coming soon)*
- 🚗 **Runner Operations** — Task dispatch with photo proof *(coming soon)*
- 🏢 **Supplier Portal** — Fleet management & payout statements *(coming soon)*
- 📊 **Reports & Analytics** — Revenue, conversion & SLA tracking *(coming soon)*

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## User Roles

| Role | Access |
|------|--------|
| Admin | Full system access — users, bookings, reports, settings |
| Sales | Leads, quotes, bookings, customers |
| Agent | Submit leads, track commission |
| Supplier | Fleet availability, payout statements |
| Runner | Task assignments, photo uploads |
| Customer | Submit inquiry, track bookings, payments |

## Project Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Auth System & Role Dashboards | ✅ Complete |
| Phase 2 | Leads & Customer Management | ✅ Complete |
| Phase 3 | Booking & Pricing Engine | 🚧 In Progress |
| Phase 4 | Payment & Inventory | ⏳ Planned |
| Phase 5 | Runner Operations | ⏳ Planned |
| Phase 6 | Supplier & Finance | ⏳ Planned |
| Phase 7 | WhatsApp Notifications & Reports | ⏳ Planned |

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Environment Variables

Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Installation
```bash
git clone https://github.com/neroworkservice/sabahcars-portal.git
cd sabahcars-portal
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deployed on Vercel. Push to `master` branch triggers auto-deployment.
```bash
git add .
git commit -m "your message"
git push
```

## License

Private — All rights reserved.
