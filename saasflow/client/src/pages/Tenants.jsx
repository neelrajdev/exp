import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { QuotaBar } from '../components/QuotaBar';
import { Search, ChevronRight, RefreshCw, Users, AlertTriangle } from 'lucide-react';

export function Tenants({ onSelectTenant }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const loadTenants = async () => {
    try {
      const data = await api.fetchTenants();
      setTenants(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
    // Auto-refresh every 3s so live traffic increments are reflected dynamically
    const interval = setInterval(loadTenants, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === 'all' || t.planId === planFilter;
    return matchesSearch && matchesPlan;
  });

  const criticalCount = tenants.filter(t => t.percentUsed >= 90).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1>Tenants Directory</h1>
          <p>Inspect tenant subscription plans, per-minute limits, and monthly quota progress.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {criticalCount > 0 && (
            <span className="badge badge-warning" style={{ padding: '0.35rem 0.65rem' }}>
              <AlertTriangle size={13} /> {criticalCount} Near 90% Limit
            </span>
          )}
          <button
            onClick={loadTenants}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search tenant name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        <div style={{ width: '180px' }}>
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            style={{ fontWeight: 600 }}
          >
            <option value="all">All Plans</option>
            <option value="free">Free Tier (5/m)</option>
            <option value="starter">Starter Tier (20/m)</option>
            <option value="pro">Pro Tier (60/m)</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Plan</th>
              <th>Rate Limit</th>
              <th style={{ minWidth: '250px' }}>Monthly Quota Progress</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && tenants.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Loading tenants...</td>
              </tr>
            ) : filteredTenants.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No tenants match the current filters.
                </td>
              </tr>
            ) : (
              filteredTenants.map(t => (
                <tr key={t.id}>
                  <td>
                    <div>
                      <strong style={{ fontSize: '0.92rem' }}>{t.name}</strong>
                      <p style={{ fontSize: '0.75rem', margin: 0, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>{t.id}</p>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontWeight: 700 }}>{t.planName}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {t.rateLimitPerMin} <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>calls/min</span>
                    </span>
                  </td>
                  <td>
                    <QuotaBar
                      used={t.monthCalls}
                      limit={t.monthlyLimit}
                      label=""
                    />
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ gap: '0.35rem' }}>
                      <span className="pulse-dot" style={{ width: '6px', height: '6px' }} /> Active
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => onSelectTenant(t.id)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      Details <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
