/**
 * SaaSFlow - Storage Module
 * Manages localStorage persistence for tenants, plans, usage, requests, and invoices.
 * Follows PRD Section 10 state specifications.
 */

const STORAGE_KEYS = {
  SESSION: 'sf_session',
  PLANS: 'sf_plans',
  TENANTS: 'sf_tenants',
  REQUESTS: 'sf_requests',
  DAILY_USAGE: 'sf_daily_usage',
  INVOICES: 'sf_invoices'
};

export const storage = {
  keys: STORAGE_KEYS,

  /**
   * Initializes local storage from seed JSON if not already present
   */
  async init() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
        const plansRes = await fetch('data/plans.json');
        if (plansRes.ok) {
          const plans = await plansRes.json();
          localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
        }
      }

      if (!localStorage.getItem(STORAGE_KEYS.TENANTS) || !localStorage.getItem(STORAGE_KEYS.DAILY_USAGE)) {
        const usageRes = await fetch('data/usage.json');
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
            localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(usageData.tenants || []));
          }
          if (!localStorage.getItem(STORAGE_KEYS.DAILY_USAGE)) {
            localStorage.setItem(STORAGE_KEYS.DAILY_USAGE, JSON.stringify(usageData.dailyUsage || {}));
          }
        }
      }

      if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
      }

      if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify({}));
      }
    } catch (err) {
      console.warn('SaaSFlow storage init fallback (e.g. running outside HTTP server):', err);
      // Fallback in case fetch is blocked by file:// protocol
      this.initFallbackDefaults();
    }
  },

  initFallbackDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify([
        { id: "free", name: "Free", rateLimitPerMin: 5, monthlyLimit: 1000, baseFeePaise: 0, overageRatePer1kPaise: 0 },
        { id: "starter", name: "Starter", rateLimitPerMin: 20, monthlyLimit: 50000, baseFeePaise: 99900, overageRatePer1kPaise: 4000 },
        { id: "pro", name: "Pro", rateLimitPerMin: 60, monthlyLimit: 200000, baseFeePaise: 299900, overageRatePer1kPaise: 3000 }
      ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify([
        { id: "tenant-shopkart", name: "ShopKart eCommerce", apiKey: "sf_live_shopkart_9921", planId: "starter", status: "active" },
        { id: "tenant-cloudpulse", name: "CloudPulse Monitoring", apiKey: "sf_live_cloudpulse_8832", planId: "pro", status: "active" },
        { id: "tenant-weatherwise", name: "WeatherWise App", apiKey: "sf_live_weatherwise_7714", planId: "free", status: "active" },
        { id: "tenant-swiftpay", name: "SwiftPay Gateway", apiKey: "sf_live_swiftpay_6623", planId: "starter", status: "active" },
        { id: "tenant-textgrid", name: "TextGrid SMS", apiKey: "sf_live_textgrid_5541", planId: "free", status: "active" },
        { id: "tenant-acmedata", name: "AcmeData AI", apiKey: "sf_live_acmedata_3398", planId: "starter", status: "active" },
        { id: "tenant-devforge", name: "DevForge Studios", apiKey: "sf_live_devforge_4412", planId: "pro", status: "active" }
      ]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DAILY_USAGE)) {
      localStorage.setItem(STORAGE_KEYS.DAILY_USAGE, JSON.stringify({
        "tenant-shopkart": { "2026-10-31": 61250, "2026-11-10": 1820 },
        "tenant-weatherwise": { "2026-11-10": 920 },
        "tenant-swiftpay": { "2026-11-10": 34500 }
      }));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify({}));
    }
  },

  /**
   * Reset demo data - restores original seed state and clears limiter
   */
  async reset() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    await this.init();
  },

  // Session
  getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)) || null;
    } catch {
      return null;
    }
  },
  setSession(session) {
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    }
  },
  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // Plans
  getPlans() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLANS)) || [];
    } catch {
      return [];
    }
  },
  getPlanById(planId) {
    return this.getPlans().find(p => p.id === planId) || null;
  },

  // Tenants
  getTenants() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS)) || [];
    } catch {
      return [];
    }
  },
  getTenantById(tenantId) {
    return this.getTenants().find(t => t.id === tenantId) || null;
  },
  getTenantByApiKey(apiKey) {
    if (!apiKey) return null;
    return this.getTenants().find(t => t.apiKey === apiKey.trim()) || null;
  },
  updateTenantPlan(tenantId, newPlanId) {
    const tenants = this.getTenants();
    const idx = tenants.findIndex(t => t.id === tenantId);
    if (idx !== -1) {
      tenants[idx].planId = newPlanId;
      localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
      return tenants[idx];
    }
    return null;
  },

  // Daily Usage
  getDailyUsage() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_USAGE)) || {};
    } catch {
      return {};
    }
  },
  getTenantMonthlyUsage(tenantId, yearMonth) {
    const all = this.getDailyUsage();
    const tenantUsage = all[tenantId] || {};
    let total = 0;
    for (const [dateStr, count] of Object.entries(tenantUsage)) {
      if (dateStr.startsWith(yearMonth)) {
        total += Number(count) || 0;
      }
    }
    return total;
  },
  incrementDailyUsage(tenantId, dateStr = null) {
    const date = dateStr || new Date().toISOString().slice(0, 10);
    const all = this.getDailyUsage();
    if (!all[tenantId]) all[tenantId] = {};
    all[tenantId][date] = (all[tenantId][date] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.DAILY_USAGE, JSON.stringify(all));
    return all[tenantId][date];
  },

  // Requests (capped at 500 entries FIFO)
  getRequests() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS)) || [];
    } catch {
      return [];
    }
  },
  appendRequest(req) {
    const requests = this.getRequests();
    requests.unshift(req); // new requests first
    if (requests.length > 500) {
      requests.length = 500; // retain last 500 FIFO
    }
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return req;
  },

  // Invoices
  getInvoices() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES)) || {};
    } catch {
      return {};
    }
  },
  setInvoiceStatus(invoiceId, status, paidAt = null) {
    const invoices = this.getInvoices();
    if (!invoices[invoiceId]) {
      invoices[invoiceId] = {};
    }
    invoices[invoiceId].status = status;
    if (paidAt) invoices[invoiceId].paidAt = paidAt;
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return invoices[invoiceId];
  }
};

