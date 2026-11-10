import React from 'react';

/**
 * QuotaBar Component
 * Meets Section 13 Accessibility specifications:
 * role="progressbar", aria-valuenow/max, and visible text.
 * Switches colors at 70% (warning amber #B45309) and 90% (critical red #B91C1C).
 */
export function QuotaBar({ used = 0, limit = 1000, label = 'Monthly Usage', showPercentage = true }) {
  const percent = limit > 0 ? Math.min(100, Number(((used / limit) * 100).toFixed(1))) : 0;

  let colorClass = 'quota-normal';
  let badgeText = 'Normal';
  if (percent >= 90) {
    colorClass = 'quota-critical';
    badgeText = 'Critical (≥90%)';
  } else if (percent >= 70) {
    colorClass = 'quota-warning';
    badgeText = 'Warning (≥70%)';
  }

  const accessibleText = `${percent}% used, ${used.toLocaleString()} of ${limit.toLocaleString()} calls`;

  return (
    <div className="quota-bar-wrapper">
      <div className="quota-bar-header">
        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
          <strong>{used.toLocaleString()}</strong> / {limit.toLocaleString()}
          {showPercentage && ` (${percent}%)`}
        </span>
      </div>

      <div
        className="quota-bar-track"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={accessibleText}
      >
        <div
          className={`quota-bar-fill ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
        <span>{accessibleText}</span>
        {percent >= 70 && (
          <span style={{
            color: percent >= 90 ? 'var(--color-error)' : 'var(--color-warning)',
            fontWeight: 600
          }}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}

