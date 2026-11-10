/**
 * SaaSFlow - Live Traffic Simulator Service (Extra Feature 2)
 * Simulates organic background traffic across tenants for live demo monitoring.
 */

import { dataStore } from '../dataStore.js';
import { gateway } from './gateway.js';

let intervalId = null;
let isRunning = false;
let stats = {
  totalGenerated: 0,
  successful200: 0,
  rateLimited429: 0,
  unauthorized401: 0,
  startedAt: null
};

const SAMPLE_ENDPOINTS = [
  '/v1/weather/current',
  '/v1/weather/forecast',
  '/v1/sms/send',
  '/v1/sms/status'
];

export const trafficGenerator = {
  getStatus() {
    return {
      isRunning,
      stats,
      tickRateMs: 1200
    };
  },

  async start() {
    if (isRunning) return this.getStatus();
    isRunning = true;
    stats.startedAt = new Date().toISOString();

    intervalId = setInterval(async () => {
      try {
        const tenants = await dataStore.getTenants();
        if (tenants.length === 0) return;

        // 10% chance of invalid key to demonstrate 401 telemetry
        const isTampered = Math.random() < 0.10;
        let apiKey;
        if (isTampered) {
          apiKey = 'sf_live_invalid_' + Math.random().toString(36).substring(2, 6);
        } else {
          const tenant = tenants[Math.floor(Math.random() * tenants.length)];
          apiKey = tenant.apiKey;
        }

        const endpoint = SAMPLE_ENDPOINTS[Math.floor(Math.random() * SAMPLE_ENDPOINTS.length)];
        const result = await gateway.handleRequest({
          apiKey,
          endpoint,
          now: Date.now(),
          simulateLatency: false
        });

        stats.totalGenerated++;
        if (result.status === 200) stats.successful200++;
        else if (result.status === 429) stats.rateLimited429++;
        else if (result.status === 401) stats.unauthorized401++;
      } catch (err) {
        console.error('[TrafficGenerator] Tick error:', err.message);
      }
    }, 1200);

    return this.getStatus();
  },

  stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning = false;
    return this.getStatus();
  },

  toggle() {
    return isRunning ? this.stop() : this.start();
  }
};

