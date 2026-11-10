import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2, Clock, Printer, Download, CreditCard } from 'lucide-react';

export function InvoiceDetail({ invoiceId, onBack }) {
  const { session } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const loadInvoice = async () => {
    try {
      const data = await api.fetchInvoice(invoiceId);
      setInvoice(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    setPaying(true);
    try {
      const res = await api.markInvoicePaid(invoice.id);
      if (res.success) {
        setInvoice(res.invoice);
      }
    } catch (e) {
      alert('Error updating payment: ' + e.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="card" style={{ maxWidth: '760px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>Loading invoice statement...</div>;
  }

  if (!invoice) {
    return (
      <div className="card" style={{ maxWidth: '760px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
        <h3>Invoice Not Found</h3>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Billing
        </button>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';
  const isFinance = session?.role === 'finance';

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Invoices
        </button>
        <button onClick={() => window.print()} className="btn btn-secondary">
          <Printer size={16} /> Print / PDF
        </button>
      </div>

      {/* Invoice Document Card */}
      <div className="card" style={{ padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
              SaaSFlow API Services
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              Automated Metered Billing Statement
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', marginBottom: '0.5rem' }}>
              {isPaid ? <CheckCircle2 size={14} /> : <Clock size={14} />}
              {isPaid ? 'PAID' : 'PAYMENT DUE'}
            </span>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
              {invoice.id}
            </p>
          </div>
        </div>

        {/* Customer & Period info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Billed To
            </span>
            <h3 style={{ fontSize: '1.05rem', marginTop: '0.2rem' }}>{invoice.tenantName}</h3>
            <p style={{ fontSize: '0.82rem', margin: 0 }}>{invoice.contactEmail || 'billing@customer.com'}</p>
            <p style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', margin: 0 }}>ID: {invoice.tenantId}</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Billing Cycle
            </span>
            <h3 style={{ fontSize: '1.05rem', marginTop: '0.2rem' }}>{invoice.month}</h3>
            <p style={{ fontSize: '0.82rem', margin: 0 }}>Currency: Indian Rupee (INR ₹)</p>
            {isPaid && invoice.paidAt && (
              <p style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: 600, marginTop: '0.25rem' }}>
                Paid on: {new Date(invoice.paidAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="table-container" style={{ marginBottom: '1.5rem' }}>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Units / Calls</th>
                <th>Rate</th>
                <th style={{ textAlign: 'right' }}>Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>{invoice.planName} Tier Base Subscription</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Includes {invoice.includedCalls.toLocaleString()} requests per calendar month
                  </p>
                </td>
                <td>1 Month</td>
                <td>Fixed</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{invoice.baseFeeInr}</td>
              </tr>

              <tr>
                <td>
                  <strong>Metered API Overage Calls</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    {invoice.actualCalls.toLocaleString()} actual calls − {invoice.includedCalls.toLocaleString()} included = {invoice.overageCalls.toLocaleString()} excess
                  </p>
                </td>
                <td>{invoice.overageCalls.toLocaleString()} calls</td>
                <td>₹{invoice.overageRatePer1kInr} / 1k</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{invoice.overageAmountInr}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Subtotal & Total */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', fontSize: '0.85rem' }}>
            <span>Subtotal:</span>
            <span>₹{invoice.totalAmountInr}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <span>Taxes (Simulated):</span>
            <span>₹0.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '240px', fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)', borderTop: '2px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
            <span>Total:</span>
            <span style={{ color: 'var(--color-primary)' }}>₹{invoice.totalAmountInr}</span>
          </div>
        </div>

        {/* Settlement / Mark as Paid Action */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Payment Status</span>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {isPaid ? 'Payment reconciled and ledger settled.' : 'Invoice is currently awaiting settlement reconciliation.'}
            </p>
          </div>

          {isFinance ? (
            <button
              onClick={handleMarkAsPaid}
              disabled={isPaid || paying}
              className={`btn ${isPaid ? 'btn-secondary' : 'btn-success'}`}
              style={{ fontSize: '0.85rem' }}
            >
              {isPaid ? (
                <>
                  <CheckCircle2 size={16} color="var(--color-success)" /> Settled (Paid)
                </>
              ) : (
                <>
                  <CreditCard size={16} /> {paying ? 'Recording...' : 'Mark as Paid'}
                </>
              )}
            </button>
          ) : (
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              * Only Finance role (Sameer) can record payments.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

