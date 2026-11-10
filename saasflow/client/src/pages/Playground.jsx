import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ResponsePanel } from '../components/ResponsePanel';
import { CountdownTimer } from '../components/CountdownTimer';
import { Send, Terminal, Key, ShieldAlert, Zap, Clock, RotateCcw, Check, Sparkles } from 'lucide-react';

export function Playground({ initialApiKey = '' }) {
  const { session, currentTenant } = useAuth();
  const [apiKey, setApiKey] = useState(initialApiKey || '');
  const [endpoint, setEndpoint] = useState('/v1/weather/current');
  const [algorithm, setAlgorithm] = useState('fixed-window');
  const [simulateLatency, setSimulateLatency] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bursting, setBursting] = useState(false);
  const [response, setResponse] = useState(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [activePlanLimit, setActivePlanLimit] = useState(20);

  // Load tenants for the quick selector
  useEffect(() => {
    api.fetchTenants().then(data => {
      if (Array.isArray(data)) {
        setTenants(data);
        if (!apiKey) {
          if (currentTenant?.apiKey) {
            setApiKey(currentTenant.apiKey);
            setActivePlanLimit(currentTenant.rateLimitPerMin || 20);
          } else if (data.length > 0) {
            setApiKey(data[0].apiKey);
            setActivePlanLimit(data[0].rateLimitPerMin || 20);
          }
        }
      }
    }).catch(() => {});
  }, [currentTenant]);

  const loadLogs = async () => {
    try {
      const logs = await api.fetchRequests(15);
      setRecentLogs(logs);
    } catch {}
  };

  // Poll logs every 3s so live traffic appears automatically
  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectTenantPreset = (tenant) => {
    setApiKey(tenant.apiKey);
    setActivePlanLimit(tenant.rateLimitPerMin || 20);
    setResponse(null);
    setRetryAfter(0);
  };

  const handleSend = async () => {
    if (loading || bursting) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await api.sendGatewayRequest({
        apiKey,
        endpoint,
        algorithm,
        simulateLatency
      });
      setResponse(res);

      if (res.status === 429 && res.body?.retryAfter) {
        setRetryAfter(res.body.retryAfter);
      } else {
        setRetryAfter(0);
      }
      await loadLogs();
    } catch (err) {
      setResponse({
        status: 500,
        statusText: 'Internal Error',
        headers: {},
        body: { error: err.message }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Dynamic Burst Test: Fires enough requests to reliably hit 429 for the active plan limit!
  const handleTestBurst = async () => {
    if (loading || bursting) return;
    setBursting(true);
    setResponse(null);

    // Target call count is limit + 1 (e.g. 5 + 1 = 6 for Free, 20 + 1 = 21 for Starter, 60 + 1 = 61 for Pro)
    const callsToSend = (activePlanLimit || 20) + 1;

    try {
      for (let i = 0; i < callsToSend - 1; i++) {
        await api.sendGatewayRequest({
          apiKey,
          endpoint,
          algorithm,
          simulateLatency: false
        });
      }
      // Final request that triggers and captures the 429 error
      const finalRes = await api.sendGatewayRequest({
        apiKey,
        endpoint,
        algorithm,
        simulateLatency: false
      });

      setResponse(finalRes);
      if (finalRes.status === 429 && finalRes.body?.retryAfter) {
        setRetryAfter(finalRes.body.retryAfter);
      }
      await loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setBursting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h1>API Playground & Terminal</h1>
        <p>Send simulated HTTP requests through the gateway pipeline. Test rate limiting, quotas, and telemetry.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left Column: Request Form & Log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} color="var(--color-primary)" />
              Compose Simulated Request
            </h3>

            {/* Quick Helper Presets */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
                Test As Tenant (Auto-Configures Key & Limit)
              </label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                {tenants.map(t => {
                  const isSelected = apiKey === t.apiKey;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTenantPreset(t)}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      {t.name.split(' ')[0]} ({t.planName}: {t.rateLimitPerMin}/m)
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => { setApiKey('sf_live_invalid_key_401'); setActivePlanLimit(20); }}
                  className="btn btn-secondary"
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', color: 'var(--color-error)', borderColor: 'var(--color-error-border)' }}
                >
                  <ShieldAlert size={12} /> Invalid Key (401)
                </button>
              </div>
            </div>

            {/* API Key */}
            <div className="form-group">
              <label>API Key (Authorization Header)</label>
              <div style={{ position: 'relative' }}>
                <Key size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="e.g. sf_live_weatherwise_7714"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  style={{ paddingLeft: '2.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            {/* Endpoint */}
            <div className="form-group">
              <label>Target API Endpoint</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.9rem', fontWeight: 800, fontSize: '0.78rem', color: 'var(--color-primary)' }}>
                  GET
                </span>
                <select
                  value={endpoint}
                  onChange={e => setEndpoint(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                >
                  <option value="/v1/weather/current">/v1/weather/current — Current Conditions (JSON)</option>
                  <option value="/v1/weather/forecast">/v1/weather/forecast — 7-Day Forecast (JSON)</option>
                  <option value="/v1/sms/send">/v1/sms/send — Dispatch SMS Message</option>
                  <option value="/v1/sms/status">/v1/sms/status — Delivery Verification</option>
                </select>
              </div>
            </div>

            {/* Limiter Algorithm Selection (Extra Feature 5) */}
            <div className="form-group">
              <label>Rate Limiting Algorithm</label>
              <select
                value={algorithm}
                onChange={e => setAlgorithm(e.target.value)}
              >
                <option value="fixed-window">Fixed-Window Counter (PRD Default: resets at 60s boundary)</option>
                <option value="token-bucket">Token Bucket (Continuous Smooth Refill rate)</option>
              </select>
            </div>

            {/* Latency toggle & Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={simulateLatency}
                  onChange={e => setSimulateLatency(e.target.checked)}
                  style={{ width: 'auto' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Simulate real latency (200-500ms)</span>
              </label>

              <button
                type="button"
                onClick={handleTestBurst}
                disabled={loading || bursting}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', borderColor: '#F59E0B', color: '#D97706', backgroundColor: '#FFFBEB' }}
                title={`Send ${activePlanLimit + 1} rapid concurrent calls to exhaust quota and test 429 response`}
              >
                <Zap size={14} color="#D97706" />
                {bursting ? `Bursting (${activePlanLimit + 1} calls)...` : `Burst Test (Trigger 429: ${activePlanLimit + 1} Calls)`}
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={loading || bursting}
              className="btn btn-primary"
              style={{ width: '100%', height: '44px', fontSize: '0.9rem', gap: '0.65rem' }}
            >
              <Send size={16} /> {loading ? 'Dispatching Request...' : 'Send Request (Enter)'}
            </button>
          </div>

          {/* Request Log Accordion / Slice */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem' }}>Recent Telemetry Stream</h3>
                <span className="pulse-dot" />
              </div>
              <button
                onClick={loadLogs}
                className="btn btn-secondary"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                <RotateCcw size={12} /> Refresh
              </button>
            </div>

            <div className="table-container" style={{ maxHeight: '250px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Tenant</th>
                    <th>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.length > 0 ? (
                    recentLogs.slice(0, 8).map(l => (
                      <tr key={l.id}>
                        <td style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                          {new Date(l.timestamp).toLocaleTimeString()}
                        </td>
                        <td>
                          <span className={`badge ${l.status === 200 ? 'badge-200' : l.status === 401 ? 'badge-warning' : 'badge-429'}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                            {l.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {l.tenantId}
                        </td>
                        <td style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          {l.latencyMs}ms
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)' }}>
                        No requests logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Response Panel & Retry Countdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {retryAfter > 0 && (
            <CountdownTimer
              initialSeconds={retryAfter}
              onComplete={() => setRetryAfter(0)}
            />
          )}

          <ResponsePanel response={response} loading={loading || bursting} />
        </div>
      </div>
    </div>
  );
}
