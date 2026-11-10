import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Check, Zap, Layers, Shield } from 'lucide-react';

export function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchPlans().then(data => {
      setPlans(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Subscription Tiers & Rate Limits</h1>
        <p>Comparison of throughput thresholds, monthly call quotas, and metered overage pricing.</p>
      </div>

      <div className="grid-3" style={{ gap: '1.5rem' }}>
        {plans.map(p => {
          const isStarter = p.id === 'starter';
          const isPro = p.id === 'pro';

          return (
            <div
              key={p.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: isPro ? '4px solid #8B5CF6' : isStarter ? '4px solid var(--color-primary)' : '4px solid #94A3B8',
                boxShadow: isStarter ? 'var(--shadow-md)' : 'var(--shadow-sm)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.3rem' }}>{p.name}</h3>
                  {isStarter && <span className="badge badge-neutral" style={{ backgroundColor: '#EEF2FF', color: 'var(--color-primary)' }}>Popular</span>}
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800 }}>
                    ₹{(p.baseFeePaise / 100).toLocaleString()}
                  </span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}> / month</span>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Rate limit ceiling:</span>
                    <strong>{p.rateLimitPerMin} req/min</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Included calls:</span>
                    <strong>{p.monthlyLimit.toLocaleString()} / mo</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Overage rate:</span>
                    <strong>₹{(p.overageRatePer1kPaise / 100).toFixed(0)} / 1k</strong>
                  </div>
                </div>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
                  {p.features?.map((f, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={16} color="var(--color-success)" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

