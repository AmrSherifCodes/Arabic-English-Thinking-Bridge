// Copyright (c) 2026 Amr Sherif Abdelaal. All rights reserved.
// Licensed under GNU AGPLv3 (AGPL-3.0-or-later).

import React from 'react';

interface JourneyBiomeBackdropProps {
  totalHeight: number;
}

/**
 * Pure inline SVG 3-Biome Vertical Backdrop for the Winding Journey Map.
 * - Levels 1-3: Coastal Dawn (Mediterranean waves + subtle arch & lighthouse silhouette)
 * - Levels 4-6: Thinking Bridge Horizon (minimal suspension-bridge cables + topographic curves)
 * - Levels 7-10: C1 Mastery Summit (calm geometric mountain ridges + constellation dots)
 *
 * Strictly driven by CSS theme variables (--bg, --surface, --accent, --gold) at low
 * eye-soothing opacities (0.06 - 0.16). Hidden automatically under [data-perf="lite"].
 */
export function JourneyBiomeBackdrop({ totalHeight }: JourneyBiomeBackdropProps) {
  const safeHeight = Math.max(600, totalHeight);

  return (
    <div
      aria-hidden="true"
      className="tb-biome-backdrop absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
      style={{ zIndex: 0 }}
    >
      <svg
        viewBox="0 0 360 1200"
        preserveAspectRatio="none"
        className="tb-biome-svg w-full h-full block"
        style={{ minHeight: `${safeHeight}px` }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="tb-biome-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.11" />
            <stop offset="34%" stopColor="var(--gold)" stopOpacity="0.07" />
            <stop offset="68%" stopColor="var(--accent)" stopOpacity="0.09" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Soft unified vertical wash */}
        <rect x="0" y="0" width="360" height="1200" fill="url(#tb-biome-sky)" />

        {/* ============================================================
            BIOME 1 (y: 0..400): Coastal Dawn — Waves, Arch & Lighthouse
            ============================================================ */}
        <g>
          {/* Warm dawn sun halo */}
          <circle cx="292" cy="74" r="46" fill="var(--gold)" fillOpacity="0.10" />
          <circle cx="292" cy="74" r="24" fill="var(--gold)" fillOpacity="0.12" />

          {/* Subtle Alexandrian lighthouse silhouette (left) */}
          <path
            d="M36 210 L44 128 L56 128 L64 210 Z"
            fill="var(--accent)"
            fillOpacity="0.10"
          />
          <rect x="42" y="114" width="16" height="14" rx="3" fill="var(--gold)" fillOpacity="0.14" />
          <path
            d="M58 118 L126 96 L126 132 L58 124 Z"
            fill="var(--gold)"
            fillOpacity="0.07"
          />

          {/* Subtle coastal arch silhouette (right) */}
          <path
            d="M250 245 V180 A42 42 0 0 1 334 180 V245 H318 V182 A26 26 0 0 0 266 182 V245 Z"
            fill="var(--accent)"
            fillOpacity="0.08"
          />

          {/* Layered Mediterranean waves */}
          <path
            d="M0 240 Q90 212 180 240 T360 240 L360 350 L0 350 Z"
            fill="var(--accent)"
            fillOpacity="0.08"
          />
          <path
            d="M0 282 Q90 256 180 282 T360 282 L360 385 L0 385 Z"
            fill="var(--accent)"
            fillOpacity="0.06"
          />
          <path
            d="M0 326 Q90 304 180 326 T360 326"
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.15"
            strokeWidth="2"
          />
        </g>

        {/* ============================================================
            BIOME 2 (y: 400..800): Thinking Bridge Horizon — Cables & Contours
            ============================================================ */}
        <g>
          {/* Topographic horizon contours */}
          <path
            d="M0 470 C90 432 270 508 360 464"
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.12"
            strokeWidth="1.5"
          />
          <path
            d="M0 510 C110 476 250 544 360 506"
            fill="none"
            stroke="var(--gold)"
            strokeOpacity="0.11"
            strokeWidth="1.5"
          />
          <path
            d="M0 738 C100 704 260 766 360 726"
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.11"
            strokeWidth="1.5"
          />

          {/* Minimal suspension bridge towers */}
          <rect x="74" y="490" width="12" height="170" rx="4" fill="var(--accent)" fillOpacity="0.11" />
          <rect x="274" y="490" width="12" height="170" rx="4" fill="var(--accent)" fillOpacity="0.11" />

          {/* Suspension bridge deck */}
          <line
            x1="0"
            y1="628"
            x2="360"
            y2="628"
            stroke="var(--accent)"
            strokeOpacity="0.16"
            strokeWidth="3"
          />

          {/* Sweeping parabolic main cables */}
          <path
            d="M0 618 Q42 548 80 502 Q180 618 280 502 Q318 548 360 618"
            fill="none"
            stroke="var(--gold)"
            strokeOpacity="0.16"
            strokeWidth="2.5"
          />

          {/* Subtle vertical suspender cables */}
          <g stroke="var(--accent)" strokeOpacity="0.10" strokeWidth="1.2">
            <line x1="112" y1="538" x2="112" y2="628" />
            <line x1="146" y1="564" x2="146" y2="628" />
            <line x1="180" y1="574" x2="180" y2="628" />
            <line x1="214" y1="564" x2="214" y2="628" />
            <line x1="248" y1="538" x2="248" y2="628" />
          </g>
        </g>

        {/* ============================================================
            BIOME 3 (y: 800..1200): C1 Mastery Summit — Ridges & Constellations
            ============================================================ */}
        <g>
          {/* Constellation connecting lines */}
          <path
            d="M52 856 L118 830 L176 868 L244 824 L308 858"
            fill="none"
            stroke="var(--gold)"
            strokeOpacity="0.14"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <path
            d="M84 926 L154 904 L224 934 L286 902"
            fill="none"
            stroke="var(--accent)"
            strokeOpacity="0.12"
            strokeWidth="1.2"
          />

          {/* Constellation star dots */}
          <g fill="var(--gold)" fillOpacity="0.16">
            <circle cx="52" cy="856" r="3" />
            <circle cx="118" cy="830" r="3.5" />
            <circle cx="176" cy="868" r="2.5" />
            <circle cx="244" cy="824" r="4" />
            <circle cx="308" cy="858" r="3" />
            <circle cx="84" cy="926" r="2.5" />
            <circle cx="154" cy="904" r="3" />
            <circle cx="224" cy="934" r="2.5" />
            <circle cx="286" cy="902" r="3.5" />
          </g>

          {/* Calm layered geometric mountain ridges */}
          <path
            d="M0 1070 L78 968 L156 1044 L236 942 L318 1034 L360 996 L360 1200 L0 1200 Z"
            fill="var(--accent)"
            fillOpacity="0.08"
          />
          <path
            d="M0 1122 L96 1026 L186 1094 L274 1004 L360 1086 L360 1200 L0 1200 Z"
            fill="var(--gold)"
            fillOpacity="0.08"
          />
          <path
            d="M0 1164 L112 1084 L212 1142 L302 1072 L360 1126 L360 1200 L0 1200 Z"
            fill="var(--accent)"
            fillOpacity="0.11"
          />
        </g>
      </svg>
    </div>
  );
}
