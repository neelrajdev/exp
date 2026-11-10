import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldX, ArrowLeft, Users } from 'lucide-react';

export function AccessDenied({ onNavigate, attemptedPage = 'page' }) {
  const { session, logout } = useAuth();
  const role = session?.role || 'Guest';

  const defaultHome = role === 'founder' ? 'overview' : role === 'consumer' ? 'my-api' : 'billing';

  return (
    <div className="card" style={{ maxWidth: '580px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
      <div style={{
        backgroundColor: 'var(--color-error-bg)',
        color: 'var(--color-error)',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem'
      }}>
        <ShieldX size={32} />
      </div>

      <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Access Denied (403)</h1>
      <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Your current simulated role <strong>({role.toUpperCase()})</strong> does not have permission to view or manage the requested <code>{attemptedPage}</code> module.
      </p>

      <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-sm)', textAlign: 'left', fontSize: '0.8rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
        <strong>Role Boundaries (PRD Section 10):</strong>
        <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem', color: 'var(--color-text-secondary)' }}>
          <li><strong>Founder:</strong> Overview, Tenant management, and Plan tier changes.</li>
          <li><strong>Consumer:</strong> Isolated strictly to their own API credentials, quota, and Playground.</li>
          <li><strong>Finance:</strong> Read-only invoices and Mark-as-Paid settlement.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          onClick={() => onNavigate(defaultHome)}
          className="btn btn-primary"
        >
          <ArrowLeft size={16} /> Return to Allowed Dashboard
        </button>
        <button
          onClick={() => { logout(); onNavigate('login'); }}
          className="btn btn-secondary"
        >
          <Users size={16} /> Switch Role
        </button>
      </div>
    </div>
  );
}

