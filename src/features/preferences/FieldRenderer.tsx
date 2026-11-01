import { PreferenceField } from './settingsSchema';

interface Props {
  field: PreferenceField;
  value: boolean | string | number;
  onChange: (v: boolean | string | number) => void;
}

export function FieldRenderer({ field, value, onChange }: Props) {
  switch (field.type) {
    case 'toggle':
      return (
        <label className="pref-row">
          <span className="pref-row__label">{field.labelKey}</span>
          <button type="button" role="switch" aria-checked={Boolean(value)}
            className={`pref-toggle ${value ? 'is-on' : ''}`}
            onClick={() => onChange(!value)}>
            <span className="pref-toggle__thumb" />
          </button>
        </label>
      );
    case 'select':
      return (
        <label className="pref-row">
          <span className="pref-row__label">{field.labelKey}</span>
          <select className="pref-select" value={String(value)}
            onChange={(e) => onChange(e.target.value)}>
            {field.options.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
            ))}
          </select>
        </label>
      );
    case 'slider':
      return (
        <label className="pref-row pref-row--stack">
          <div className="pref-row__header">
            <span className="pref-row__label">{field.labelKey}</span>
            <span className="pref-row__value">{Number(value).toFixed(1)}×</span>
          </div>
          <input type="range" className="pref-slider" min={field.min} max={field.max}
            step={field.step} value={Number(value)}
            onChange={(e) => onChange(Number(e.target.value))} />
        </label>
      );
    case 'text':
      return (
        <label className="pref-row pref-row--stack">
          <span className="pref-row__label">{field.labelKey}</span>
          <input type={field.secret ? 'password' : 'text'} className="pref-text"
            value={String(value)} placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)} />
        </label>
      );
  }
}

