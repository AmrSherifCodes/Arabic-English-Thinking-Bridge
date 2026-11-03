import React from 'react';
import { SkillLevels } from '../../progression/types';

interface SkillRadarProps {
  skills: SkillLevels;
  isArabic?: boolean;
}

export function SkillRadar({ skills, isArabic = true }: SkillRadarProps) {
  const axes = [
    { key: 'structure', label: isArabic ? 'البناء والنحو' : 'Structure' },
    { key: 'vocabulary', label: isArabic ? 'المفردات' : 'Vocabulary' },
    { key: 'listening', label: isArabic ? 'الاستماع' : 'Listening' },
    { key: 'speaking', label: isArabic ? 'التحدث' : 'Speaking' },
    { key: 'writing', label: isArabic ? 'الكتابة' : 'Writing' },
  ];

  const size = 200;
  const center = size / 2;
  const radius = 70;
  const angleStep = (2 * Math.PI) / axes.length;

  // Calculate polygon points (max skill level 50)
  const points = axes.map((axis, i) => {
    const val = Math.min(50, Math.max(1, skills[axis.key as keyof SkillLevels] || 1));
    const normalized = val / 50;
    const angle = i * angleStep - Math.PI / 2;
    const x = center + radius * normalized * Math.cos(angle);
    const y = center + radius * normalized * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  // Grid background webs
  const webs = [0.25, 0.5, 0.75, 1.0].map((level) => {
    return axes.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * level * Math.cos(angle);
      const y = center + radius * level * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-stone-900 border border-stone-800">
      <h4 className="text-xs font-bold text-teal-400 mb-2">
        {isArabic ? '📊 خريطة المهارات الخماسية (1-50)' : '📊 5-Skill Radar Matrix (1-50)'}
      </h4>
      <svg width={size} height={size} className="overflow-visible">
        {/* Background Grid Webs */}
        {webs.map((webPoints, idx) => (
          <polygon
            key={idx}
            points={webPoints}
            fill="none"
            stroke="#27272a"
            strokeWidth="1"
            strokeDasharray={idx < 3 ? '2 2' : 'none'}
          />
        ))}

        {/* Axis Lines */}
        {axes.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#3f3f46"
              strokeWidth="1"
            />
          );
        })}

        {/* Skill Value Polygon */}
        <polygon
          points={points}
          fill="rgba(45, 212, 191, 0.3)"
          stroke="#2dd4bf"
          strokeWidth="2.5"
        />

        {/* Labels & Data Points */}
        {axes.map((axis, i) => {
          const val = skills[axis.key as keyof SkillLevels] || 1;
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 22;
          const lx = center + labelRadius * Math.cos(angle);
          const ly = center + labelRadius * Math.sin(angle);

          return (
            <text
              key={axis.key}
              x={lx}
              y={ly}
              fill="#e4e4e7"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {axis.label} ({val})
            </text>
          );
        })}
      </svg>
    </div>
  );
}
