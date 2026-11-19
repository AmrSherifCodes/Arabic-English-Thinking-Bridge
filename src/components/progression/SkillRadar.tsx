import React from 'react';
import { SkillLevels, SkillBranch } from '../../progression/types';
import { SKILL_BRANCH_META } from '../../progression/cefrHierarchy';

interface SkillRadarProps {
  skills?: SkillLevels;
  branchData?: Record<SkillBranch, { xp: number; mastery: number }>;
  isArabic?: boolean;
}

export function SkillRadar({ skills, branchData, isArabic = true }: SkillRadarProps) {
  if (branchData) {
    const branches: SkillBranch[] = ['grammar', 'vocabulary', 'pronunciation', 'listening'];
    const size = 180;
    const center = size / 2;
    const radius = 60;
    const angleStep = (2 * Math.PI) / branches.length;

    const points = branches
      .map((branch, i) => {
        const mastery = Math.max(0.05, Math.min(1.0, branchData[branch]?.mastery || 0.05));
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * mastery * Math.cos(angle);
        const y = center + radius * mastery * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');

    const webs = [0.25, 0.5, 0.75, 1.0].map((level) => {
      return branches
        .map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * level * Math.cos(angle);
          const y = center + radius * level * Math.sin(angle);
          return `${x},${y}`;
        })
        .join(' ');
    });

    return (
      <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-[#0B1C33]/95 via-[#0E2746]/90 to-[#081527]/95 border border-cyan-500/30 shadow-lg backdrop-blur-md">
        <h4 className="text-xs font-black text-cyan-300 mb-1 flex items-center gap-1.5">
          <span className="text-amber-400">🎯</span>
          <span>{isArabic ? 'خريطة المهارات الأربعة' : '4-Axis Skill Radar'}</span>
        </h4>
        <svg width={size} height={size} className="overflow-visible">
          {webs.map((webPoints, idx) => (
            <polygon
              key={idx}
              points={webPoints}
              fill="none"
              stroke="rgba(30, 58, 95, 0.8)"
              strokeWidth="1"
              strokeDasharray={idx < 3 ? '2 2' : 'none'}
            />
          ))}

          {branches.map((_, i) => {
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
                stroke="rgba(6, 182, 212, 0.3)"
                strokeWidth="1"
              />
            );
          })}

          <polygon
            points={points}
            fill="rgba(6, 182, 212, 0.3)"
            stroke="#06b6d4"
            strokeWidth="2.5"
          />

          {branches.map((branch, i) => {
            const meta = SKILL_BRANCH_META[branch];
            const data = branchData[branch];
            const pct = Math.round((data?.mastery || 0) * 100);
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 20;
            const lx = center + labelRadius * Math.cos(angle);
            const ly = center + labelRadius * Math.sin(angle);

            return (
              <text
                key={branch}
                x={lx}
                y={ly}
                fill="#38bdf8"
                fontSize="9"
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {isArabic ? meta.labelAr : meta.labelEn} ({pct}%)
              </text>
            );
          })}
        </svg>
      </div>
    );
  }

  // Fallback to classic 5-skill matrix if branchData is not provided
  const axes = [
    { key: 'structure', label: isArabic ? 'البناء' : 'Structure' },
    { key: 'vocabulary', label: isArabic ? 'المفردات' : 'Vocabulary' },
    { key: 'listening', label: isArabic ? 'الاستماع' : 'Listening' },
    { key: 'speaking', label: isArabic ? 'التحدث' : 'Speaking' },
    { key: 'writing', label: isArabic ? 'الكتابة' : 'Writing' },
  ];

  const size = 180;
  const center = size / 2;
  const radius = 60;
  const angleStep = (2 * Math.PI) / axes.length;
  const currentSkills = skills || { structure: 1, vocabulary: 1, listening: 1, speaking: 1, writing: 1 };

  const points = axes
    .map((axis, i) => {
      const val = Math.min(50, Math.max(1, currentSkills[axis.key as keyof SkillLevels] || 1));
      const normalized = val / 50;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + radius * normalized * Math.cos(angle);
      const y = center + radius * normalized * Math.sin(angle);
      return `${x},${y}`;
    })
    .join(' ');

  const webs = [0.25, 0.5, 0.75, 1.0].map((level) => {
    return axes
      .map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + radius * level * Math.cos(angle);
        const y = center + radius * level * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  });

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-900 border border-stone-800">
      <h4 className="text-xs font-bold text-teal-400 mb-1">
        {isArabic ? '📊 خريطة المهارات (1-50)' : '📊 5-Skill Matrix (1-50)'}
      </h4>
      <svg width={size} height={size} className="overflow-visible">
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

        {axes.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#3f3f46" strokeWidth="1" />
          );
        })}

        <polygon points={points} fill="rgba(45, 212, 191, 0.3)" stroke="#2dd4bf" strokeWidth="2" />

        {axes.map((axis, i) => {
          const val = currentSkills[axis.key as keyof SkillLevels] || 1;
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = radius + 18;
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
