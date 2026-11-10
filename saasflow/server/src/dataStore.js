import { isDbConnected } from './config/db.js';
import { PlanModel, TenantModel, DailyUsageModel, ApiRequestModel, InvoiceModel } from './models/schemas.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory cache / fallback store
const inMemory = {
  plans: [],
  tenants: [],
  dailyUsage: {}, // { [tenantId]: { [date]: count } }
  requests: [],   // [ApiRequest]
  invoices: {}    // { [id]: Invoice }
};

export const dataStore = {
  async initSeed(forceReset = false) {
    // Read seed files from project
    const plansPath = path.resolve(__dirname, '../../data/plans.json');
    const usagePath = path.resolve(__dirname, '../../data/usage.json');

    let seedPlans = [];
    let seedUsage = { tenants: [], dailyUsage: {} };

    try {
      if (fs.existsSync(plansPath)) {
        seedPlans = JSON.parse(fs.readFileSync(plansPath, 'utf8'));
      }
      if (fs.existsSync(usagePath)) {
        seedUsage = JSON.parse(fs.readFileSync(usagePath, 'utf8'));
      }
    } catch (e) {
      console.error('Error loading seed files:', e);
    }

    // Populate in-memory state
    inMemory.plans = JSON.parse(JSON.stringify(seedPlans));
    inMemory.tenants = JSON.parse(JSON.stringify(seedUsage.tenants || []));
    inMemory.dailyUsage = JSON.parse(JSON.stringify(seedUsage.dailyUsage || {}));
    if (forceReset) {
      inMemory.requests = [];
      inMemory.invoices = {};
    }

    // If connected to MongoDB, persist seeds
    if (isDbConnected()) {
      try {
        if (forceReset) {
          await PlanModel.deleteMany({});
          await TenantModel.deleteMany({});
          await DailyUsageModel.deleteMany({});
          await ApiRequestModel.deleteMany({});
          await InvoiceModel.deleteMany({});
        }

        const countPlans = await PlanModel.countDocuments();
        if (countPlans === 0) {
          await PlanModel.insertMany(seedPlans);
        }

        const countTenants = await TenantModel.countDocuments();
        if (countTenants === 0) {
          await TenantModel.insertMany(seedUsage.tenants || []);
        }

        const countUsage = await DailyUsageModel.countDocuments();
        if (countUsage === 0 && seedUsage.dailyUsage) {
          const docs = [];
          for (const [tenantId, dateMap] of Object.entries(seedUsage.dailyUsage)) {
            for (const [date, calls] of Object.entries(dateMap)) {
              docs.push({ tenantId, date, calls });
            }
          }
          if (docs.length > 0) {
            await DailyUsageModel.insertMany(docs);
          }
        }
        console.log('[DataStore] Seed data successfully verified in MongoDB.');
      } catch (err) {
        console.warn('[DataStore] MongoDB seeding warning:', err.message);
      }
    }
  },

  async reset() {
    await this.initSeed(true);
    return { success: true, message: 'All data and limiter states reset to default seed.' };
  },

  // Plans
  async getPlans() {
    if (isDbConnected()) {
      try {
        const docs = await PlanModel.find().lean();
        if (docs.length > 0) return docs;
      } catch (err) {
        console.warn('Mongo getPlans error:', err.message);
      }
    }
    return inMemory.plans;
  },

  async getPlanById(planId) {
    const plans = await this.getPlans();
    return plans.find(p => p.id === planId) || null;
  },

  // Tenants
  async getTenants() {
    if (isDbConnected()) {
      try {
        const docs = await TenantModel.find().lean();
        if (docs.length > 0) return docs;
      } catch (err) {
        console.warn('Mongo getTenants error:', err.message);
      }
    }
    return inMemory.tenants;
  },

  async getTenantById(tenantId) {
    if (isDbConnected()) {
      try {
        const doc = await TenantModel.findOne({ id: tenantId }).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('Mongo getTenantById error:', err.message);
      }
    }
    return inMemory.tenants.find(t => t.id === tenantId) || null;
  },

  async getTenantByApiKey(apiKey) {
    if (!apiKey) return null;
    const cleanKey = apiKey.trim();
    if (isDbConnected()) {
      try {
        const doc = await TenantModel.findOne({ apiKey: cleanKey }).lean();
        if (doc) return doc;
      } catch (err) {
        console.warn('Mongo getTenantByApiKey error:', err.message);
      }
    }
    return inMemory.tenants.find(t => t.apiKey === cleanKey) || null;
  },

  async updateTenantPlan(tenantId, newPlanId) {
    // In-memory update
    const tenant = inMemory.tenants.find(t => t.id === tenantId);
    if (tenant) {
      tenant.planId = newPlanId;
    }

    if (isDbConnected()) {
      try {
        await TenantModel.updateOne({ id: tenantId }, { $set: { planId: newPlanId } });
      } catch (err) {
        console.warn('Mongo updateTenantPlan error:', err.message);
      }
    }

    return tenant;
  },

  // Daily Usage
  async getDailyUsage(tenantId = null, month = null) {
    if (isDbConnected()) {
      try {
        const query = {};
        if (tenantId) query.tenantId = tenantId;
        if (month) query.date = new RegExp(`^${month}`);
        const docs = await DailyUsageModel.find(query).lean();
        const map = {};
        for (const doc of docs) {
          if (!map[doc.tenantId]) map[doc.tenantId] = {};
          map[doc.tenantId][doc.date] = doc.calls;
        }
        return map;
      } catch (err) {
        console.warn('Mongo getDailyUsage error:', err.message);
      }
    }

    const result = {};
    for (const [tId, dates] of Object.entries(inMemory.dailyUsage)) {
      if (tenantId && tId !== tenantId) continue;
      result[tId] = {};
      for (const [d, count] of Object.entries(dates)) {
        if (!month || d.startsWith(month)) {
          result[tId][d] = count;
        }
      }
    }
    return result;
  },

  async getTenantMonthCalls(tenantId, month) {
    const usage = await this.getDailyUsage(tenantId, month);
    const tenantDates = usage[tenantId] || {};
    let total = 0;
    for (const count of Object.values(tenantDates)) {
      total += Number(count) || 0;
    }
    return total;
  },

  async incrementDailyUsage(tenantId, dateStr = null) {
    const date = dateStr || new Date().toISOString().slice(0, 10);

    // In-memory
    if (!inMemory.dailyUsage[tenantId]) inMemory.dailyUsage[tenantId] = {};
    inMemory.dailyUsage[tenantId][date] = (inMemory.dailyUsage[tenantId][date] || 0) + 1;

    // MongoDB
    if (isDbConnected()) {
      try {
        await DailyUsageModel.updateOne(
          { tenantId, date },
          { $inc: { calls: 1 } },
          { upsert: true }
        );
      } catch (err) {
        console.warn('Mongo incrementDailyUsage error:', err.message);
      }
    }

    return inMemory.dailyUsage[tenantId][date];
  },

  // API Requests (Capped at 500 FIFO)
  async getRequests(limit = 100, tenantId = null) {
    if (isDbConnected()) {
      try {
        const query = tenantId ? { tenantId } : {};
        const docs = await ApiRequestModel.find(query).sort({ timestamp: -1 }).limit(limit).lean();
        if (docs.length > 0) return docs;
      } catch (err) {
        console.warn('Mongo getRequests error:', err.message);
      }
    }

    let list = inMemory.requests;
    if (tenantId) {
      list = list.filter(r => r.tenantId === tenantId);
    }
    return list.slice(0, limit);
  },

  async logRequest(reqData) {
    // In-memory FIFO cap 500
    inMemory.requests.unshift(reqData);
    if (inMemory.requests.length > 500) {
      inMemory.requests.length = 500;
    }

    // MongoDB
    if (isDbConnected()) {
      try {
        await ApiRequestModel.create(reqData);
        // keep mongo collection capped
        const count = await ApiRequestModel.countDocuments();
        if (count > 600) {
          const oldest = await ApiRequestModel.find().sort({ timestamp: 1 }).limit(count - 500);
          const ids = oldest.map(d => d._id);
          await ApiRequestModel.deleteMany({ _id: { $in: ids } });
        }
      } catch (err) {
        console.warn('Mongo logRequest error:', err.message);
      }
    }

    return reqData;
  },

  // Invoices
  async getInvoices(month = null) {
    if (isDbConnected()) {
      try {
        const query = month ? { month } : {};
        const docs = await InvoiceModel.find(query).lean();
        const map = {};
        for (const doc of docs) {
          map[doc.id] = doc;
        }
        return map;
      } catch (err) {
        console.warn('Mongo getInvoices error:', err.message);
      }
    }
    return inMemory.invoices;
  },

  async saveInvoice(invoice) {
    inMemory.invoices[invoice.id] = invoice;
    if (isDbConnected()) {
      try {
        await InvoiceModel.updateOne(
          { id: invoice.id },
          { $set: invoice },
          { upsert: true }
        );
      } catch (err) {
        console.warn('Mongo saveInvoice error:', err.message);
      }
    }
    return invoice;
  },

  async updateInvoiceStatus(invoiceId, status, paidAt = null) {
    if (inMemory.invoices[invoiceId]) {
      inMemory.invoices[invoiceId].status = status;
      if (paidAt) inMemory.invoices[invoiceId].paidAt = paidAt;
    }
    if (isDbConnected()) {
      try {
        await InvoiceModel.updateOne(
          { id: invoiceId },
          { $set: { status, paidAt } }
        );
      } catch (err) {
        console.warn('Mongo updateInvoiceStatus error:', err.message);
      }
    }
    return inMemory.invoices[invoiceId] || { id: invoiceId, status, paidAt };
  }
};

