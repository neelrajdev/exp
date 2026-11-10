import React, { useState } from 'react';
import { Check, Copy, Server, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ResponsePanel({ response, loading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.body, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>Simulating gateway latency (200–600ms)...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', borderStyle: 'dashed' }}>
        <Server size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 0.75rem' }} />
        <h3 style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>Empty Gateway Output</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Send your first request to see the response status, headers, and payload here.
        </p>
      </div>
    );
  }

  const { status, statusText, headers, body } = response;
  const is200 = status === 200;
  const is429 = status === 429;
  const is401 = status === 401;

  let badgeClass = 'badge-200';
  let StatusIcon = CheckCircle2;
  if (is429 || is401) {
    badgeClass = is401 ? 'badge-warning' : 'badge-429';
    StatusIcon = AlertCircle;
  }

  return (
    <div className="card" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Status Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${badgeClass}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            <StatusIcon size={14} />
            {status} {statusText || (is200 ? 'OK' : is429 ? 'Too Many Requests' : 'Unauthorized')}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
          title="Copy response body"
        >
          {copied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>

      {/* Simulated Headers Bar */}
      {headers && Object.keys(headers).length > 0 && (
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.3rem', fontSize: '0.7rem', textTransform: 'uppercase' }}>
            Simulated HTTP Headers
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem' }}>
            {headers['x-ratelimit-limit'] && <div><strong>X-RateLimit-Limit:</strong> {headers['x-ratelimit-limit']}</div>}
            {headers['x-ratelimit-remaining'] && <div><strong>X-RateLimit-Remaining:</strong> {headers['x-ratelimit-remaining']}</div>}
            {headers['x-ratelimit-reset'] && <div><strong>X-RateLimit-Reset:</strong> {headers['x-ratelimit-reset']}s</div>}
            {headers['retry-after'] && <div style={{ color: 'var(--color-error)' }}><strong>Retry-After:</strong> {headers['retry-after']}s</div>}
            {headers['x-quota-monthly-used'] && <div><strong>X-Quota-Monthly-Used:</strong> {headers['x-quota-monthly-used']}</div>}
          </div>
        </div>
      )}

      {/* Response Body JSON */}
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
          Response Payload
        </p>
        <pre style={{
          backgroundColor: '#0F172A',
          color: '#E2E8F0',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          overflowX: 'auto',
          maxHeight: '340px'
        }}>
          {JSON.stringify(body, null, 2)}
        </pre>
      </div>
    </div>
  );
}

