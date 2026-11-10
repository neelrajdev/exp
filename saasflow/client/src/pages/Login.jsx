import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Ardia3DCanvas } from '../components/Ardia3DCanvas';
import {
  ShieldCheck,
  Code,
  DollarSign,
  RotateCcw,
  ArrowRight,
  Terminal,
  Zap,
  Sliders,
  CheckCircle2,
  Download,
  Key,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export function Login({ onLoginSuccess, onNavigate }) {
  const { login, resetDemo } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('tenant-shopkart');
  const [resetting, setResetting] = useState(false);

  // Quick interactive tester on the landing page
  const [landingEndpoint, setLandingEndpoint] = useState('/v1/weather/current');
  const [landingResponse, setLandingResponse] = useState(null);
  const [landingLoading, setLandingLoading] = useState(false);

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

  const handleSelectRole = (role, customTenantId = null) => {
    if (role === 'consumer') {
      login(role, customTenantId || selectedTenantId);
    } else {
      login(role, null);
    }
    if (onLoginSuccess) onLoginSuccess(role);
  };

  const handleLandingSend = async () => {
    setLandingLoading(true);
    try {
      const res = await api.sendGatewayRequest({
        apiKey: 'sf_live_shopkart_9921',
        endpoint: landingEndpoint,
        algorithm: 'fixed-window',
        simulateLatency: true
      });
      setLandingResponse(res);
    } catch (e) {
      setLandingResponse({ status: 500, body: { error: e.message } });
    } finally {
      setLandingLoading(false);
    }
  };

  const handleLandingBurst = async () => {
    setLandingLoading(true);
    try {
      // Free plan tenant has 5/min limit; 6 calls guarantees 429
      for (let i = 0; i < 5; i++) {
        await api.sendGatewayRequest({
          apiKey: 'sf_live_weatherwise_7714',
          endpoint: landingEndpoint,
          simulateLatency: false
        });
      }
      const finalRes = await api.sendGatewayRequest({
        apiKey: 'sf_live_weatherwise_7714',
        endpoint: landingEndpoint,
        simulateLatency: false
      });
      setLandingResponse(finalRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLandingLoading(false);
    }
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
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      {/* 3D Canvas Background reacting to cursor & scroll */}
      <Ardia3DCanvas />

      {/* Hero Section (Screen 1) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem 3.5rem',
        maxWidth: '1240px',
        margin: '0 auto'
      }}>
        {/* Top Tagline Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(28, 25, 23, 0.08)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', color: '#1C1917', fontWeight: 700, fontSize: '0.78rem', marginBottom: '1.25rem', width: 'fit-content' }}>
          <Sparkles size={14} color="#EA580C" /> SaaSFlow · PST_PD_004 · 4-Week OJT Architecture
        </div>

        {/* Massive Brutalist Headline (like TOUCH GRASS on ardia.dev) */}
        <h1 className="hero-title" style={{ marginBottom: '1.25rem' }}>
          RATE<br />LIMIT.
        </h1>

        {/* Clean, Plain Copy */}
        <p style={{
          fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)',
          maxWidth: '680px',
          color: '#1C1917',
          fontWeight: 500,
          lineHeight: 1.35,
          marginBottom: '2.25rem'
        }}>
          Arc's sidebar and Stripe's metered telemetry on real zero-backend simulation.
          Free and open source. Ads and real credit cards stay out.
        </p>

        {/* Ardia Dual-Cell Pill Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2.5rem' }}>
          {/* Primary Action Pill */}
          <button
            onClick={() => handleSelectRole('founder')}
            className="ardia-btn-pill"
          >
            <span className="ardia-btn-cell-main">
              <Download size={16} /> Enter Console
            </span>
            <span className="ardia-btn-cell-sub">
              Founder Arjun
            </span>
          </button>

          {/* Secondary Action Pill */}
          <button
            onClick={() => handleSelectRole('consumer', 'tenant-shopkart')}
            className="ardia-btn-pill"
          >
            <span className="ardia-btn-cell-main">
              <Zap size={16} /> API Playground
            </span>
            <span className="ardia-btn-cell-sub">
              Consumer Neha
            </span>
          </button>

          {/* Finance Action Pill */}
          <button
            onClick={() => handleSelectRole('finance')}
            className="ardia-btn-pill"
          >
            <span className="ardia-btn-cell-main">
              <DollarSign size={16} /> Monthly Billing
            </span>
            <span className="ardia-btn-cell-sub">
              Finance Sameer
            </span>
          </button>
        </div>

        {/* Subtext and Verified PRD Note */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#57534E' }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            Read the source ★ <strong>26/26 Tests Passed</strong> · Verified PRD v1.1
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#78716C' }}>
            Interactive 3D viewport responds to your mouse cursor and scroll depth.
          </p>
        </div>

        {/* Scroll hint */}
        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#78716C', fontSize: '0.8rem', fontWeight: 600 }}>
          <span>Scroll down to test live gateway & inspect tenant quotas</span>
          <ChevronDown size={14} className="spin" style={{ animation: 'bounce 1.6s infinite' }} />
        </div>
      </div>

      {/* Section 2: Real Product Telemetry (Scroll-based) */}
      <div style={{ position: 'relative', zIndex: 10, padding: '4rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C' }}>
            Touch Real Telemetry
          </span>
          <h2 style={{ fontSize: '2.4rem', marginTop: '0.25rem', letterSpacing: '-0.03em' }}>
            Dispatch Simulated Requests Instantly
          </h2>
          <p style={{ maxWidth: '600px', margin: '0.5rem auto 0', color: '#57534E' }}>
            Fire requests directly from this landing page to experience the gateway pipeline, status codes, and headers.
          </p>
        </div>

        <div className="card" style={{ maxWidth: '840px', margin: '0 auto', padding: '1.75rem', backgroundColor: '#FAF7F2', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-card-hover)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#1C1917', color: '#FAF7F2', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontSize: '0.8rem' }}>
              GET
            </span>
            <select
              value={landingEndpoint}
              onChange={e => setLandingEndpoint(e.target.value)}
              style={{ flex: 1, minWidth: '220px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
            >
              <option value="/v1/weather/current">/v1/weather/current — Real-Time Weather Conditions</option>
              <option value="/v1/weather/forecast">/v1/weather/forecast — 7-Day Atmospheric Outlook</option>
              <option value="/v1/sms/send">/v1/sms/send — Simulated SMS Dispatch</option>
            </select>

            <button
              onClick={handleLandingSend}
              disabled={landingLoading}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.25rem' }}
            >
              {landingLoading ? 'Dispatching...' : 'Send Request'}
            </button>

            <button
              onClick={handleLandingBurst}
              disabled={landingLoading}
              className="btn btn-secondary"
              style={{ borderColor: '#B45309', color: '#B45309', backgroundColor: '#FEF3C7' }}
              title="Burst 6 calls to trigger 429 Too Many Requests"
            >
              <Zap size={14} /> Trigger 429 Throttle
            </button>
          </div>

          {/* Response Output */}
          {landingResponse ? (
            <div style={{ backgroundColor: '#1C1917', color: '#FAF7F2', padding: '1.25rem', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', maxHeight: '280px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ color: landingResponse.status === 200 ? '#4ADE80' : '#F87171', fontWeight: 700 }}>
                  HTTP {landingResponse.status} {landingResponse.status === 200 ? 'OK' : 'Too Many Requests'}
                </span>
                <span style={{ color: '#9CA3AF' }}>Simulated Gateway Pipeline</span>
              </div>
              <pre>{JSON.stringify(landingResponse.body, null, 2)}</pre>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: '#78716C', fontSize: '0.85rem' }}>
              Click <strong>"Send Request"</strong> (200 OK) or <strong>"Trigger 429 Throttle"</strong> (Rate Limit) to preview the live gateway response.
            </div>
          )}
        </div>
      </div>

      {/* Section 3: The 3 Core Persona Doorways */}
      <div style={{ position: 'relative', zIndex: 10, padding: '4rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C' }}>
            Choose Your Doorway
          </span>
          <h2 style={{ fontSize: '2.4rem', marginTop: '0.25rem', letterSpacing: '-0.03em' }}>
            Three Personas. One Simulation Console.
          </h2>
        </div>

        <div className="grid-3" style={{ gap: '1.5rem' }}>
          {/* Founder Card */}
          <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem' }}>
            <div>
              <div style={{ backgroundColor: '#ECE6DA', color: '#1C1917', width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Arjun · Founder</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Monitors high-level usage, receives proactive 90% quota alert banners, inspects 7-day volume, and upgrades tenant plans.
              </p>
            </div>
            <button
              onClick={() => handleSelectRole('founder')}
              className="btn btn-primary"
              style={{ width: '100%', height: '44px' }}
            >
              Enter as Founder <ArrowRight size={16} />
            </button>
          </div>

          {/* Consumer Card */}
          <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem' }}>
            <div>
              <div style={{ backgroundColor: '#DCFCE7', color: '#2D5A27', width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Code size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Neha · API Consumer</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Tests endpoints in Playground, receives 200/401/429 responses, inspects headers, and watches the retry cooldown timer.
              </p>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem' }}>Bind To Tenant Account:</label>
                <select
                  value={selectedTenantId}
                  onChange={e => setSelectedTenantId(e.target.value)}
                  style={{ fontSize: '0.82rem', fontWeight: 600 }}
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
              style={{ width: '100%', height: '44px' }}
            >
              Enter as Consumer <ArrowRight size={16} />
            </button>
          </div>

          {/* Finance Card */}
          <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem' }}>
            <div>
              <div style={{ backgroundColor: '#FEF3C7', color: '#B45309', width: '46px', height: '46px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <DollarSign size={26} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Sameer · Finance</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                Reviews monthly usage invoices, verifies overage calculations in integer paise, marks invoices as paid, and exports CSV.
              </p>
            </div>
            <button
              onClick={() => handleSelectRole('finance')}
              className="btn"
              style={{ width: '100%', height: '44px', backgroundColor: '#B45309', color: '#FFFFFF' }}
            >
              Enter as Finance <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Dual Algorithm Comparison & Reset Footer */}
      <div style={{ position: 'relative', zIndex: 10, padding: '3rem 1.5rem 5rem', maxWidth: '1240px', margin: '0 auto', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Fixed-Window vs Token Bucket Limiter Sandbox</h3>
        <p style={{ maxWidth: '640px', margin: '0 auto 1.5rem', fontSize: '0.85rem', color: '#57534E' }}>
          Evaluate how discrete 60-second fixed clock windows behave under burst concurrency compared to continuous token replenishments.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            <RotateCcw size={14} /> {resetting ? 'Resetting Database...' : 'Restore Original Seed Data'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
      `}</style>
    </div>
  );
}
