# SaaSFlow Mobile Companion (Expo Go Stretch)
> Fulfills Section 1, 15, and 19 Stretch Goal: "Optional two-screen Expo Go companion metrics app"

---

## 📱 Features

1. **Screen 1: Tenants & Quotas**
   - Displays real-time tenant quotas directly on an iOS or Android device.
   - Shows active plan badges, monthly usage counts, and switches to critical red when usage exceeds 90%.

2. **Screen 2: Live Telemetry Stream**
   - Displays simulated gateway dispatches (HTTP status 200 / 401 / 429) and request latencies in real time.

---

## 🚀 How to Run with Expo Go

1. Make sure the SaaSFlow server is running:
   ```bash
   cd ../server
   node src/server.js
   ```
2. In `mobile/App.js`, update `API_HOST` with your local Wi-Fi IP (e.g. `http://192.168.1.100:5000/api`).
3. Start the Expo bundler:
   ```bash
   npx expo start
   ```
4. Scan the generated QR code using the **Expo Go** app on your physical iPhone or Android phone!
