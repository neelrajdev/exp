import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

export function CountdownTimer({ initialSeconds = 23, onComplete }) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [ariaNotice, setAriaNotice] = useState(`Rate limit reached. Retry permitted in ${initialSeconds} seconds.`);

  useEffect(() => {
    setRemaining(initialSeconds);
    setAriaNotice(`Rate limit reached. Retry permitted in ${initialSeconds} seconds.`);

    if (initialSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setAriaNotice('Rate limit cooldown complete. You may now retry your request.');
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [initialSeconds]);

  return (
    <div style={{
      backgroundColor: 'var(--color-error-bg)',
      border: '1px solid rgba(185, 28, 28, 0.3)',
      borderRadius: 'var(--radius-sm)',
      padding: '0.85rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '0.75rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Clock size={20} color="var(--color-error)" />
        <div>
          <strong style={{ color: 'var(--color-error)', fontSize: '0.88rem' }}>
            {remaining > 0 ? `Rate Limit Active: Try again in ${remaining}s` : 'Cooldown Complete! Ready to retry.'}
          </strong>
          <p style={{ fontSize: '0.78rem', color: '#7F1D1D', margin: 0 }}>
            Fixed-window bucket resets automatically when current 60-second window completes.
          </p>
        </div>
      </div>

      {remaining === 0 && (
        <span className="badge badge-success" style={{ gap: '0.25rem' }}>
          <RefreshCw size={12} /> Ready
        </span>
      )}

      {/* Screen Reader Polite Announcement only on start & finish */}
      <span className="sr-only" aria-live="polite" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        {ariaNotice}
      </span>
    </div>
  );
}

