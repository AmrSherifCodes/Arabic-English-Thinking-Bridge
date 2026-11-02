import React from 'react';
import { PreferenceField } from './settingsSchema';

interface Props {
  field: PreferenceField;
  value: boolean | string | number;
  isArabic?: boolean;
  onChange: (v: boolean | string | number) => void;
}

export function FieldRenderer({ field, value, isArabic, onChange }: Props) {
  const displayLabel = (isArabic && field.labelAr) ? field.labelAr : field.labelKey;

  switch (field.type) {
    case 'toggle': {
      const isOn = Boolean(value);
      return (
        <div className="pref-row">
          <span className="pref-row__label">{displayLabel}</span>
          <button
            type="button"
            role="switch"
            aria-checked={isOn}
            aria-label={displayLabel}
            className={`pref-toggle ${isOn ? 'is-on' : ''}`}
            onClick={() => onChange(!isOn)}
          >
            <span className="pref-toggle__thumb" />
          </button>
        </div>
      );
    }
    case 'select': {
      return (
        <label className="pref-row">
          <span className="pref-row__label">{displayLabel}</span>
          <select
            className="pref-select"
            value={String(value)}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options.map((o) => {
              const optLabel = (isArabic && o.labelAr) ? o.labelAr : o.label;
              return (
                <option key={String(o.value)} value={String(o.value)}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        </label>
      );
    }
    case 'slider': {
      const numVal = Number(value);
      return (
        <label className="pref-row pref-row--stack">
          <div className="pref-row__header">
            <span className="pref-row__label">{displayLabel}</span>
            <span className="pref-row__value font-mono font-bold text-teal-400 bg-teal-950/70 border border-teal-800/60 px-2 py-0.5 rounded text-xs">
              {numVal.toFixed(1)}×
            </span>
          </div>
          <input
            type="range"
            className="pref-slider"
            min={field.min}
            max={field.max}
            step={field.step}
            value={numVal}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </label>
      );
    }
    case 'text': {
      return (
        <label className="pref-row pref-row--stack">
          <span className="pref-row__label">{displayLabel}</span>
          <input
            type={field.secret ? 'password' : 'text'}
            className="pref-text"
            value={String(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
      );
    }
  }
}
