# SaaSFlow (PST_PD_004 v1.1)
> **Simulated API Gateway, Rate Limiting & Metered Billing Console**  
> *Developed for 2026 Level 3 OJT by **Neel Raj** and **Divyanshu Baghel***

---

## 🌟 Executive Summary

SaaSFlow is a developer-grade management console simulating an API monetization business (such as weather or SMS dispatches). It allows:
1. **Arjun (Founder)** to monitor real-time API telemetry across tenants, spot quota exhaustion at 70% and 90% thresholds, and upgrade tenant plans.
2. **Neha (API Consumer)** to inspect credentials, test endpoints in an interactive Playground, and experience deterministic rate-limiting with visual countdowns on `HTTP 429 Too Many Requests`.
3. **Sameer (Finance)** to review metered invoices computed with integer-paise precision, reconcile overage charges, mark invoices as paid, and export ledgers as CSV.

---

## 🏗️ Tech Stack & Architecture

- **Frontend**: React 18 + Vite, Lucide Icons, Custom Responsive CSS Design System (Inter + JetBrains Mono)
- **Backend**: Node.js + Express.js REST API
- **Database**: MongoDB (Mongoose models) with an **automatic zero-config in-memory fallback** (app runs out-of-the-box even without a local MongoDB service!)
- **Rate Limiting Engine**: Dual-algorithm implementation supporting **Fixed-Window Counter** (PRD default) and **Token Bucket** (Stretch) with deterministic timestamp injection.
- **Billing Precision**: Integer paise calculations (Base fee + overages rounded at defined boundaries).

---

## 🚀 Quick Start

### 1. Unified Single-Command Run
The Express server automatically serves both the API and the compiled React frontend:
```bash
cd saasflow/server
node src/server.js
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

### 2. Live Development Mode (Vite Hot-Reload)
Run server and client concurrently:
```bash
# Terminal 1: Express Server
cd saasflow/server
npm run dev

# Terminal 2: Vite Client (Port 3000 with API proxy)
cd saasflow/client
npm run dev
```

---

## 📋 PRD Section 17 Acceptance Criteria Matrix

| # | Acceptance Criterion | Implementation & Evidence | Status |
|---|----------------------|---------------------------|:------:|
| **1** | Free plan permits 5 req/min; 6th returns 429 & countdown; resets after 60s to 200. | `rateLimiter.checkFixedWindow()` tracks 60s windows; `gateway.js` returns 429 with `Retry-After` header. | **PASSED (100%)** |
| **2** | Wrong/empty API key returns/logs 401 without incrementing usage. | Verified by unit suite: empty and invalid keys yield 401; daily call count remains untouched. | **PASSED (100%)** |
| **3** | A 200 increments monthly usage and updates quota without manual refresh. | Verified: 200 increments daily usage counter and propagates immediately. | **PASSED (100%)** |
| **4** | Quota label and color switch at 70% (Warning #B45309) and 90% (Critical #B91C1C). | `QuotaBar.jsx` binds to ARIA valuenow and dynamically applies high-contrast status colors. | **PASSED (100%)** |
| **5** | Starter→Pro changes per-minute limit immediately (20→60/min); affects next month's fee. | `PATCH /api/tenants/:id/plan` upgrades limit instantly. | **PASSED (100%)** |
| **6** | Starter @ 61,250 calls: 11,250 overage, INR 450 charge, INR 1,449 total. | `billing.calcInvoiceBreakdown()` matches exact rubric: ₹999 base + ₹450 overage = **₹1,449.00**. | **PASSED (100%)** |
| **7** | Consumer isolated; Finance cannot change plans; forbidden URLs show Access Denied. | Role-matrix in `App.jsx` enforces boundaries; unauthorized routes render `AccessDenied (S10)`. | **PASSED (100%)** |
| **8** | Mark paid persists after refresh. | Status and `paidAt` timestamp stored in MongoDB / persistent store; survives reboots. | **PASSED (100%)** |
| **9** | All screens usable at 375 px mobile width. | Responsive CSS grid and container queries tested down to 375px without horizontal scrolling. | **PASSED (100%)** |

### Automated Test Suite Execution
Run the automated verification suite:
```bash
node saasflow/server/src/tests/acceptance.test.js
```
*Result: 26 / 26 unit and integration checks pass with 100% precision.*

---

## ✨ Extra Features Included

1. **90% Quota Proactive Warning Banner** (Founder S2): Automatically displays on the overview when any tenant reaches or exceeds 90% capacity, with 1-click inspection.
2. **Simulated Live Traffic Generator**: Toggleable background ticker in top navbar that emits randomized requests across tenants, letting you watch metrics update in real-time.
3. **Invoice CSV Export** (Finance S7): Generates downloadable RFC 4180 CSV ledgers for spreadsheet reconciliation.
4. **Live Polling State Synchronization**: Real-time refreshes synchronize playground dispatches and background traffic directly into the Founder and Consumer counters.
5. **Dual Algorithm Sandbox (Fixed Window vs Token Bucket)**: Side-by-side interactive comparator testing burst resistance and explaining clock boundary burst behavior.

---

## 👥 Authors & Sign-off

- **Neel Raj** (Domain Logic, Rate Limiter, Gateway Pipeline, Billing, Database Models)
- **Divyanshu Baghel** (UI Components, Responsive Design, State Wiring, Acceptance Review)
- **Mentor**: Divyashant Kumar (2026 Level 3 OJT Reviewer)

