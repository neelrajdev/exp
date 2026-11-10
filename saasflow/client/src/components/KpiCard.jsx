import React from 'react';

export function KpiCard({ title, value, subtext, icon: Icon, color = 'var(--color-primary)' }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-secondary)', marginBottom: '0.35rem' }}>
          {title}
        </p>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
          {value}
        </h2>
        {subtext && (
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
            {subtext}
          </p>
        )}
      </div>
      {Icon && (
        <div style={{
          backgroundColor: 'var(--bg-hover)',
          padding: '0.65rem',
          borderRadius: 'var(--radius-sm)',
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
}

