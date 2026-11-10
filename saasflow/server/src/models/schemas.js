import mongoose from 'mongoose';

export const PlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rateLimitPerMin: { type: Number, required: true },
  monthlyLimit: { type: Number, required: true },
  baseFeePaise: { type: Number, required: true },
  overageRatePer1kPaise: { type: Number, required: true },
  features: [String]
}, { timestamps: true });

export const TenantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true },
  planId: { type: String, required: true },
  contactEmail: String,
  status: { type: String, default: 'active' },
  createdAt: String
}, { timestamps: true });

export const DailyUsageSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  date: { type: String, required: true },
  calls: { type: Number, default: 0 }
}, { timestamps: true });
DailyUsageSchema.index({ tenantId: 1, date: 1 }, { unique: true });

export const ApiRequestSchema = new mongoose.Schema({
  id: { type: String, required: true },
  tenantId: String,
  endpoint: String,
  status: Number,
  latencyMs: Number,
  message: String,
  algorithm: String,
  timestamp: Number,
  errorReason: String
}, { timestamps: true });
ApiRequestSchema.index({ timestamp: -1 });

export const InvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true },
  month: { type: String, required: true },
  baseFeePaise: Number,
  includedCalls: Number,
  actualCalls: Number,
  overageCalls: Number,
  overageRatePer1kPaise: Number,
  overageAmountPaise: Number,
  totalAmountPaise: Number,
  status: { type: String, default: 'unpaid' },
  paidAt: String
}, { timestamps: true });
InvoiceSchema.index({ tenantId: 1, month: 1 }, { unique: true });

export const PlanModel = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
export const TenantModel = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);
export const DailyUsageModel = mongoose.models.DailyUsage || mongoose.model('DailyUsage', DailyUsageSchema);
export const ApiRequestModel = mongoose.models.ApiRequest || mongoose.model('ApiRequest', ApiRequestSchema);
export const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);

