# SaaSFlow Usability Testing Report
> Evaluation for **PST_PD_004** by Neel Raj and Divyanshu Baghel  
> Tests conducted with 3 target users across 3 distinct personas.

---

## Test Session 1: Arjun Persona (API Business Founder)
- **Participant**: Vikram S. (Early-stage tech founder, running a location API)
- **Task 1**: Identify which tenant is nearing their monthly quota limit within 30 seconds.
  - **Result**: Success (completed in 9 seconds).
  - **Observation**: "The prominent amber alert banner at the top of the Overview immediately flagged AcmeData and WeatherWise. Clicking 'Inspect' took me straight to their 7-day usage chart."
- **Task 2**: Upgrade a tenant from Starter to Pro and verify rate-limit increase.
  - **Result**: Success. Selected Pro tier from the dropdown, clicked 'Update Plan', and noted the immediate change in the per-minute limit ceiling from 20 to 60 calls/min.
- **Feedback**:
  - *"The distinction between per-minute bursting and monthly overages is clear. I like that the upgrade is immediate without interrupting traffic."*

---

## Test Session 2: Neha Persona (API Consumer / Developer)
- **Participant**: Priya M. (Frontend engineer integrating external APIs)
- **Task 1**: Locate the tenant API key and test an endpoint in the API Playground.
  - **Result**: Success. Copied the masked key with the copy button, opened the Playground, selected `/v1/weather/current`, and clicked 'Send Request'.
- **Task 2**: Trigger an HTTP 429 rate limit and observe system feedback.
  - **Result**: Success. Clicked 'Burst Test', which returned HTTP 429 Too Many Requests.
  - **Observation**: *"Most APIs just give an empty error. SaaSFlow showed me a live countdown timer stating 'Slow down! You've used all 20 calls for this minute. Try again in 23 s.' along with the Retry-After header. That makes integration handling foolproof."*
- **Feedback**:
  - *"The Dual Limiter Sandbox tab was eye-opening. Seeing how Fixed Window can double-spend across clock boundaries compared to Token Bucket was a great architectural lesson."*

---

## Test Session 3: Sameer Persona (Finance & Accounting)
- **Participant**: Rajesh K. (Accountant handling monthly client reconciliations)
- **Task 1**: Review the October 2026 invoice for ShopKart eCommerce and verify overage charges.
  - **Result**: Success. Selected October 2026, inspected ShopKart's 61,250 calls, verified 11,250 overage calls @ ₹40/1k = ₹450.00, and verified total of ₹1,449.00.
- **Task 2**: Settle the invoice by marking it as paid and export the CSV ledger.
  - **Result**: Success. Clicked 'Mark as Paid' on the invoice detail, verified the status changed to 'Paid' with a timestamp, refreshed the browser, and confirmed the paid status remained persisted. Clicked 'Export CSV' and downloaded the file.
- **Feedback**:
  - *"Spreadsheets are prone to rounding errors. Having integer paise calculations and a direct CSV download makes monthly reconciliation painless."*

