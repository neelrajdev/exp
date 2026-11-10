import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { QuotaBar } from '../components/QuotaBar';
import { ArrowLeft, Key, Copy, Check, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function TenantDetail({ tenantId, onBack, onTestInPlayground }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [plans, setPlans] = useState([]);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  const loadTenant = async () => {
    try {
      const [tenantData, plansData] = await Promise.all([
        api.fetchTenant(tenantId),
        api.fetchPlans()
      ]);
      setData(tenantData);
      setPlans(plansData);
      if (tenantData?.tenant) {
        setSelectedPlanId(tenantData.tenant.planId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenant();
    // Poll every 3s so live traffic reflects in usage bars
    const interval = setInterval(loadTenant, 3000);
    return () => clearInterval(interval);
  }, [tenantId]);

  const handleCopyKey = () => {
    if (!data?.tenant?.apiKey) return;
    navigator.clipboard.writeText(data.tenant.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlanChange = async () => {
    if (!selectedPlanId || selectedPlanId === data?.tenant?.planId) return;
    setUpdating(true);
    setUpdateMessage(null);
    try {
      const res = await api.updateTenantPlan(tenantId, selectedPlanId);
      if (res.success) {
        setUpdateMessage(`Success! Upgraded to ${res.plan.name} plan. Rate limit is now ${res.plan.rateLimitPerMin} calls/min.`);
        await loadTenant();
      }
    } catch (err) {
      alert('Plan update failed: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !data) {
    return <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>Loading tenant details...</div>;
  }

  const { tenant, plan, monthCalls, percentUsed, usageHistory7Days, recentRequests } = data || {};
  if (!tenant) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <h3>Tenant not found</h3>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>
    );
  }

  const maskedKey = tenant.apiKey ? `${tenant.apiKey.slice(0, 10)}••••••••••••` : '••••••••••••';
  const maxDayCalls = Math.max(...(usageHistory7Days || []).map(d => d.calls), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Back & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.45rem 0.75rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1>{tenant.name}</h1>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Tenant ID: {tenant.id}</p>
          </div>
        </div>

        <button
          onClick={() => onTestInPlayground && onTestInPlayground(tenant.apiKey)}
          className="btn btn-primary"
          style={{ fontSize: '0.82rem' }}
        >
          Open in API Playground
        </button>
      </div>

      {updateMessage && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--color-success)', fontSize: '0.88rem' }}>
          <CheckCircle2 size={18} />
          <strong>{updateMessage}</strong>
        </div>
      )}

      {/* Grid: Plan & Key + Quota Summary */}
      <div className="grid-2">
        {/* Credentials & Plan Change */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Subscription & API Credentials</h3>

          {/* Masked API Key */}
          <div className="form-group">
            <label>Live API Key</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                readOnly
                value={showKey ? tenant.apiKey : maskedKey}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', backgroundColor: '#F8FAFC' }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.75rem' }}
                title={showKey ? "Hide key" : "Reveal key"}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={handleCopyKey}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.75rem' }}
                title="Copy API key"
              >
                {copied ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Plan Selector (Founder action) */}
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label>Change Subscription Tier (Founder Action)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                value={selectedPlanId}
                onChange={e => setSelectedPlanId(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.rateLimitPerMin}/min limit, {p.monthlyLimit.toLocaleString()} included calls
                  </option>
                ))}
              </select>
              <button
                onClick={handlePlanChange}
                disabled={updating || selectedPlanId === tenant.planId}
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                {updating ? 'Updating...' : 'Update Plan'}
              </button>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.45rem' }}>
              * Immediate effect: Per-minute rate limit changes instantly. Next month's billing will reflect the new base fee (no MVP proration).
            </p>
          </div>
        </div>

        {/* Usage & Quota Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Active Limits & Quota</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <QuotaBar
                used={monthCalls}
                limit={plan.monthlyLimit}
                label={`Monthly Allocation (${plan.name})`}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Per-Minute Throttling:</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                    {plan.rateLimitPerMin} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>req/min</span>
                  </p>
                </div>
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Overage Rate:</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                    ₹{(plan.overageRatePer1kPaise / 100).toFixed(0)} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>/ 1k calls</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Usage Bars */}
      <div className="card">
        <h3 style={{ marginBottom: '0.4rem' }}>7-Day Request Volume</h3>
        <p style={{ fontSize: '0.82rem', marginBottom: '1.25rem' }}>Daily aggregated successful 200 calls recorded by the gateway pipeline.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.75rem', alignItems: 'flex-end', height: '170px', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
          {usageHistory7Days && usageHistory7Days.map((day, idx) => {
            const barHeightPct = Math.max(12, Math.round((day.calls / maxDayCalls) * 100));
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--color-text-secondary)' }}>
                  {day.calls.toLocaleString()}
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${barHeightPct}%`,
                    background: 'linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)',
                    borderRadius: '6px 6px 0 0',
                    boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)',
                    transition: 'height 0.3s ease'
                  }}
                  title={`${day.date}: ${day.calls} calls`}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Recent Gateway Requests</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Endpoint</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Telemetry Message</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests && recentRequests.length > 0 ? (
                recentRequests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      {new Date(r.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600 }}>
                      {r.endpoint}
                    </td>
                    <td>
                      <span className={`badge ${r.status === 200 ? 'badge-200' : 'badge-429'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {r.latencyMs}ms
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                      {r.message}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)' }}>
                    No recent requests logged for this tenant yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
