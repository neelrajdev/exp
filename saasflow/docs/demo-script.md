# SaaSFlow 3-to-5 Minute Demo Video Script
> **Presentation Plan for PST_PD_004 OJT Project**  
> **Presenters**: Neel Raj & Divyanshu Baghel  
> **Audience**: Mentor Divyashant Kumar & Evaluation Panel

---

### Minute 0:00 - 0:45 | Introduction & Problem Statement (Neel)
- **Visual**: Show Login Screen (`http://localhost:5000`)
- **Script**:
  > *"Hello! We are Neel Raj and Divyanshu Baghel, presenting SaaSFlow. Small API businesses struggle to track customer quotas in spreadsheets, consumers face confusing 429 errors, and finance spends hours manually calculating overages. SaaSFlow solves this with a full-stack simulated API gateway, real-time rate limiting, and automated metered billing."*
- **Action**: Select **Arjun (Founder)** to enter the dashboard.

---

### Minute 0:45 - 1:45 | Journey A: Founder Dashboard & Plan Upgrade (Divyanshu)
- **Visual**: Overview (S2) & Tenant Detail (S4)
- **Script**:
  > *"Here is the Founder Overview. Within seconds, Arjun can see total monthly volume, blocked requests, and an estimated MRR. Notice the proactive amber Alert Banner at the top: AcmeData and WeatherWise have exceeded 90% quota.  
  > Let's click into ShopKart eCommerce. We see their 7-day daily volume and current Starter plan (20 calls/min). With one click, we upgrade ShopKart to the Pro tier (60 calls/min). The rate limit increases immediately!"*
- **Action**: Switch ShopKart to Pro and point to the immediate update badge.

---

### Minute 1:45 - 2:45 | Journey B: API Consumer & 429 Rate Limiting (Neel)
- **Visual**: My API (S5) & Playground (S6)
- **Script**:
  > *"Now let's switch to Neha, a developer at ShopKart. Under My API, Neha sees her live production key and real-time quota gauges.  
  > When we open the Playground, Neha can test real API calls like `/v1/weather/current`.  
  > Notice what happens when we fire a burst of calls: the gateway intercepts the excess traffic, returning `HTTP 429 Too Many Requests` with a live cooldown countdown timer: 'Slow down! Try again in 23s.' The response includes simulated standard headers like `Retry-After` and `X-RateLimit-Remaining`."*
- **Action**: Click 'Burst Test (6 Calls)', show the 429 response, countdown timer, and request log.

---

### Minute 2:45 - 3:45 | Journey C: Finance Metered Billing & Rubric Case (Divyanshu)
- **Visual**: Billing (S7) & Invoice Detail (S8)
- **Script**:
  > *"Next, let's enter as Sameer in Finance. Looking at October 2026, SaaSFlow automatically calculates metered overages with integer-paise precision.  
  > Here is our benchmark test case from the PRD rubric: ShopKart made 61,250 calls on Starter. With 50,000 calls included, that's exactly 11,250 overage calls @ ₹40 per 1,000.  
  > Base fee of ₹999.00 plus ₹450.00 overage equals exactly ₹1,449.00 total!  
  > Sameer clicks 'Mark as Paid'—this persists directly into MongoDB. We can also click 'Export CSV' to download the ledger."*
- **Action**: Show the ₹1,449.00 total, mark it paid, refresh the browser to demonstrate persistence, and click Export CSV.

---

### Minute 3:45 - 4:30 | Extra Features & Test Suite (Neel & Divyanshu)
- **Visual**: Dual Limiter Sandbox & Test Runner (`/tests`)
- **Script**:
  > *"We also built all 5 extra features:
  > 1. Proactive 90% Quota Warning Banners
  > 2. Background Live Traffic Simulator (toggleable in the navbar)
  > 3. Invoice CSV ledger export
  > 4. Real-time metrics synchronization
  > 5. An interactive Dual Limiter Sandbox comparing Fixed Window vs Token Bucket.  
  > Finally, let's open the built-in Acceptance Test Suite and run all tests. All 9 PRD criteria pass with 100% green checks!"*
- **Action**: Click 'Run All Verification Tests' and show all 9 criteria passing.

---

### Minute 4:30 - 5:00 | Conclusion & Q&A
- **Script**:
  > *"SaaSFlow delivers a complete, resilient full-stack simulation of API rate-limiting and billing. Thank you!"*

