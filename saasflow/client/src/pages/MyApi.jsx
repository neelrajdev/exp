import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { QuotaBar } from '../components/QuotaBar';
import { Key, Copy, Check, Eye, EyeOff, Terminal, Shield, RefreshCw } from 'lucide-react';

export function MyApi({ onOpenPlayground }) {
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = async () => {
    if (!session?.tenantId) return;
    try {
      const tenantData = await api.fetchTenant(session.tenantId);
      setData(tenantData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [session?.tenantId]);

  const handleCopyKey = () => {
    if (!data?.tenant?.apiKey) return;
    navigator.clipboard.writeText(data.tenant.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>Loading API credentials...</div>;
  }

  const { tenant, plan, monthCalls } = data || {};
  if (!tenant) {
    return <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>Tenant credentials not found.</div>;
  }

  const maskedKey = tenant.apiKey ? `${tenant.apiKey.slice(0, 10)}••••••••••••` : '••••••••••••';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1>My API Credentials & Quota</h1>
          <p>Tenant account: <strong>{tenant.name}</strong> · Plan: <strong>{plan?.name}</strong></p>
        </div>
        <button
          onClick={() => onOpenPlayground && onOpenPlayground(tenant.apiKey)}
          className="btn btn-primary"
        >
          <Terminal size={16} /> Open Playground
        </button>
      </div>

      {/* API Key Box */}
      <div className="card">
        <h3 style={{ marginBottom: '0.75rem' }}>Live Production API Key</h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          Pass this key in the <code>x-api-key</code> header or test request body in the API Playground.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            readOnly
            value={showKey ? tenant.apiKey : maskedKey}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', backgroundColor: '#F8FAFC' }}
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="btn btn-secondary"
            title={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={handleCopyKey}
            className="btn btn-secondary"
            title="Copy to clipboard"
          >
            {copied ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Quotas & Rate Limits */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>Per-Minute Throttling Ceiling</h3>
          <p style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>
            Simulated fixed-window bucket for <strong>{tenant.name}</strong>. Resets every 60 seconds.
          </p>

          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {plan?.rateLimitPerMin}
            </span>
            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>
              calls permitted per minute
            </p>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
            Sending more than {plan?.rateLimitPerMin} calls inside 60 seconds returns <code>HTTP 429 Too Many Requests</code> with a <code>Retry-After</code> countdown.
          </p>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '0.75rem' }}>Monthly Included Quota</h3>
          <p style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>
            Calendar month call consumption and overage buffer tracking.
          </p>

          <QuotaBar
            used={monthCalls}
            limit={plan?.monthlyLimit || 1000}
            label="Current Month"
          />

          <div style={{ marginTop: '1.25rem', padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span>Included calls:</span>
              <strong>{plan?.monthlyLimit?.toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Overage pricing:</span>
              <strong>₹{(plan?.overageRatePer1kPaise / 100).toFixed(0)} per 1,000 calls</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

