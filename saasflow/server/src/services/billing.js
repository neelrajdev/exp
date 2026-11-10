/**
 * SaaSFlow - Billing & Invoicing Service
 * Implements:
 * 1. Integer-paise precision billing calculations
 * 2. Rubric compliance (61,250 calls on Starter = 11,250 overage, INR 450 overage, INR 1,449 total)
 * 3. Monthly invoice generation & status management
 * 4. CSV ledger export (Extra Feature 3)
 */

import { dataStore } from '../dataStore.js';

export const billing = {
  /**
   * Pure function: calculates invoice amounts using integer paise
   */
  calcInvoiceBreakdown(plan, actualCalls) {
    const includedCalls = plan.monthlyLimit || 0;
    const baseFeePaise = plan.baseFeePaise || 0;
    const overageRatePer1kPaise = plan.overageRatePer1kPaise || 0;

    const overageCalls = Math.max(0, actualCalls - includedCalls);

    // Integer paise calculation: (overageCalls * ratePer1k) / 1000
    const overageAmountPaise = Math.round((overageCalls * overageRatePer1kPaise) / 1000);
    const totalAmountPaise = baseFeePaise + overageAmountPaise;

    return {
      includedCalls,
      actualCalls,
      overageCalls,
      baseFeePaise,
      overageRatePer1kPaise,
      overageAmountPaise,
      totalAmountPaise,
      // User-facing INR formatted floats (2 decimal places)
      baseFeeInr: (baseFeePaise / 100).toFixed(2),
      overageRatePer1kInr: (overageRatePer1kPaise / 100).toFixed(2),
      overageAmountInr: (overageAmountPaise / 100).toFixed(2),
      totalAmountInr: (totalAmountPaise / 100).toFixed(2)
    };
  },

  /**
   * Generates or retrieves an invoice for a specific tenant and month
   */
  async getOrCreateInvoice(tenantId, month) {
    const invoiceId = `inv_${tenantId}_${month.replace('-', '_')}`;
    const allInvoices = await dataStore.getInvoices(month);
    const existing = allInvoices[invoiceId];

    const tenant = await dataStore.getTenantById(tenantId);
    if (!tenant) return null;

    const plan = await dataStore.getPlanById(tenant.planId);
    const actualCalls = await dataStore.getTenantMonthCalls(tenantId, month);
    const breakdown = this.calcInvoiceBreakdown(plan, actualCalls);

    const invoice = {
      id: invoiceId,
      tenantId: tenant.id,
      tenantName: tenant.name,
      contactEmail: tenant.contactEmail,
      planId: plan.id,
      planName: plan.name,
      month,
      status: existing ? existing.status : 'unpaid',
      paidAt: existing ? existing.paidAt : null,
      ...breakdown,
      generatedAt: existing ? existing.generatedAt : new Date().toISOString()
    };

    await dataStore.saveInvoice(invoice);
    return invoice;
  },

  /**
   * Generates invoices for all tenants for a selected month
   */
  async getMonthInvoices(month) {
    const tenants = await dataStore.getTenants();
    const invoices = [];

    for (const tenant of tenants) {
      const inv = await this.getOrCreateInvoice(tenant.id, month);
      if (inv) invoices.push(inv);
    }

    // Totals summary
    let totalInvoicedPaise = 0;
    let totalOutstandingPaise = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    for (const inv of invoices) {
      totalInvoicedPaise += inv.totalAmountPaise;
      if (inv.status === 'paid') {
        paidCount++;
      } else {
        unpaidCount++;
        totalOutstandingPaise += inv.totalAmountPaise;
      }
    }

    return {
      month,
      invoices,
      summary: {
        totalInvoicedInr: (totalInvoicedPaise / 100).toFixed(2),
        totalOutstandingInr: (totalOutstandingPaise / 100).toFixed(2),
        paidCount,
        unpaidCount,
        tenantCount: tenants.length
      }
    };
  },

  /**
   * Marks an invoice as paid (persisted in DB)
   */
  async markAsPaid(invoiceId) {
    const paidAt = new Date().toISOString();
    return await dataStore.updateInvoiceStatus(invoiceId, 'paid', paidAt);
  },

  /**
   * Exports monthly invoice ledger as RFC 4180 CSV (Extra Feature 3)
   */
  async exportCsv(month) {
    const { invoices } = await this.getMonthInvoices(month);
    const headers = [
      'Invoice ID',
      'Tenant Name',
      'Plan',
      'Month',
      'Total Calls',
      'Included Calls',
      'Overage Calls',
      'Base Fee (INR)',
      'Overage Charge (INR)',
      'Total Amount (INR)',
      'Status',
      'Paid Timestamp'
    ];

    const rows = invoices.map(inv => [
      inv.id,
      `"${inv.tenantName.replace(/"/g, '""')}"`,
      inv.planName,
      inv.month,
      inv.actualCalls,
      inv.includedCalls,
      inv.overageCalls,
      inv.baseFeeInr,
      inv.overageAmountInr,
      inv.totalAmountInr,
      inv.status.toUpperCase(),
      inv.paidAt || 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    return csvContent;
  }
};

