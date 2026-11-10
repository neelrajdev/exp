/**
 * SaaSFlow Client API Service
 * Interacts with the Express backend REST API
 */

const API_BASE = '/api';

export const api = {
  async fetchHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    return await res.json();
  },

  async fetchPlans() {
    const res = await fetch(`${API_BASE}/plans`);
    return await res.json();
  },

  async fetchTenants(month) {
    const url = month ? `${API_BASE}/tenants?month=${month}` : `${API_BASE}/tenants`;
    const res = await fetch(url);
    return await res.json();
  },

  async fetchTenant(id, month) {
    const url = month ? `${API_BASE}/tenants/${id}?month=${month}` : `${API_BASE}/tenants/${id}`;
    const res = await fetch(url);
    return await res.json();
  },

  async updateTenantPlan(tenantId, newPlanId) {
    const res = await fetch(`${API_BASE}/tenants/${tenantId}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPlanId })
    });
    return await res.json();
  },

  async sendGatewayRequest({ apiKey, endpoint, algorithm = 'fixed-window', simulateLatency = true }) {
    const res = await fetch(`${API_BASE}/gateway/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, endpoint, algorithm, simulateLatency })
    });
    const body = await res.json();
    return {
      status: res.status,
      statusText: res.statusText,
      headers: {
        'x-ratelimit-limit': res.headers.get('x-ratelimit-limit'),
        'x-ratelimit-remaining': res.headers.get('x-ratelimit-remaining'),
        'x-ratelimit-reset': res.headers.get('x-ratelimit-reset'),
        'x-quota-monthly-used': res.headers.get('x-quota-monthly-used'),
        'retry-after': res.headers.get('retry-after')
      },
      body
    };
  },

  async fetchRequests(limit = 100, tenantId = null) {
    let url = `${API_BASE}/requests?limit=${limit}`;
    if (tenantId) url += `&tenantId=${tenantId}`;
    const res = await fetch(url);
    return await res.json();
  },

  async fetchOverview(month) {
    const url = month ? `${API_BASE}/overview?month=${month}` : `${API_BASE}/overview`;
    const res = await fetch(url);
    return await res.json();
  },

  async fetchBilling(month = '2026-10') {
    const res = await fetch(`${API_BASE}/billing?month=${month}`);
    return await res.json();
  },

  async fetchInvoice(invoiceId) {
    const res = await fetch(`${API_BASE}/billing/${invoiceId}`);
    return await res.json();
  },

  async markInvoicePaid(invoiceId) {
    const res = await fetch(`${API_BASE}/billing/${invoiceId}/pay`, { method: 'POST' });
    return await res.json();
  },

  getExportCsvUrl(month = '2026-10') {
    return `${API_BASE}/billing/export/csv?month=${month}`;
  },

  async fetchTrafficStatus() {
    const res = await fetch(`${API_BASE}/traffic/status`);
    return await res.json();
  },

  async toggleTraffic() {
    const res = await fetch(`${API_BASE}/traffic/toggle`, { method: 'POST' });
    return await res.json();
  },

  async compareLimiters({ limit = 5, burstCount = 8 }) {
    const res = await fetch(`${API_BASE}/limiter/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit, burstCount })
    });
    return await res.json();
  }
};

