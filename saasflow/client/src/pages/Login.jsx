import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ShieldCheck, Code, DollarSign, RotateCcw, ArrowRight, Server } from 'lucide-react';

export function Login({ onLoginSuccess }) {
  const { login, resetDemo } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('tenant-shopkart');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    api.fetchTenants().then(data => {
      if (Array.isArray(data)) {
        setTenants(data);
        if (data.length > 0 && !selectedTenantId) {
          setSelectedTenantId(data[0].id);
        }
      }
    }).catch(() => {});
  }, []);

  const handleSelectRole = (role) => {
    if (role === 'consumer') {
      login(role, selectedTenantId);
    } else {
      login(role, null);
    }
    if (onLoginSuccess) onLoginSuccess(role);
  };

  const handleReset = async () => {
    if (window.confirm('Reset demo data back to default seeds (61,250 ShopKart calls, default quotas)?')) {
      setResetting(true);
      await resetDemo();
      setResetting(false);
      alert('Demo data restored to initial seed state.');
    }
  };

  return (
    <div style={{ maxWidth: '880px', margin: '2rem auto', padding: '1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#EEF2FF', padding: '0.35rem 0.85rem', borderRadius: '9999px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.8rem', marginBottom: '1rem' }}>
          <Server size={14} /> Full-Stack API Simulation Console
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Welcome to SaaSFlow
        </h1>
        <p style={{ fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto' }}>
          Simulated API usage, fixed-window rate limiting, request telemetry, and metered billing console without real payment or third-party infrastructure.
        </p>
      </div>

      <div className="grid-3" style={{ gap: '1.25rem' }}>
        {/* Founder Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--color-primary)' }}>
          <div>
            <div style={{ backgroundColor: '#EEF2FF', color: 'var(--color-primary)', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ marginBottom: '0.35rem' }}>Arjun · Founder</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              High-level usage metrics across tenants, 90% quota alert banner, inspects tenant usage bars, and upgrades tenant plans.
            </p>
          </div>
          <button
            onClick={() => handleSelectRole('founder')}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Enter as Founder <ArrowRight size={16} />
          </button>
        </div>

        {/* Consumer Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #10B981' }}>
          <div>
            <div style={{ backgroundColor: '#D1FAE5', color: '#059669', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Code size={24} />
            </div>
            <h3 style={{ marginBottom: '0.35rem' }}>Neha · API Consumer</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Tests endpoints in Playground, receives 200/401/429 responses, inspects headers, and watches the retry cooldown timer.
            </p>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem' }}>Select Tenant Account</label>
              <select
                value={selectedTenantId}
                onChange={e => setSelectedTenantId(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '0.45rem' }}
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.planName} tier)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => handleSelectRole('consumer')}
            className="btn btn-success"
            style={{ width: '100%' }}
          >
            Enter as Consumer <ArrowRight size={16} />
          </button>
        </div>

        {/* Finance Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #F59E0B' }}>
          <div>
            <div style={{ backgroundColor: '#FEF3C7', color: '#D97706', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <DollarSign size={24} />
            </div>
            <h3 style={{ marginBottom: '0.35rem' }}>Sameer · Finance</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
              Reviews monthly usage invoices, verifies overage calculations in integer paise, marks invoices as paid, and exports CSV.
            </p>
          </div>
          <button
            onClick={() => handleSelectRole('finance')}
            className="btn"
            style={{ width: '100%', backgroundColor: '#D97706', color: '#FFFFFF' }}
          >
            Enter as Finance <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Reset Seed Footer */}
      <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
          Want to restore pristine evaluation data or clear mock traffic?
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
        >
          <RotateCcw size={14} /> {resetting ? 'Resetting Database...' : 'Reset Demo Data to Seed'}
        </button>
      </div>
    </div>
  );
}

