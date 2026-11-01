import { ReactNode } from 'react';

interface Props {
  icon: ReactNode; label: string; hint: string;
  badge?: string | number; primary?: boolean; onClick: () => void;
}

export function ActionTile({ icon, label, hint, badge, primary, onClick }: Props) {
  return (
    <button className={`tile ${primary ? 'tile--primary' : ''}`} onClick={onClick}
      aria-label={`${label}. ${hint}`}>
      <span className="tile__icon" aria-hidden>{icon}</span>
      <span className="tile__copy">
        <span className="tile__label">{label}</span>
        <span className="tile__hint">{hint}</span>
      </span>
      {badge != null && <span className="tile__badge">{badge}</span>}
    </button>
  );
}

