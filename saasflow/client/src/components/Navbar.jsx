import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Zap,
  Activity,
  Layers,
  Terminal,
  CreditCard,
  Sliders,
  CheckCircle,
  RotateCcw,
  LogOut,
  Menu,
  X,
  Play,
  Square,
  ChevronDown,
  UserCheck
} from 'lucide-react';

export function Navbar({ activePage, setActivePage }) {
  const { session, currentTenant, login, logout, resetDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [trafficStatus, setTrafficStatus] = useState({ isRunning: false, stats: { totalGenerated: 0 } });
  const [resetting, setResetting] = useState(false);

  // Poll traffic status
  useEffect(() => {
    let isMounted = true;
    const checkTraffic = async () => {
      try {
        const s = await api.fetchTrafficStatus();
        if (isMounted) setTrafficStatus(s);
      } catch {}
    };
    checkTraffic();
    const interval = setInterval(checkTraffic, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleToggleTraffic = async () => {
    try {
      const updated = await api.toggleTraffic();
      setTrafficStatus(updated);
    } catch (e) {
      alert('Traffic toggle error: ' + e.message);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all demo data back to default seed? (Clears limiter and restores ShopKart 61,250 calls)')) {
      setResetting(true);
      await resetDemo();
      setResetting(false);
      setActivePage('login');
    }
  };

  const role = session?.role;

  const handleQuickRoleSwitch = (newRole, tenantId = null) => {
    setRoleDropdownOpen(false);
    login(newRole, tenantId || 'tenant-shopkart');
    if (newRole === 'founder') setActivePage('overview');
    else if (newRole === 'consumer') setActivePage('my-api');
    else if (newRole === 'finance') setActivePage('billing');
  };

  return (
    <nav style={{
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
    }}>
      <div className="app-container" style={{ padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <div
            onClick={() => setActivePage(role ? (role === 'founder' ? 'overview' : role === 'consumer' ? 'my-api' : 'billing') : 'login')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', textDecoration: 'none' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              color: '#FFFFFF',
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)'
            }}>
              <Zap size={19} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
                  SaaSFlow
                </span>
                <span style={{ fontSize: '0.68rem', backgroundColor: '#EEF2FF', color: 'var(--color-primary)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                  PRO
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          {session && (
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {role === 'founder' && (
                <>
                  <button
                    onClick={() => setActivePage('overview')}
                    className={`btn ${activePage === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <Activity size={15} /> Overview
                  </button>
                  <button
                    onClick={() => setActivePage('tenants')}
                    className={`btn ${activePage === 'tenants' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <Layers size={15} /> Tenants
                  </button>
                </>
              )}

              {role === 'consumer' && (
                <button
                  onClick={() => setActivePage('my-api')}
                  className={`btn ${activePage === 'my-api' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <Layers size={15} /> My API
                </button>
              )}

              {(role === 'founder' || role === 'consumer') && (
                <button
                  onClick={() => setActivePage('playground')}
                  className={`btn ${activePage === 'playground' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <Terminal size={15} /> Playground
                </button>
              )}

              {(role === 'finance' || role === 'founder') && (
                <button
                  onClick={() => setActivePage('billing')}
                  className={`btn ${activePage === 'billing' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <CreditCard size={15} /> Billing
                </button>
              )}

              <button
                onClick={() => setActivePage('plans')}
                className={`btn ${activePage === 'plans' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                Plans
              </button>

              <button
                onClick={() => setActivePage('sandbox')}
                className={`btn ${activePage === 'sandbox' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                <Sliders size={15} /> Limiter Sandbox
              </button>

              <button
                onClick={() => setActivePage('tests')}
                className={`btn ${activePage === 'tests' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                <CheckCircle size={15} /> Test Suite
              </button>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Live Traffic Simulator Pill */}
          <button
            onClick={handleToggleTraffic}
            className="btn"
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.78rem',
              backgroundColor: trafficStatus.isRunning ? 'var(--color-success-bg)' : '#FFFFFF',
              borderColor: trafficStatus.isRunning ? 'var(--color-success-border)' : 'var(--border-color)',
              color: trafficStatus.isRunning ? 'var(--color-success)' : 'var(--color-text-secondary)',
              boxShadow: trafficStatus.isRunning ? '0 0 10px rgba(16, 185, 129, 0.2)' : 'var(--shadow-subtle)'
            }}
            title="Toggle Live Background Traffic Simulator"
          >
            {trafficStatus.isRunning ? (
              <>
                <span className="pulse-dot" />
                <Square size={12} color="var(--color-success)" />
                <strong>Live Load: ON</strong> ({trafficStatus.stats?.totalGenerated || 0})
              </>
            ) : (
              <>
                <Play size={13} />
                <span>Simulate Traffic</span>
              </>
            )}
          </button>

          {/* Role Status & Quick Switch Dropdown */}
          {session ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: role === 'founder' ? 'var(--color-primary)' : role === 'consumer' ? 'var(--color-success)' : '#D97706'
                }} />
                <strong>
                  {role === 'founder' && 'Arjun (Founder)'}
                  {role === 'consumer' && `Neha (${currentTenant?.name?.split(' ')[0] || 'ShopKart'})`}
                  {role === 'finance' && 'Sameer (Finance)'}
                </strong>
                <ChevronDown size={13} color="var(--color-text-muted)" />
              </button>

              {/* Quick Switch Dropdown Menu */}
              {roleDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  width: '230px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-card-hover)',
                  padding: '0.5rem',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', padding: '0.35rem 0.6rem 0.2rem' }}>
                    Switch Persona Role
                  </p>
                  <button
                    onClick={() => handleQuickRoleSwitch('founder')}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '0.45rem 0.65rem', fontSize: '0.78rem', border: 'none' }}
                  >
                    👤 <strong>Arjun</strong> (Founder Dashboard)
                  </button>
                  <button
                    onClick={() => handleQuickRoleSwitch('consumer', 'tenant-shopkart')}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '0.45rem 0.65rem', fontSize: '0.78rem', border: 'none' }}
                  >
                    🔑 <strong>Neha</strong> (Consumer: ShopKart)
                  </button>
                  <button
                    onClick={() => handleQuickRoleSwitch('consumer', 'tenant-weatherwise')}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '0.45rem 0.65rem', fontSize: '0.78rem', border: 'none' }}
                  >
                    🔑 <strong>Neha</strong> (Consumer: WeatherWise)
                  </button>
                  <button
                    onClick={() => handleQuickRoleSwitch('finance')}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '0.45rem 0.65rem', fontSize: '0.78rem', border: 'none' }}
                  >
                    💼 <strong>Sameer</strong> (Finance & Ledger)
                  </button>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.25rem 0' }} />
                  <button
                    onClick={handleReset}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '0.45rem 0.65rem', fontSize: '0.78rem', border: 'none', color: '#B45309' }}
                  >
                    <RotateCcw size={13} /> Reset Demo Seeds
                  </button>
                  <button
                    onClick={() => { logout(); setActivePage('login'); setRoleDropdownOpen(false); }}
                    className="btn btn-secondary"
                    style={{ justifyContent: 'flex-start', padding: '0.45rem 0.65rem', fontSize: '0.78rem', border: 'none', color: 'var(--color-error)' }}
                  >
                    <LogOut size={13} /> Exit Role
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              Demo Login
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn btn btn-secondary"
            style={{ display: 'none', padding: '0.4rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {session && (
            <>
              {role === 'founder' && (
                <>
                  <button onClick={() => { setActivePage('overview'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><Activity size={16} /> Overview</button>
                  <button onClick={() => { setActivePage('tenants'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><Layers size={16} /> Tenants</button>
                </>
              )}
              {role === 'consumer' && (
                <button onClick={() => { setActivePage('my-api'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><Layers size={16} /> My API</button>
              )}
              {(role === 'founder' || role === 'consumer') && (
                <button onClick={() => { setActivePage('playground'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><Terminal size={16} /> Playground</button>
              )}
              {(role === 'finance' || role === 'founder') && (
                <button onClick={() => { setActivePage('billing'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><CreditCard size={16} /> Billing</button>
              )}
              <button onClick={() => { setActivePage('plans'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>Plans Comparison</button>
              <button onClick={() => { setActivePage('sandbox'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><Sliders size={16} /> Limiter Sandbox</button>
              <button onClick={() => { setActivePage('tests'); setMobileMenuOpen(false); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}><CheckCircle size={16} /> Acceptance Test Suite</button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 991px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  );
}
