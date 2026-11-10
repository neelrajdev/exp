import React, { useState } from 'react';
import { api } from '../services/api';
import { Sliders, Zap, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export function DualLimiterSandbox() {
  const [limit, setLimit] = useState(5);
  const [burstCount, setBurstCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSimulateBurst = async () => {
    setLoading(true);
    try {
      const data = await api.compareLimiters({ limit: Number(limit), burstCount: Number(burstCount) });
      setResults(data);
    } catch (e) {
      alert('Simulation error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <Sliders size={22} color="var(--color-primary)" />
          <h2>Rate Limiting Algorithm Comparison Sandbox (Stretch Feature)</h2>
        </div>
        <p style={{ fontSize: '0.88rem' }}>
          Evaluate how <strong>Fixed-Window Counter</strong> (SaaSFlow PRD default) behaves compared to <strong>Token Bucket</strong> when an API consumer fires an instantaneous burst of concurrent requests.
        </p>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Per-Minute Limit</label>
            <select value={limit} onChange={e => setLimit(Number(e.target.value))}>
              <option value={5}>Free Plan (5 calls/min)</option>
              <option value={20}>Starter Plan (20 calls/min)</option>
              <option value={60}>Pro Plan (60 calls/min)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Burst Size (Instantaneous Concurrent Calls)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={burstCount}
              onChange={e => setBurstCount(Number(e.target.value))}
            />
          </div>

          <button
            onClick={handleSimulateBurst}
            disabled={loading}
            className="btn btn-primary"
            style={{ height: '42px' }}
          >
            <Zap size={16} /> {loading ? 'Simulating...' : 'Fire Burst Test'}
          </button>
        </div>
      </div>

      {/* Results View */}
      {results && (
        <div className="grid-2">
          {/* Fixed-Window */}
          <div className="card" style={{ borderTop: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3>Fixed-Window Counter</h3>
              <span className="badge badge-neutral">PRD Standard</span>
            </div>
            <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
              Tracks calls within discrete 60-second calendar windows (`Math.floor(now / 60000)`).
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--color-success-bg)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  {results.summary.fixedWindowAllowed}
                </span>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-success)', margin: 0 }}>Allowed (200)</p>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--color-error-bg)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-error)' }}>
                  {results.burstCount - results.summary.fixedWindowAllowed}
                </span>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-error)', margin: 0 }}>Throttled (429)</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {results.fixedWindowResults.map(r => (
                <span
                  key={r.callNumber}
                  className={`badge ${r.allowed ? 'badge-200' : 'badge-429'}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  #{r.callNumber}: {r.allowed ? '200' : '429'}
                </span>
              ))}
            </div>
          </div>

          {/* Token-Bucket */}
          <div className="card" style={{ borderTop: '4px solid #8B5CF6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3>Token Bucket</h3>
              <span className="badge badge-neutral">Stretch Algorithm</span>
            </div>
            <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
              Capacity {results.limit} tokens. Smoothly replenishes at ({results.limit}/60) tokens per second.
            </p>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--color-success-bg)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  {results.summary.tokenBucketAllowed}
                </span>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-success)', margin: 0 }}>Allowed (200)</p>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--color-error-bg)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-error)' }}>
                  {results.burstCount - results.summary.tokenBucketAllowed}
                </span>
                <p style={{ fontSize: '0.72rem', color: 'var(--color-error)', margin: 0 }}>Throttled (429)</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {results.tokenBucketResults.map(r => (
                <span
                  key={r.callNumber}
                  className={`badge ${r.allowed ? 'badge-200' : 'badge-429'}`}
                  style={{ fontSize: '0.7rem' }}
                >
                  #{r.callNumber}: {r.allowed ? '200' : '429'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Architectural Takeaway Note */}
      <div className="card" style={{ backgroundColor: '#F8FAFC' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <HelpCircle size={18} color="var(--color-primary)" />
          <h4 style={{ fontSize: '0.9rem' }}>Engineering Comparison Note (Section 15 Learning Goal)</h4>
        </div>
        <p style={{ fontSize: '0.82rem' }}>
          <strong>Fixed Window Boundary Spike:</strong> If a client sends 5 calls at 11:59:58 and another 5 calls at 12:00:02, the fixed window allows all 10 calls in a 4-second span because they fall into separate 60-second buckets.
          <br />
          <strong>Token Bucket Advantage:</strong> Token bucket enforces smooth consumption without boundary spikes by continuously trickling tokens back into the bucket at a mathematical rate per second.
        </p>
      </div>
    </div>
  );
}

