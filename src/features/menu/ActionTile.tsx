import React, { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  label: string;
  hint: string;
  badge?: string | number;
  primary?: boolean;
  onClick: () => void;
}

export function ActionTile({ icon, label, hint, badge, primary, onClick }: Props) {
  const isZero = badge === 0 || badge === '0';

  return (
    <button
      type="button"
      className={`tile ${primary ? 'tile--primary' : ''}`}
      onClick={onClick}
      aria-label={`${label}. ${hint}`}
    >
      <div className="tile__icon-wrapper" aria-hidden="true">
        <span className="tile__icon">{icon}</span>
      </div>
      <div className="tile__copy">
        <span className="tile__label">{label}</span>
        <span className="tile__hint">{hint}</span>
      </div>
      {badge != null && (
        <span
          className={`tile__badge ${isZero ? 'tile__badge--zero' : 'tile__badge--active'}`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
