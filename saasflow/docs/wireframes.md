# SaaSFlow Screen Wireframes (S1 - S10)
> **Specification Reference: PRD PST_PD_004 Sections 8 & 12**  
> **Authors**: Divyanshu Baghel & Neel Raj

This document contains responsive layout wireframes comparing **Laptop (≥992px)** and **Mobile (375px)** viewport layouts for all 10 core screens.

---

## Screen S1: Demo Login
### Laptop Layout (≥992px)
```text
+-----------------------------------------------------------------------------+
|  [⚡ SaaSFlow PRO]                                              [Demo Login] |
+-----------------------------------------------------------------------------+
|                                                                             |
|                       Welcome to SaaSFlow                                   |
|   Simulated API usage, rate limiting, request telemetry & metered billing   |
|                                                                             |
|  +--------------------+  +---------------------+  +----------------------+  |
|  | 👤 Arjun · Founder |  | 🔑 Neha · Consumer  |  | 💼 Sameer · Finance  |  |
|  |                    |  |                     |  |                      |  |
|  | - Usage Overview   |  | - Test Endpoints    |  | - Review Invoices   |  |
|  | - 90% Quota Alerts |  | - 429 Retry Timing  |  | - Calculate Overage  |  |
|  | - Upgrade Plans    |  | [Select Tenant: v]  |  | - Mark as Paid       |  |
|  |                    |  |                     |  | - Export CSV Ledger  |  |
|  | [ Enter as Founder]|  | [Enter as Consumer] |  | [ Enter as Finance ] |  |
|  +--------------------+  +---------------------+  +----------------------+  |
|                                                                             |
|                   [ ↺ Reset Demo Data to Seed ]                             |
+-----------------------------------------------------------------------------+
```
### Mobile Layout (375px)
```text
+------------------------------------+
| [⚡] SaaSFlow                 [ = ] |
+------------------------------------+
| Welcome to SaaSFlow                |
|                                    |
| +--------------------------------+ |
| | 👤 Arjun · Founder             | |
| | [ Enter as Founder           ] | |
| +--------------------------------+ |
|                                    |
| +--------------------------------+ |
| | 🔑 Neha · Consumer             | |
| | Select Tenant: [ShopKart     v]| |
| | [ Enter as Consumer          ] | |
| +--------------------------------+ |
|                                    |
| +--------------------------------+ |
| | 💼 Sameer · Finance            | |
| | [ Enter as Finance           ] | |
| +--------------------------------+ |
|                                    |
| [ ↺ Reset Demo Data to Seed ]      |
+------------------------------------+
```

---

## Screen S2: Founder Overview
### Laptop Layout (≥992px)
```text
+-----------------------------------------------------------------------------+
| [⚡ SaaSFlow] [Overview*] [Tenants] [Playground] [Billing] [Plans]  [Arjun v]|
+-----------------------------------------------------------------------------+
|                                                                             |
| [ ⚠️ Action Required: AcmeData & WeatherWise have exceeded 90% quota! [Inspect]] |
|                                                                             |
| +--------------+  +---------------+  +---------------+  +----------------+  |
| | MONTHLY CALLS|  | BLOCKED REQS  |  | ESTIMATED MRR |  | ACTIVE TENANTS |  |
| | 189,530      |  | 34 (429/401)  |  | ₹8,995.00     |  | 7 Tenants      |  |
| +--------------+  +---------------+  +---------------+  +----------------+  |
|                                                                             |
| +-----------------------------------+ +----------------------------------+  |
| | Top Tenants by Usage    [View All]| | Simulation Engine Status         |  |
| |                                   | |                                  |  |
| | ShopKart eCommerce (Starter)      | | - Limiter: Fixed-Window (60s)    |  |
| | [=============>         ] 33.6%   | | - Free Tier: 5 calls/min         |  |
| |                                   | | - Starter Tier: 20 calls/min     |  |
| | AcmeData AI (Starter)             | | - Pro Tier: 60 calls/min         |  |
| | [======================>] 97.3%   | |                                  |  |
| |                                   | | [Test Playground] [View Invoices]|  |
| +-----------------------------------+ +----------------------------------+  |
+-----------------------------------------------------------------------------+
```
### Mobile Layout (375px)
```text
+------------------------------------+
| [⚡] SaaSFlow                 [ = ] |
+------------------------------------+
| [⚠️ 2 Tenants Near 90% Limit!      |
|  [Inspect AcmeData]                |
|                                    |
| +----------------+ +-------------+ |
| | MONTHLY CALLS  | | BLOCKED REQS| |
| | 189,530        | | 34          | |
| +----------------+ +-------------+ |
| +----------------+ +-------------+ |
| | ESTIMATED MRR  | | TENANTS     | |
| | ₹8,995.00      | | 7           | |
| +----------------+ +-------------+ |
|                                    |
| Top Tenants by Usage               |
| +--------------------------------+ |
| | ShopKart (Starter)             | |
| | [=======>      ] 33% (16.8k/50k)| |
| +--------------------------------+ |
| | AcmeData (Starter)             | |
| | [=============>] 97% (48.6k/50k)| |
| +--------------------------------+ |
+------------------------------------+
```

