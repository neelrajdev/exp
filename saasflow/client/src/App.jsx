import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Tenants } from './pages/Tenants';
import { TenantDetail } from './pages/TenantDetail';
import { MyApi } from './pages/MyApi';
import { Playground } from './pages/Playground';
import { Billing } from './pages/Billing';
import { InvoiceDetail } from './pages/InvoiceDetail';
import { Plans } from './pages/Plans';
import { AccessDenied } from './pages/AccessDenied';
import { DualLimiterSandbox } from './components/DualLimiterSandbox';
import { TestRunnerPage } from './pages/TestRunnerPage';

function AppContent() {
  const { session } = useAuth();
  const [activePage, setActivePage] = useState('login');
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [playgroundKey, setPlaygroundKey] = useState('');

  // Handle route defaults when role changes
  useEffect(() => {
    if (!session) {
      setActivePage('login');
    } else {
      if (session.role === 'founder') setActivePage('overview');
      else if (session.role === 'consumer') setActivePage('my-api');
      else if (session.role === 'finance') setActivePage('billing');
    }
  }, [session?.role]);

  // Role Permissions Guard Matrix (Criterion 7)
  const role = session?.role;
  const isAllowed = (page) => {
    if (page === 'login' || page === 'plans' || page === 'sandbox' || page === 'tests') return true;
    if (!role) return false;
    if (role === 'founder') return true; // Founder has broad operational visibility
    if (role === 'consumer') {
      return ['my-api', 'playground', 'plans', 'sandbox', 'tests'].includes(page);
    }
    if (role === 'finance') {
      return ['billing', 'invoice-detail', 'plans', 'sandbox', 'tests'].includes(page);
    }
    return false;
  };

  const navigateTo = (page) => {
    setActivePage(page);
    window.scrollTo(0, 0);
  };

  const handleSelectTenant = (id) => {
    setSelectedTenantId(id);
    navigateTo('tenant-detail');
  };

  const handleSelectInvoice = (id) => {
    setSelectedInvoiceId(id);
    navigateTo('invoice-detail');
  };

  const handleTestInPlayground = (key) => {
    setPlaygroundKey(key);
    navigateTo('playground');
  };

  // Guard Check
  const pageAllowed = isAllowed(activePage);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activePage={activePage} setActivePage={navigateTo} />

      <main className="app-container" style={{ flex: 1 }}>
        {!pageAllowed ? (
          <AccessDenied onNavigate={navigateTo} attemptedPage={activePage} />
        ) : (
          <>
            {activePage === 'login' && <Login onLoginSuccess={() => {}} />}
            {activePage === 'overview' && (
              <Overview
                onSelectTenant={handleSelectTenant}
                onNavigate={navigateTo}
              />
            )}
            {activePage === 'tenants' && (
              <Tenants onSelectTenant={handleSelectTenant} />
            )}
            {activePage === 'tenant-detail' && (
              <TenantDetail
                tenantId={selectedTenantId || 'tenant-shopkart'}
                onBack={() => navigateTo('tenants')}
                onTestInPlayground={handleTestInPlayground}
              />
            )}
            {activePage === 'my-api' && (
              <MyApi onOpenPlayground={handleTestInPlayground} />
            )}
            {activePage === 'playground' && (
              <Playground initialApiKey={playgroundKey} />
            )}
            {activePage === 'billing' && (
              <Billing onSelectInvoice={handleSelectInvoice} />
            )}
            {activePage === 'invoice-detail' && (
              <InvoiceDetail
                invoiceId={selectedInvoiceId || 'inv_tenant-shopkart_2026_10'}
                onBack={() => navigateTo('billing')}
              />
            )}
            {activePage === 'plans' && <Plans />}
            {activePage === 'sandbox' && <DualLimiterSandbox />}
            {activePage === 'tests' && <TestRunnerPage />}
          </>
        )}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', padding: '1.25rem 1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        <p>
          <strong>SaaSFlow PST_PD_004</strong> · Simulated API Usage, Rate Limiting & Billing Console
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
          OJT Engineering Team: <strong>Neel Raj</strong> & <strong>Divyanshu Baghel</strong> · Stack: React + Express + MongoDB
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

