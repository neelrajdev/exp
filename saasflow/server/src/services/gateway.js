/**
 * SaaSFlow - Gateway Pipeline Service
 * Implements:
 * 1. API key authentication (401 on invalid/empty)
 * 2. Monthly quota & per-minute rate limit checks (429)
 * 3. Daily usage increment & response delivery (200)
 * 4. Request telemetry logging (capped at 500)
 */

import { dataStore } from '../dataStore.js';
import { rateLimiter } from './rateLimiter.js';

function generateSampleEndpointData(endpoint) {
  if (endpoint.includes('weather')) {
    return {
      location: 'Bengaluru, IN',
      temperatureC: 24.5,
      humidity: '62%',
      condition: 'Partly Cloudy',
      forecast: 'Clear evening expected'
    };
  }
  if (endpoint.includes('sms')) {
    return {
      messageId: `msg_${Math.random().toString(36).substring(2, 10)}`,
      recipient: '+91 98765 43210',
      status: 'DELIVERED',
      parts: 1
    };
  }
  return {
    service: 'SaaSFlow Simulated API',
    uptime: '99.98%',
    echo: endpoint
  };
}

export const gateway = {
  async handleRequest({ apiKey, endpoint = '/v1/weather/current', now = Date.now(), algorithm = 'fixed-window', simulateLatency = true }) {
    const startTime = Date.now();
    const cleanKey = (apiKey || '').trim();
    const todayStr = new Date(now).toISOString().slice(0, 10);
    const currentMonth = todayStr.slice(0, 7);

    // 1. Validate API Key
    if (!cleanKey) {
      const latencyMs = simulateLatency ? Math.floor(Math.random() * 50 + 20) : 5;
      const errorLog = {
        id: `req_${Math.random().toString(36).substring(2, 9)}`,
        tenantId: 'unauthenticated',
        endpoint,
        status: 401,
        latencyMs,
        message: 'Missing API key. Please supply an authorization key.',
        algorithm,
        timestamp: now,
        errorReason: 'MISSING_API_KEY'
      };
      await dataStore.logRequest(errorLog);
      return {
        status: 401,
        statusText: 'Unauthorized',
        headers: {
          'Content-Type': 'application/json',
          'X-SaaSFlow-Gateway': 'Simulation-v1.1'
        },
        body: {
          error: 'Unauthorized',
          code: 401,
          message: 'Missing API key. Please supply an authorization key in the header or input.'
        },
        log: errorLog
      };
    }

    const tenant = await dataStore.getTenantByApiKey(cleanKey);
    if (!tenant) {
      const latencyMs = simulateLatency ? Math.floor(Math.random() * 80 + 30) : 5;
      const errorLog = {
        id: `req_${Math.random().toString(36).substring(2, 9)}`,
        tenantId: 'unknown',
        endpoint,
        status: 401,
        latencyMs,
        message: 'Invalid API key provided.',
        algorithm,
        timestamp: now,
        errorReason: 'INVALID_API_KEY'
      };
      await dataStore.logRequest(errorLog);
      return {
        status: 401,
        statusText: 'Unauthorized',
        headers: {
          'Content-Type': 'application/json',
          'X-SaaSFlow-Gateway': 'Simulation-v1.1'
        },
        body: {
          error: 'Unauthorized',
          code: 401,
          message: 'Invalid API key. No registered tenant matches this credential.'
        },
        log: errorLog
      };
    }

    const plan = (await dataStore.getPlanById(tenant.planId)) || {
      id: 'free',
      name: 'Free',
      rateLimitPerMin: 5,
      monthlyLimit: 1000
    };

    // 2. Check Monthly Quota
    const monthlyCalls = await dataStore.getTenantMonthCalls(tenant.id, currentMonth);
    if (monthlyCalls >= plan.monthlyLimit) {
      const latencyMs = simulateLatency ? Math.floor(Math.random() * 60 + 20) : 5;
      const errorLog = {
        id: `req_${Math.random().toString(36).substring(2, 9)}`,
        tenantId: tenant.id,
        endpoint,
        status: 429,
        latencyMs,
        message: `Monthly quota exhausted (${monthlyCalls.toLocaleString()} of ${plan.monthlyLimit.toLocaleString()}).`,
        algorithm,
        timestamp: now,
        errorReason: 'MONTHLY_QUOTA_EXHAUSTED'
      };
      await dataStore.logRequest(errorLog);
      return {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(plan.rateLimitPerMin),
          'X-RateLimit-Remaining': '0',
          'X-Quota-Monthly-Limit': String(plan.monthlyLimit),
          'X-Quota-Monthly-Used': String(monthlyCalls),
          'Retry-After': '86400'
        },
        body: {
          error: 'Too Many Requests',
          code: 429,
          type: 'monthly_quota_exceeded',
          message: `Monthly quota exhausted (${monthlyCalls.toLocaleString()} of ${plan.monthlyLimit.toLocaleString()} calls used). Upgrade your plan or wait for next calendar month.`,
          tenant: tenant.name,
          plan: plan.name,
          monthlyLimit: plan.monthlyLimit,
          monthlyUsed: monthlyCalls
        },
        log: errorLog
      };
    }

    // 3. Check Per-Minute Rate Limit
    const rateCheck = rateLimiter.check(tenant.id, plan.rateLimitPerMin, now, algorithm);
    if (!rateCheck.allowed) {
      const latencyMs = simulateLatency ? Math.floor(Math.random() * 40 + 20) : 5;
      const errorMsg = `Slow down! You've used all ${plan.rateLimitPerMin} calls for this minute. Try again in ${rateCheck.retryAfter} s.`;
      const errorLog = {
        id: `req_${Math.random().toString(36).substring(2, 9)}`,
        tenantId: tenant.id,
        endpoint,
        status: 429,
        latencyMs,
        message: errorMsg,
        algorithm,
        timestamp: now,
        errorReason: 'RATE_LIMIT_EXCEEDED'
      };
      await dataStore.logRequest(errorLog);
      return {
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(plan.rateLimitPerMin),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateCheck.resetSeconds),
          'Retry-After': String(rateCheck.retryAfter)
        },
        body: {
          error: 'Too Many Requests',
          code: 429,
          type: 'rate_limit_exceeded',
          message: errorMsg,
          retryAfter: rateCheck.retryAfter,
          limit: plan.rateLimitPerMin,
          algorithm
        },
        log: errorLog
      };
    }

    // 4. Successful 200 Request
    // Simulate real gateway response time (200-500ms) if requested
    const latencyMs = simulateLatency ? Math.floor(Math.random() * 300 + 200) : 10;
    if (simulateLatency && typeof setTimeout !== 'undefined') {
      await new Promise(r => setTimeout(r, latencyMs));
    }

    // Increment daily usage only on 200
    const todayCalls = await dataStore.incrementDailyUsage(tenant.id, todayStr);
    const newMonthlyCalls = monthlyCalls + 1;

    const successLog = {
      id: `req_${Math.random().toString(36).substring(2, 9)}`,
      tenantId: tenant.id,
      endpoint,
      status: 200,
      latencyMs,
      message: 'Request authorized and processed successfully.',
      algorithm,
      timestamp: now
    };
    await dataStore.logRequest(successLog);

    return {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(plan.rateLimitPerMin),
        'X-RateLimit-Remaining': String(rateCheck.remaining),
        'X-RateLimit-Reset': String(rateCheck.resetSeconds || 60),
        'X-Quota-Monthly-Used': String(newMonthlyCalls)
      },
      body: {
        status: 200,
        success: true,
        endpoint,
        tenant: tenant.name,
        plan: plan.name,
        remainingCallsThisMinute: rateCheck.remaining,
        monthlyUsed: newMonthlyCalls,
        monthlyLimit: plan.monthlyLimit,
        data: generateSampleEndpointData(endpoint),
        timestamp: new Date(now).toISOString()
      },
      log: successLog
    };
  }
};

