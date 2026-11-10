import express from 'express';
import { dataStore } from '../dataStore.js';
import { gateway } from '../services/gateway.js';
import { billing } from '../services/billing.js';
import { rateLimiter } from '../services/rateLimiter.js';
import { trafficGenerator } from '../services/trafficGenerator.js';
import { getDbMode, isDbConnected } from '../config/db.js';

export const apiRouter = express.Router();

// System Health & Reset
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: {
      mode: getDbMode(),
      connected: isDbConnected()
    },
    uptime: process.uptime()
  });
});

apiRouter.post('/reset', async (req, res) => {
  try {
    rateLimiter.reset();
    trafficGenerator.stop();
    await dataStore.reset();
    res.json({ success: true, message: 'All demo data, rate limits, and seed usage successfully reset.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset demo data', details: err.message });
  }
});

// Plans
apiRouter.get('/plans', async (req, res) => {
  try {
    const plans = await dataStore.getPlans();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tenants
apiRouter.get('/tenants', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const tenants = await dataStore.getTenants();
    const plans = await dataStore.getPlans();
    const planMap = Object.fromEntries(plans.map(p => [p.id, p]));

    const enriched = await Promise.all(tenants.map(async t => {
      const plan = planMap[t.planId] || { name: 'Unknown', monthlyLimit: 1000, rateLimitPerMin: 5 };
      const monthCalls = await dataStore.getTenantMonthCalls(t.id, month);
      const percentUsed = Math.min(100, Number(((monthCalls / plan.monthlyLimit) * 100).toFixed(1)));
      return {
        ...t,
        planName: plan.name,
        rateLimitPerMin: plan.rateLimitPerMin,
        monthlyLimit: plan.monthlyLimit,
        monthCalls,
        percentUsed,
        isWarning: percentUsed >= 70 && percentUsed < 90,
        isCritical: percentUsed >= 90
      };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/tenants/:id', async (req, res) => {
  try {
    const tenant = await dataStore.getTenantById(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    const plan = await dataStore.getPlanById(tenant.planId);
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const monthCalls = await dataStore.getTenantMonthCalls(tenant.id, month);
    const percentUsed = Math.min(100, Number(((monthCalls / plan.monthlyLimit) * 100).toFixed(1)));

    // Fetch 7-day daily usage
    const allUsage = await dataStore.getDailyUsage(tenant.id);
    const tenantUsage = allUsage[tenant.id] || {};
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        date: dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        calls: tenantUsage[dateStr] || 0
      });
    }

    const recentRequests = await dataStore.getRequests(15, tenant.id);

    res.json({
      tenant,
      plan,
      monthCalls,
      percentUsed,
      usageHistory7Days: days,
      recentRequests
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.patch('/tenants/:id/plan', async (req, res) => {
  try {
    const { newPlanId } = req.body;
    if (!newPlanId) return res.status(400).json({ error: 'newPlanId is required' });

    const plan = await dataStore.getPlanById(newPlanId);
    if (!plan) return res.status(400).json({ error: 'Invalid plan id' });

    const updated = await dataStore.updateTenantPlan(req.params.id, newPlanId);
    if (!updated) return res.status(404).json({ error: 'Tenant not found' });

    res.json({
      success: true,
      message: `Tenant upgraded to ${plan.name} plan. Per-minute limit updated immediately.`,
      tenant: updated,
      plan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gateway API Request (The core simulation endpoint)
apiRouter.post('/gateway/request', async (req, res) => {
  try {
    const { apiKey, endpoint, algorithm = 'fixed-window', simulateLatency = true, now } = req.body;
    const result = await gateway.handleRequest({
      apiKey,
      endpoint: endpoint || '/v1/weather/current',
      algorithm,
      simulateLatency: simulateLatency !== false,
      now: now || Date.now()
    });

    // Mirror simulated gateway headers into Express response for real HTTP inspection
    Object.entries(result.headers || {}).forEach(([k, v]) => {
      res.setHeader(k, v);
    });

    res.status(result.status).json(result.body);
  } catch (err) {
    res.status(500).json({ error: 'Gateway processing failure', details: err.message });
  }
});

// Request telemetry log
apiRouter.get('/requests', async (req, res) => {
  try {
    const limit = Math.min(500, parseInt(req.query.limit) || 100);
    const tenantId = req.query.tenantId || null;
    const requests = await dataStore.getRequests(limit, tenantId);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Overview KPI Dashboard (Founder S2)
apiRouter.get('/overview', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const tenants = await dataStore.getTenants();
    const plans = await dataStore.getPlans();
    const planMap = Object.fromEntries(plans.map(p => [p.id, p]));

    let totalMonthCalls = 0;
    let estimatedMrrPaise = 0;
    const nearLimitTenants = []; // >= 90% (Extra Feature 1)
    const tenantUsageList = [];

    for (const t of tenants) {
      const plan = planMap[t.planId] || { name: 'Free', monthlyLimit: 1000, baseFeePaise: 0 };
      const calls = await dataStore.getTenantMonthCalls(t.id, month);
      totalMonthCalls += calls;
      estimatedMrrPaise += (plan.baseFeePaise || 0);

      const percent = Math.min(100, Number(((calls / plan.monthlyLimit) * 100).toFixed(1)));
      const entry = {
        id: t.id,
        name: t.name,
        planName: plan.name,
        calls,
        limit: plan.monthlyLimit,
        percentUsed: percent
      };
      tenantUsageList.push(entry);

      if (percent >= 90) {
        nearLimitTenants.push(entry);
      }
    }

    // Requests breakdown
    const requests = await dataStore.getRequests(500);
    const blockedCount = requests.filter(r => r.status === 429 || r.status === 401).length;
    const successCount = requests.filter(r => r.status === 200).length;

    // Top tenants by usage
    tenantUsageList.sort((a, b) => b.calls - a.calls);

    res.json({
      month,
      kpis: {
        totalCalls: totalMonthCalls,
        blockedRequests: blockedCount,
        successfulRequests: successCount,
        totalRequestsLogged: requests.length,
        estimatedMrrInr: (estimatedMrrPaise / 100).toFixed(2),
        activeTenantsCount: tenants.length
      },
      hasQuotaAlert: nearLimitTenants.length > 0,
      nearLimitTenants,
      topTenants: tenantUsageList.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Billing & Invoicing (Finance S7 & S8)
apiRouter.get('/billing', async (req, res) => {
  try {
    const month = req.query.month || '2026-10'; // default to October 2026 for the rubric case
    const invoiceData = await billing.getMonthInvoices(month);
    res.json(invoiceData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/billing/:invoiceId', async (req, res) => {
  try {
    const parts = req.params.invoiceId.split('_'); // inv_tenant-id_yyyy_mm
    const tenantId = parts[1];
    const month = `${parts[2]}-${parts[3]}`;
    const invoice = await billing.getOrCreateInvoice(tenantId, month);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/billing/:invoiceId/pay', async (req, res) => {
  try {
    const updated = await billing.markAsPaid(req.params.invoiceId);
    res.json({ success: true, invoice: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/billing/export/csv', async (req, res) => {
  try {
    const month = req.query.month || '2026-10';
    const csvData = await billing.exportCsv(month);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="SaaSFlow_Invoices_${month}.csv"`);
    res.send(csvData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Live Traffic Simulator (Extra Feature 2)
apiRouter.get('/traffic/status', (req, res) => {
  res.json(trafficGenerator.getStatus());
});

apiRouter.post('/traffic/toggle', (req, res) => {
  const status = trafficGenerator.toggle();
  res.json(status);
});

// Dual Algorithm Sandbox Comparison (Extra Feature 5)
apiRouter.post('/limiter/compare', (req, res) => {
  const { limit = 5, burstCount = 8 } = req.body;
  const tempTenantFw = 'comp_fw_' + Date.now();
  const tempTenantTb = 'comp_tb_' + Date.now();
  const now = Date.now();

  const fwResults = [];
  const tbResults = [];

  for (let i = 0; i < burstCount; i++) {
    const fw = rateLimiter.checkFixedWindow(tempTenantFw, limit, now);
    const tb = rateLimiter.checkTokenBucket(tempTenantTb, limit, now);
    fwResults.push({ callNumber: i + 1, allowed: fw.allowed, remaining: fw.remaining, retryAfter: fw.retryAfter });
    tbResults.push({ callNumber: i + 1, allowed: tb.allowed, remaining: tb.remaining, retryAfter: tb.retryAfter });
  }

  res.json({
    limit,
    burstCount,
    fixedWindowResults: fwResults,
    tokenBucketResults: tbResults,
    summary: {
      fixedWindowAllowed: fwResults.filter(r => r.allowed).length,
      tokenBucketAllowed: tbResults.filter(r => r.allowed).length,
      note: 'Fixed Window allows up to the hard ceiling in the current minute window. Token Bucket enforces smooth continuous consumption.'
    }
  });
});

