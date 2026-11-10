import React from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export function AlertBanner({ nearLimitTenants = [], onSelectTenant }) {
  if (!nearLimitTenants || nearLimitTenants.length === 0) return null;

  return (
    <div style={{
      backgroundColor: 'var(--color-warning-bg)',
      border: '1px solid rgba(180, 83, 9, 0.35)',
      borderRadius: 'var(--radius-md)',
      padding: '0.85rem 1.25rem',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          backgroundColor: '#FDE68A',
          color: 'var(--color-warning)',
          padding: '0.4rem',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <strong style={{ color: '#92400E', fontSize: '0.9rem' }}>
            Action Required: {nearLimitTenants.length} {nearLimitTenants.length === 1 ? 'tenant has' : 'tenants have'} exceeded 90% of their monthly quota!
          </strong>
          <p style={{ color: '#78350F', fontSize: '0.82rem', margin: 0 }}>
            {nearLimitTenants.map(t => `${t.name} (${t.percentUsed}%)`).join(', ')} may soon be throttled or incur overage fees.
          </p>
        </div>
      </div>

      {onSelectTenant && nearLimitTenants.length > 0 && (
        <button
          onClick={() => onSelectTenant(nearLimitTenants[0].id)}
          className="btn"
          style={{
            backgroundColor: '#92400E',
            color: '#FFFFFF',
            fontSize: '0.78rem',
            padding: '0.4rem 0.8rem'
          }}
        >
          Inspect {nearLimitTenants[0].name} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