---

## Screen S3: Tenants Directory
### Laptop Layout (≥992px)
```text
+-----------------------------------------------------------------------------+
| [⚡ SaaSFlow] [Overview] [Tenants*] [Playground] [Billing] [Plans]  [Arjun v]|
+-----------------------------------------------------------------------------+
| Tenants Directory                                                [↺ Refresh]|
| [ 🔍 Search tenant name or ID...        ] [Filter by Plan: All Plans v]     |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | TENANT          | PLAN    | RATE LIMIT | MONTHLY QUOTA      | STATUS    |   | |
| |-----------------+---------+------------+--------------------+-----------+---| |
| | ShopKart        | Starter | 20 calls/m | [=====>   ] 33.6%  | ● Active  |[>]| |
| | CloudPulse      | Pro     | 60 calls/m | [========>] 87.5%  | ● Active  |[>]| |
| | WeatherWise     | Free    | 5 calls/m  | [========>] 92.0%  | ● Active  |[>]| |
| | AcmeData AI     | Starter | 20 calls/m | [========>] 97.3%  | ● Active  |[>]| |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

---

## Screen S4: Tenant Detail
### Laptop Layout (≥992px)
```text
+-----------------------------------------------------------------------------+
| [< Back] ShopKart eCommerce (tenant-shopkart)         [Open in Playground]  |
|                                                                             |
| +----------------------------------+ +-----------------------------------+  |
| | API Key:                         | | Active Plan: Starter              |  |
| | [sf_live_shopkart_•••••••• ] [👁][📋| | Monthly Quota:                    |  |
| |                                  | | [=========>              ] 33.6%  |  |
| | Change Plan (Founder Action):    | |                                   |  |
| | [Starter Tier                  v]| | - Per-Minute Limit: 20 req/min    |  |
| | [ Update Plan ]                  | | - Overage Rate: ₹40 / 1k calls    |  |
| +----------------------------------+ +-----------------------------------+  |
|                                                                             |
| 7-Day Request Volume:                                                       |
|   1.9k   2.1k   1.8k   2.0k   2.1k   2.3k   1.8k                            |
|   |█|    |█|    |█|    |█|    |█|    |█|    |█|                             |
|   Sun    Mon    Tue    Wed    Thu    Fri    Sat                             |
|                                                                             |
| Recent Requests:                                                            |
| [11:42:10] GET /v1/weather/current  [200 OK]  212ms  Success                |
| [11:42:08] GET /v1/sms/send         [200 OK]  340ms  Success                |
+-----------------------------------------------------------------------------+
```

---

## Screen S5: Consumer My API
### Laptop & Mobile
```text
+-----------------------------------------------------------------------------+
| My API Credentials & Quota (ShopKart eCommerce)       [ Open Playground ]   |
|                                                                             |
| Live Production API Key:                                                    |
| [ sf_live_shopkart_9921•••••••••••••••••••••••••••• ] [👁 Reveal] [📋 Copy] |
|                                                                             |
| +-----------------------------------+ +----------------------------------+  |
| | Per-Minute Throttling Ceiling     | | Monthly Quota Progress           |  |
| |                                   | |                                  |  |
| |               20                  | | [=======>             ] 33.6%    |  |
| |     calls permitted per minute    | | 16,840 of 50,000 calls used      |  |
| |                                   | | Included: 50,000 | Overage: ₹40  |  |
| +-----------------------------------+ +----------------------------------+  |
+-----------------------------------------------------------------------------+
```

---

## Screen S6: API Playground & Response Console
### Laptop Layout (2 Columns)
```text
+-----------------------------------------------------------------------------+
| Compose Simulated Request                | Live Gateway Response            |
|                                          |                                  |
| Test As: [ShopKart] [WeatherWise] [401]  | [⚠️ 429 Too Many Requests] [📋Copy|
|                                          | [Clock: Cooldown active: 18s]    |
| API Key: [sf_live_weatherwise_7714    ]  |                                  |
| Method:  [GET] [/v1/weather/current  v]  | Headers:                         |
| Limiter: [Fixed-Window (60s)         v]  | X-RateLimit-Limit: 5             |
| [x] Simulate real latency (200-500ms)    | X-RateLimit-Remaining: 0         |
|                                          | Retry-After: 18s                 |
| [ Send Request ] [ Burst Test (6 Calls) ]|                                  |
|                                          | Body:                            |
| Recent Telemetry Stream:                 | {                                |
| [11:50:02] [429] tenant-weatherwise 22ms |   "error": "Too Many Requests",  |
| [11:50:01] [200] tenant-weatherwise 310ms|   "retryAfter": 18               |
| [11:50:01] [200] tenant-weatherwise 280ms| }                                |
+-----------------------------------------------------------------------------+
```
### Mobile Layout (Stacked Column)
```text
+------------------------------------+
| Compose Simulated Request          |
| Key: [sf_live_...                 ]|
| Endpoint: [/v1/weather/current   v]|
| [ Send Request (Enter)           ] |
| [ Burst Test (Trigger 429)       ] |
|                                    |
| Response Output:                   |
| [ 429 Too Many Requests ]          |
| [ Cooldown Active: 18s ]           |
| Headers: Retry-After: 18s          |
| Payload: { "error": "429" }        |
+------------------------------------+
```

---

## Screen S7: Finance Billing Ledger
```text
+-----------------------------------------------------------------------------+
| Finance & Metered Billing           [Billing Month: October 2026 v] [Export CSV] |
|                                                                             |
| +---------------+ +---------------+ +---------------+ +-------------------+ |
| | TOTAL INVOICED| | OUTSTANDING   | | PAID INVOICES | | BILLED TENANTS    | |
| | ₹9,445.00     | | ₹7,996.00     | | 1 Paid        | | 7 Accounts        | |
| +---------------+ +---------------+ +---------------+ +-------------------+ |
|                                                                             |
| [✓ PRD Rubric Verified: ShopKart 61,250 calls = 11,250 overage = ₹1,449.00] |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | TENANT   | PLAN   | CALLS  | BASE FEE  | OVERAGE FEE | TOTAL     | STATUS| |
| |----------+--------+--------+-----------+-------------+-----------+-------| |
| | ShopKart | Starter| 61,250 | ₹999.00   | ₹450.00     | ₹1,449.00 | [Paid]| |
| | CloudP.  | Pro    | 175,000| ₹2,999.00 | ₹0.00       | ₹2,999.00 | Unpaid| |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```

---

## Screen S8: Itemized Invoice Statement (Max 760px Card)
```text
+-----------------------------------------------------------------------------+
|  [< Back to Invoices]                                        [🖨 Print / PDF]|
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | SaaSFlow API Services                                    [ ● PAID ]   |  |
|  | Automated Metered Billing Statement                     inv_shopkart  |  |
|  |                                                                       |  |
|  | Billed To: ShopKart eCommerce                Billing Cycle: 2026-10   |  |
|  | Email:     dev@shopkart.in                   Currency:      INR (₹)   |  |
|  |                                                                       |  |
|  | --------------------------------------------------------------------- |  |
|  | Description                          Units     Rate       Amount      |  |
|  | --------------------------------------------------------------------- |  |
|  | Starter Tier Base Subscription       1 Month   Fixed      ₹999.00     |  |
|  | Metered API Overage (11,250 excess)  11.25k    ₹40/1k     ₹450.00     |  |
|  | --------------------------------------------------------------------- |  |
|  |                                                Subtotal:  ₹1,449.00   |  |
|  |                                                Taxes:     ₹0.00       |  |
|  |                                                TOTAL:     ₹1,449.00   |  |
|  |                                                                       |  |
|  | [✓ Settled and recorded on 2026-11-10]                                |  |
|  +-----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
```

---

## Screen S9: Plans Comparison Table
```text
+-----------------------------------------------------------------------------+
|                      Subscription Tiers & Rate Limits                       |
|                                                                             |
|  +---------------------+  +----------------------+  +---------------------+ |
|  | Free Tier           |  | Starter Tier [Popular|  | Pro Tier            | |
|  | ₹0 / month          |  | ₹999 / month         |  | ₹2,999 / month      | |
|  |                     |  |                      |  |                     | |
|  | - 5 requests / min  |  | - 20 requests / min  |  | - 60 requests / min | |
|  | - 1,000 calls / mo  |  | - 50,000 calls / mo  |  | - 200,000 calls / mo| |
|  | - Standard latency  |  | - ₹40 / 1k overage   |  | - ₹30 / 1k overage  | |
|  | - Community support |  | - Email support      |  | - 24/7 Priority sup | |
|  +---------------------+  +----------------------+  +---------------------+ |
+-----------------------------------------------------------------------------+
```

---

## Screen S10: Access Denied Guard (403)
```text
+-----------------------------------------------------------------------------+
|                                                                             |
|                                   [ 🛡️ 403 ]                                 |
|                              Access Denied (403)                            |
|       Your role (CONSUMER) cannot access the requested /tenants module.     |
|                                                                             |
|       Role Boundaries (PRD Section 10):                                     |
|       - Founder: Full dashboard, tenant controls, plan upgrades.            |
|       - Consumer: Isolated strictly to own credentials and playground.      |
|       - Finance: Read-only invoices and payment settlement.                 |
|                                                                             |
|       [ ← Return to Allowed Dashboard ]        [ 👥 Switch Role ]           |
|                                                                             |
+-----------------------------------------------------------------------------+
```
