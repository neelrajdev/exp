import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { QuotaBar } from '../components/QuotaBar';
import { AlertBanner } from '../components/AlertBanner';
import { Activity, ShieldAlert, DollarSign, Users, ArrowRight, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

export function Overview({ onSelectTenant, onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOverview = async () => {
    try {
      const res = await api.fetchOverview();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOverview();
    const interval = setInterval(loadOverview, 2500);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <RefreshCw size={28} className="spin" color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '0.75rem' }}>Loading SaaSFlow Founder Dashboard...</p>
      </div>
    );
  }

  const { kpis, hasQuotaAlert, nearLimitTenants, topTenants } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1>Founder Overview</h1>
          <p>Real-time gateway usage telemetry, quota utilization, and business MRR estimate.</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadOverview(); }}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem' }}
          disabled={refreshing}
        >
          <RefreshCw size={14} className={refreshing ? 'spin' : ''} /> {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* 90% Quota Alert Banner (Extra Feature 1) */}
      {hasQuotaAlert && (
        <AlertBanner
          nearLimitTenants={nearLimitTenants}
          onSelectTenant={(id) => onSelectTenant && onSelectTenant(id)}
        />
      )}

      {/* KPI Cards */}
      <div className="grid-4">
        <KpiCard
          title="Monthly Calls"
          value={kpis?.totalCalls?.toLocaleString() || 0}
          subtext="Simulated requests this month"
          icon={Activity}
          color="var(--color-primary)"
        />
        <KpiCard
          title="Blocked Requests"
          value={kpis?.blockedRequests || 0}
          subtext="Throttled (429) & Unauthorized (401)"
          icon={ShieldAlert}
          color="var(--color-error)"
        />
        <KpiCard
          title="Estimated MRR"
          value={`₹${kpis?.estimatedMrrInr || '0.00'}`}
          subtext="Base subscription revenue"
          icon={DollarSign}
          color="var(--color-success)"
        />
        <KpiCard
          title="Active Tenants"
          value={kpis?.activeTenantsCount || 0}
          subtext="Onboarded customer accounts"
          icon={Users}
          color="#8B5CF6"
        />
      </div>

      {/* Main Sections: Top Tenants + Engine Status */}
      <div className="grid-2">
        {/* Top Tenants by Usage */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3>Top Tenants by Usage</h3>
              <span className="pulse-dot" />
            </div>
            <button
              onClick={() => onNavigate && onNavigate('tenants')}
              className="btn btn-secondary"
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
            >
              View All Directory <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {topTenants && topTenants.map(t => (
              <div
                key={t.id}
                onClick={() => onSelectTenant && onSelectTenant(t.id)}
                className="card-interactive"
                style={{ padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ fontSize: '0.92rem' }}>{t.name}</strong>
                  <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{t.planName} Plan</span>
                </div>
                <QuotaBar used={t.calls} limit={t.limit} label="Usage Progress" />
              </div>
            ))}
          </div>
        </div>

        {/* Engine Architecture & Quick Links */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Simulation Engine Status</h3>
            <p style={{ fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              All request validation, rate-limiting windows, and metered billing algorithms are executing deterministically.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span>Rate Limiter Algorithm:</span>
                <strong>Fixed-Window Counter (60s calendar)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span>Free Plan Ceiling:</span>
                <strong>5 calls / minute (1k included)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span>Starter Plan Ceiling:</span>
                <strong>20 calls / minute (₹40/1k overage)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span>Pro Plan Ceiling:</span>
                <strong>60 calls / minute (₹30/1k overage)</strong>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => onNavigate && onNavigate('playground')}
              className="btn btn-primary"
              style={{ flex: 1, fontSize: '0.82rem' }}
            >
              Test API Playground
            </button>
            <button
              onClick={() => onNavigate && onNavigate('billing')}
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: '0.82rem' }}
            >
              Review Monthly Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
