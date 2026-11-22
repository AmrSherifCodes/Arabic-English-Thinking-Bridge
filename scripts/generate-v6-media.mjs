#!/usr/bin/env node
/**
 * Generates high-DPI V6 Launch Visual Media using local Playwright Chromium (100% offline):
 * - docs/releases/assets/v6-hero-banner.png (1200x675)
 * - docs/releases/assets/v6-carousel-01-cover.png .. 06-cta.png (1080x1350)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'docs', 'releases', 'assets');

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0A0E13;
    --surface: #111822;
    --surface-2: #162130;
    --border: rgba(0, 229, 255, 0.22);
    --border-gold: rgba(245, 183, 0, 0.35);
    --cyan: #00E5FF;
    --emerald: #10B981;
    --gold: #F5B700;
    --ink: #F1F5F9;
    --muted: #94A3B8;
    --sans: 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
    --mono: 'Cascadia Code', 'Consolas', monospace;
  }
  html, body {
    background: var(--bg);
    color: var(--ink);
    font-family: var(--sans);
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
  }
  .bg-grid {
    position: relative;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 14% 16%, rgba(0, 229, 255, 0.16), transparent 44%),
      radial-gradient(circle at 86% 84%, rgba(245, 183, 0, 0.14), transparent 45%),
      radial-gradient(circle at 75% 22%, rgba(16, 185, 129, 0.10), transparent 36%),
      linear-gradient(180deg, #090D12 0%, #0D1520 100%);
  }
  .bg-grid::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(148, 163, 184, 0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(148, 163, 184, 0.045) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.4px;
  }
  .pill-cyan {
    background: rgba(0, 229, 255, 0.12);
    border: 1px solid rgba(0, 229, 255, 0.42);
    color: var(--cyan);
  }
  .pill-gold {
    background: rgba(245, 183, 0, 0.14);
    border: 1px solid rgba(245, 183, 0, 0.45);
    color: var(--gold);
  }
  .pill-emerald {
    background: rgba(16, 185, 129, 0.14);
    border: 1px solid rgba(16, 185, 129, 0.45);
    color: #34D399;
  }
  .rtl { direction: rtl; unicode-bidi: isolate; }
`;

function wrapDoc(width, height, bodyHtml, extraCss = '') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  ${BASE_CSS}
  body { width: ${width}px; height: ${height}px; }
  ${extraCss}
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

function buildHeroBannerHtml() {
  const extraCss = `
    .hero-wrap {
      position: relative;
      z-index: 1;
      height: 100%;
      padding: 36px 46px;
      display: grid;
      grid-template-columns: 1.28fr 0.72fr;
      gap: 34px;
      align-items: center;
    }
    .left { display: flex; flex-direction: column; gap: 16px; }
    .badges { display: flex; flex-wrap: wrap; gap: 10px; }
    .h1-en {
      font-size: 46px;
      font-weight: 900;
      line-height: 1.06;
      letter-spacing: -0.8px;
      color: #FFFFFF;
    }
    .h1-en span { color: var(--cyan); }
    .h1-ar {
      font-size: 27px;
      font-weight: 800;
      color: var(--gold);
      line-height: 1.35;
      text-align: left;
    }
    .cyl-strip {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
    }
    .cyl-chip {
      background: rgba(17, 24, 34, 0.92);
      border: 1px solid rgba(0, 229, 255, 0.25);
      border-radius: 12px;
      padding: 8px 6px;
      text-align: center;
    }
    .cyl-chip .code { font-family: var(--mono); font-size: 15px; font-weight: 900; color: #FFFFFF; }
    .cyl-chip .bcp { font-family: var(--mono); font-size: 11px; color: var(--cyan); margin-top: 2px; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .metric {
      background: rgba(17, 24, 34, 0.9);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 16px;
      padding: 13px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .metric .val {
      font-family: var(--mono);
      font-size: 22px;
      font-weight: 900;
      color: var(--emerald);
      min-width: 96px;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .metric.gold .val { color: var(--gold); }
    .metric.cyan .val { color: var(--cyan); }
    .metric .lbl { font-size: 14px; font-weight: 700; color: var(--ink); line-height: 1.25; }
    .metric .sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(148, 163, 184, 0.16);
      padding-top: 12px;
      font-size: 13px;
      color: var(--muted);
    }
    .foot strong { color: var(--cyan); font-family: var(--mono); }

    .phone {
      height: 585px;
      background: #06090E;
      border-radius: 36px;
      border: 3px solid rgba(0, 229, 255, 0.45);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(0, 229, 255, 0.14);
      padding: 16px 18px 18px 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .notch {
      width: 108px;
      height: 14px;
      background: #141D2B;
      border-radius: 999px;
      margin: 0 auto 4px auto;
    }
    .p-banner {
      background: #101A28;
      border: 1px solid rgba(0, 229, 255, 0.25);
      border-radius: 14px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 800;
    }
    .p-card {
      background: #111927;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 16px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .p-ar-prompt {
      font-size: 24px;
      font-weight: 900;
      color: #FFFFFF;
      text-align: right;
    }
    .p-chips { display: flex; flex-wrap: wrap; gap: 7px; }
    .p-chip {
      background: #1A2738;
      border: 1px solid rgba(0, 229, 255, 0.35);
      color: #E2E8F0;
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
    }
    .p-feedback {
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(16, 185, 129, 0.5);
      border-radius: 14px;
      padding: 11px 13px;
      color: #6EE7B7;
      font-size: 14px;
      font-weight: 800;
      text-align: right;
    }
    .p-dict {
      margin-top: auto;
      background: #0F1724;
      border: 1px solid rgba(245, 183, 0, 0.35);
      border-radius: 14px;
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .p-dict-word { font-size: 18px; font-weight: 900; color: var(--gold); }
    .p-dict-sub { font-size: 12px; color: var(--muted); }
    .p-dict-badge {
      background: rgba(245, 183, 0, 0.16);
      color: var(--gold);
      font-family: var(--mono);
      font-size: 12px;
      font-weight: 800;
      padding: 6px 12px;
      border-radius: 999px;
      white-space: nowrap;
      flex-shrink: 0;
    }
  `;

  const body = `
    <div class="bg-grid">
      <div class="hero-wrap">
        <div class="left">
          <div class="badges">
            <span class="pill pill-cyan">THINKING BRIDGE V6 · v6.0.0</span>
            <span class="pill pill-emerald">100% OFFLINE · 0 ADS · ∞ HEARTS</span>
          </div>
          <div>
            <div class="h1-en">The <span>Six-Cylinder</span><br />Release is Here.</div>
            <div class="h1-ar rtl" style="margin-top: 8px;">فكّر بالإنجليزي (و٥ لغات) — محرك الستة سلندر</div>
          </div>
          <div class="cyl-strip">
            <div class="cyl-chip"><div class="code">EN</div><div class="bcp">en-US</div></div>
            <div class="cyl-chip"><div class="code">DE</div><div class="bcp">de-DE</div></div>
            <div class="cyl-chip"><div class="code">FR</div><div class="bcp">fr-FR</div></div>
            <div class="cyl-chip"><div class="code">ES</div><div class="bcp">es-ES</div></div>
            <div class="cyl-chip"><div class="code">TR</div><div class="bcp">tr-TR</div></div>
            <div class="cyl-chip" style="border-color: rgba(245,183,0,0.45)"><div class="code" style="color:var(--gold)">AR/ARZ</div><div class="bcp" style="color:var(--gold)">ar-EG</div></div>
          </div>
          <div class="metrics">
            <div class="metric">
              <div class="val">0</div>
              <div>
                <div class="lbl">Gloss & Grammar Leaks</div>
                <div class="sub">Zero Wiktionary/EN noise in Arabic hints</div>
              </div>
            </div>
            <div class="metric gold">
              <div class="val">10/10</div>
              <div>
                <div class="lbl">Smart Dictionary Top-1</div>
                <div class="sub">Exact translation #1 across all 5 languages</div>
              </div>
            </div>
            <div class="metric cyan">
              <div class="val">&lt;1s</div>
              <div>
                <div class="lbl">O(1) Indexed Gloss Engine</div>
                <div class="sub">Slashed 50k-entry audit from ~66s → &lt;1s</div>
              </div>
            </div>
            <div class="metric">
              <div class="val">365/365</div>
              <div>
                <div class="lbl">Tests &amp; Honor 400 Dyno</div>
                <div class="sub">0 CDP errors · 0 overflow at 150% font scale</div>
              </div>
            </div>
          </div>
          <div class="foot">
            <span>Live PWA &amp; APK: <strong>https://tb-eg.vercel.app</strong></span>
            <span>AGPLv3 · CC BY-NC-SA 4.0 · Alexandria, EG</span>
          </div>
        </div>

        <div class="phone">
          <div class="notch"></div>
          <div class="p-banner">
            <span style="color: #34D399;">❤️ ∞ &nbsp;·&nbsp; Offline Ready</span>
            <span class="rtl" style="color: var(--cyan);">عامية مصرية ◄ الإنجليزية</span>
          </div>
          <div class="p-card">
            <div style="font-size: 12px; color: var(--muted); font-family: var(--mono); display:flex; justify-content:space-between;">
              <span>LESSON 01 · STRUCTURE BRIDGE</span>
              <span style="color:var(--gold)">V6 DYNO</span>
            </div>
            <div class="p-ar-prompt rtl">أهلاً، إزيك؟</div>
            <div style="font-size: 13px; color: var(--muted); text-align: right;" class="rtl">رتّب الجملة مباشرة بالعقل الإنجليزي:</div>
            <div class="p-chips">
              <span class="p-chip">Hello</span>
              <span class="p-chip">how</span>
              <span class="p-chip">are</span>
              <span class="p-chip">you</span>
              <span class="p-chip">?</span>
            </div>
          </div>
          <div class="p-feedback rtl">
            ✓ ممتاز! إجابة مضبوطة من غير ترجمة حرفية
          </div>
          <div class="p-card" style="padding: 11px 14px;">
            <div style="font-size: 12px; color: var(--muted); display:flex; justify-content:space-between;">
              <span>Honor 400 Track Telemetry</span>
              <span style="color:var(--emerald); font-family:var(--mono); font-weight:800;">PASS</span>
            </div>
            <div style="font-family:var(--mono); font-size:12px; color:#CBD5E1; line-height:1.5;">
              150% Font Scale → Overflow: false<br/>
              WebView CDP / CSP Errors: 0
            </div>
          </div>
          <div class="p-dict">
            <div>
              <div class="p-dict-word">water · ماء</div>
              <div class="p-dict-sub">Clean audio: en-US · de-DE · fr-FR · es-ES · tr-TR</div>
            </div>
            <span class="p-dict-badge">#1 TOP-1</span>
          </div>
        </div>
      </div>
    </div>
  `;
  return wrapDoc(1200, 675, body, extraCss);
}

function buildCarouselSlideHtml({ indexLabel, badgeText, badgeTone = 'cyan', titleEn, titleAr, subtitleEn, bodyHtml, footerNote }) {
  const extraCss = `
    .slide {
      position: relative;
      z-index: 1;
      height: 100%;
      padding: 58px 64px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      font-family: var(--mono);
      font-size: 18px;
      font-weight: 900;
      color: var(--ink);
      letter-spacing: 0.6px;
    }
    .brand span { color: var(--cyan); }
    .step-num {
      font-family: var(--mono);
      font-size: 20px;
      font-weight: 900;
      color: var(--gold);
      background: rgba(245, 183, 0, 0.12);
      border: 1px solid rgba(245, 183, 0, 0.4);
      padding: 8px 18px;
      border-radius: 999px;
    }
    .header-block { margin-top: 28px; }
    .title-en {
      font-size: 56px;
      font-weight: 900;
      line-height: 1.08;
      letter-spacing: -1px;
      color: #FFFFFF;
      margin-top: 18px;
    }
    .title-ar {
      font-size: 36px;
      font-weight: 800;
      color: var(--gold);
      margin-top: 14px;
      line-height: 1.35;
      text-align: left;
    }
    .sub-en {
      font-size: 22px;
      color: var(--muted);
      margin-top: 14px;
      line-height: 1.45;
    }
    .center-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 20px;
      margin: 26px 0;
    }
    .card {
      background: rgba(17, 24, 34, 0.92);
      border: 1px solid rgba(0, 229, 255, 0.25);
      border-radius: 24px;
      padding: 28px 30px;
    }
    .footbar {
      border-top: 1px solid rgba(148, 163, 184, 0.2);
      padding-top: 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 18px;
      color: var(--muted);
    }
    .footbar .url {
      font-family: var(--mono);
      font-weight: 900;
      color: var(--cyan);
      font-size: 20px;
    }
  `;

  const body = `
    <div class="bg-grid">
      <div class="slide">
        <div>
          <div class="topbar">
            <div class="brand">THINKING BRIDGE <span>V6 · v6.0.0</span></div>
            <div class="step-num">${indexLabel} / 06</div>
          </div>
          <div class="header-block">
            <span class="pill pill-${badgeTone}" style="font-size: 15px; padding: 9px 18px;">${badgeText}</span>
            <div class="title-en">${titleEn}</div>
            <div class="title-ar rtl">${titleAr}</div>
            ${subtitleEn ? `<div class="sub-en">${subtitleEn}</div>` : ''}
          </div>
        </div>

        <div class="center-area">
          ${bodyHtml}
        </div>

        <div class="footbar">
          <span class="url">https://tb-eg.vercel.app</span>
          <span class="rtl">${footerNote}</span>
        </div>
      </div>
    </div>
  `;

  return wrapDoc(1080, 1350, body, extraCss);
}

const SLIDES = [
  {
    file: 'v6-hero-banner.png',
    width: 1200,
    height: 675,
    html: buildHeroBannerHtml(),
  },
  {
    file: 'v6-carousel-01-cover.png',
    width: 1080,
    height: 1350,
    html: buildCarouselSlideHtml({
      indexLabel: '01',
      badgeText: '🏎️ THE SIX-CYLINDER RELEASE',
      badgeTone: 'cyan',
      titleEn: 'Built Like a V6.<br/>Zero Bloat. Zero Ads.',
      titleAr: 'فكّر بالإنجليزي — محرك الستة سلندر',
      subtitleEn: 'Think directly in English, German, French, Spanish & Turkish from Arabic without internet or paywalls.',
      footerNote: 'اسحب عشان تشوف الـ 6 سلندرات ◄',
      bodyHtml: `
        <div class="card" style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 18px;">
          <div style="background:#0C131D; border:1px solid rgba(0,229,255,0.2); border-radius:16px; padding:22px;">
            <div style="font-family:var(--mono); font-size:44px; font-weight:900; color:var(--cyan);">5 + AR</div>
            <div style="font-size:19px; font-weight:800; margin-top:6px;">Top Target Languages Verified</div>
            <div style="font-size:15px; color:var(--muted); margin-top:4px;">EN · DE · FR · ES · TR</div>
          </div>
          <div style="background:#0C131D; border:1px solid rgba(16,185,129,0.3); border-radius:16px; padding:22px;">
            <div style="font-family:var(--mono); font-size:44px; font-weight:900; color:var(--emerald);">100%</div>
            <div style="font-size:19px; font-weight:800; margin-top:6px;">Offline-First Engine</div>
            <div style="font-size:15px; color:var(--muted); margin-top:4px;">Web PWA + Signed Android APK</div>
          </div>
          <div style="background:#0C131D; border:1px solid rgba(245,183,0,0.3); border-radius:16px; padding:22px;">
            <div style="font-family:var(--mono); font-size:44px; font-weight:900; color:var(--gold);">❤️ ∞</div>
            <div style="font-size:19px; font-weight:800; margin-top:6px;">Unlimited Free Hearts</div>
            <div style="font-size:15px; color:var(--muted); margin-top:4px;">Zero ads, zero paywalls, zero tracking</div>
          </div>
          <div style="background:#0C131D; border:1px solid rgba(0,229,255,0.2); border-radius:16px; padding:22px;">
            <div style="font-family:var(--mono); font-size:44px; font-weight:900; color:#FFFFFF;">365/365</div>
            <div style="font-size:19px; font-weight:800; margin-top:6px;">Automated Tests Green</div>
            <div style="font-size:15px; color:var(--muted); margin-top:4px;">Track-tested on Honor 400</div>
          </div>
        </div>
      `,
    }),
  },
  {
    file: 'v6-carousel-02-cyl1.png',
    width: 1080,
    height: 1350,
    html: buildCarouselSlideHtml({
      indexLabel: '02',
      badgeText: 'CYLINDER 01 · CURRICULUM & DIALECT ROUTING',
      badgeTone: 'cyan',
      titleEn: 'Top-5 Languages.<br/>Zero Leaks.',
      titleAr: '٥ لغات رئيسية + كل اللهجات العربية',
      subtitleEn: 'Normalized Arabic source routing across ar, arz (Egyptian), apc, afb, ary & ar-*.',
      footerNote: 'Cylinder 02 التالي: سرعة البحث ◄',
      bodyHtml: `
        <div class="card" style="display:flex; flex-direction:column; gap:14px;">
          ${[
            ['EN', 'English', 'en-US', 'PHASES_DATA routed cleanly for arz & ar'],
            ['DE', 'Deutsch', 'de-DE', 'V2 word-order + Accusative bridge verified'],
            ['FR', 'Français', 'fr-FR', 'Arabic dialect guard fixed — zero EN leaks'],
            ['ES', 'Español', 'es-ES', 'Purged EN/RU/ZH strings in hints & rules'],
            ['TR', 'Türkçe', 'tr-TR', 'SOV sentence structure + clean Turkish glosses'],
          ]
            .map(
              ([code, name, bcp, note]) => `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#0C131D; border:1px solid rgba(148,163,184,0.18); border-radius:16px; padding:18px 22px;">
              <div style="display:flex; align-items:center; gap:18px;">
                <span style="font-family:var(--mono); font-size:22px; font-weight:900; color:var(--cyan); background:rgba(0,229,255,0.1); border:1px solid rgba(0,229,255,0.3); padding:8px 14px; border-radius:12px;">${code}</span>
                <div>
                  <div style="font-size:22px; font-weight:800; color:#FFF;">${name} <span style="font-family:var(--mono); font-size:15px; color:var(--muted);">(${bcp})</span></div>
                  <div style="font-size:15px; color:var(--muted); margin-top:2px;">${note}</div>
                </div>
              </div>
              <span style="font-family:var(--mono); font-size:16px; font-weight:900; color:var(--emerald);">0 LEAKS ✓</span>
            </div>`
            )
            .join('')}
        </div>
      `,
    }),
  },
  {
    file: 'v6-carousel-03-cyl2.png',
    width: 1080,
    height: 1350,
    html: buildCarouselSlideHtml({
      indexLabel: '03',
      badgeText: 'CYLINDER 02 · PERFORMANCE & LEXICAL HYGIENE',
      badgeTone: 'gold',
      titleEn: 'O(1) Gloss Map.<br/>~66s Slashed to &lt;1s.',
      titleAr: 'فهرس فوري O(1) بلا تسريبات ويكشنري',
      subtitleEn: 'Replaced 50,000-entry linear dictionary scans with an indexed cache and strict Wiktionary metadata filters.',
      footerNote: 'Cylinder 03 التالي: القاموس الذكي ◄',
      bodyHtml: `
        <div class="card" style="display:flex; flex-direction:column; gap:20px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
            <div style="background:rgba(244,63,94,0.08); border:1px solid rgba(244,63,94,0.35); border-radius:18px; padding:24px;">
              <div style="font-size:14px; font-weight:800; color:#FDA4AF; font-family:var(--mono);">BEFORE V6 · LINEAR SCAN</div>
              <div style="font-size:52px; font-weight:900; font-family:var(--mono); color:#FB7185; margin:10px 0;">~66s</div>
              <div style="font-size:16px; color:#E2E8F0; line-height:1.5;">50k-entry FR/ES scans per check + raw "diminutive of" / "plural of" metadata slips</div>
            </div>
            <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.45); border-radius:18px; padding:24px;">
              <div style="font-size:14px; font-weight:800; color:#6EE7B7; font-family:var(--mono);">AFTER V6 · O(1) INDEX MAP</div>
              <div style="font-size:52px; font-weight:900; font-family:var(--mono); color:var(--emerald); margin:10px 0;">&lt;1s</div>
              <div style="font-size:16px; color:#E2E8F0; line-height:1.5;">Instant wordMap / partMap lookup + clean localized Arabic glosses</div>
            </div>
          </div>
          <div style="background:#0C131D; border:1px solid rgba(0,229,255,0.22); border-radius:18px; padding:22px 24px;">
            <div style="font-family:var(--mono); font-size:15px; color:var(--cyan); font-weight:800; margin-bottom:10px;">PURGED METADATA FILTERS</div>
            <div style="font-family:var(--mono); font-size:16px; color:var(--muted); line-height:1.7;">
              ✓ verbal noun of &nbsp; ✓ plural of &nbsp; ✓ inflection of<br/>
              ✓ diminutive of &nbsp;&nbsp; ✓ alternative form of &nbsp; ✓ participle of
            </div>
          </div>
        </div>
      `,
    }),
  },
  {
    file: 'v6-carousel-04-cyl3.png',
    width: 1080,
    height: 1350,
    html: buildCarouselSlideHtml({
      indexLabel: '04',
      badgeText: 'CYLINDER 03 · SMART DICTIONARY & AUDIO',
      badgeTone: 'emerald',
      titleEn: '10/10 Top-1 Match.<br/>Crystal BCP-47 TTS.',
      titleAr: 'دقة ١٠/١٠ في النتيجة الأولى + نطق نقي',
      subtitleEn: 'Every everyday core concept hits Rank #1 across all 5 languages with duplicate phonetic brackets suppressed.',
      footerNote: 'Cylinder 04–05 التالي: اختبار الهاتف الحقيقي ◄',
      bodyHtml: `
        <div class="card" style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; flex-wrap:wrap; gap:10px;">
            ${['water · ماء', 'book · كتاب', 'house · منزل', 'hello · مرحباً', 'thank you · شكراً', 'friend · صديق', 'time · وقت', 'good · جيد', 'eat · يأكل', 'go · يذهب']
              .map(
                (w) =>
                  `<span class="rtl" style="background:#0C131D; border:1px solid rgba(245,183,0,0.35); color:#F8FAFC; padding:10px 16px; border-radius:12px; font-size:18px; font-weight:800;">${w}</span>`
              )
              .join('')}
          </div>
          <div style="background:#0C131D; border:1px solid rgba(16,185,129,0.4); border-radius:18px; padding:22px 24px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-family:var(--mono); font-size:15px; color:var(--emerald); font-weight:900;">TOP-1 DICTIONARY SCORE</div>
              <div style="font-size:20px; color:#E2E8F0; margin-top:6px;">water / Wasser / eau / agua / su</div>
            </div>
            <div style="font-family:var(--mono); font-size:42px; font-weight:900; color:var(--emerald);">50/50</div>
          </div>
          <div style="background:#0C131D; border:1px solid rgba(0,229,255,0.22); border-radius:18px; padding:20px 24px; font-size:17px; color:var(--muted); line-height:1.55;">
            ✓ Suppressed noisy <code style="color:var(--gold); font-family:var(--mono);">([word])</code> duplicate brackets<br/>
            ✓ Verified clean target audio string &amp; strict BCP-47 locale per language
          </div>
        </div>
      `,
    }),
  },
  {
    file: 'v6-carousel-05-cyl4-5.png',
    width: 1080,
    height: 1350,
    html: buildCarouselSlideHtml({
      indexLabel: '05',
      badgeText: 'CYLINDERS 04 & 05 · REAL DEVICE DYNO (HONOR 400)',
      badgeTone: 'cyan',
      titleEn: 'Track-Tested Over<br/>Live WebView CDP.',
      titleAr: 'اختبار حي على Honor 400 حتى تكبير ١٥٠٪',
      subtitleEn: 'Swept all 5 languages live on Android hardware with Chrome DevTools Protocol + Release APK cold-launch check.',
      footerNote: 'Slide 06 التالي: التحميل والاستخدام ◄',
      bodyHtml: `
        <div class="card" style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
          ${[
            ['0 Errors', 'Live CDP / CSP / Logcat', 'Added safeVibrate user-activation guard to silence Chromium interventions'],
            ['150% Scale', '0 Horizontal Overflow', 'Verified scrollWidth === innerWidth and 0 truncated language spans'],
            ['48px+ UI', 'Upgraded Touch Targets', 'Every toggle, modal control, and chip across PathView & LessonRunner'],
            ['RTL Fixed', 'Natural Arabic Grammar', 'Fixed preposition phrasing & rotate-180 arrows in LanguagePairBanner'],
          ]
            .map(
              ([big, head, desc]) => `
            <div style="background:#0C131D; border:1px solid rgba(0,229,255,0.22); border-radius:18px; padding:22px;">
              <div style="font-family:var(--mono); font-size:32px; font-weight:900; color:var(--cyan);">${big}</div>
              <div style="font-size:20px; font-weight:800; color:#FFF; margin-top:8px;">${head}</div>
              <div style="font-size:15px; color:var(--muted); margin-top:6px; line-height:1.45;">${desc}</div>
            </div>`
            )
            .join('')}
        </div>
      `,
    }),
  },
  {
    file: 'v6-carousel-06-cta.png',
    width: 1080,
    height: 1350,
    html: buildCarouselSlideHtml({
      indexLabel: '06',
      badgeText: 'CYLINDER 06 · DRIVE IT FREE FOREVER',
      badgeTone: 'gold',
      titleEn: 'Install PWA or Grab<br/>the Signed V6 APK.',
      titleAr: 'شغّله من المتصفح أو حمّل الأندرويد مجاناً',
      subtitleEn: '100% open-source · Offline-first · Crafted in Alexandria, Egypt 🇪🇬 by Amr Sherif Abdelaal.',
      footerNote: 'جرّبه دلوقتي وشاركه مع صحابك 🚀',
      bodyHtml: `
        <div class="card" style="display:flex; flex-direction:column; gap:18px;">
          <div style="background:linear-gradient(135deg, rgba(0,229,255,0.16), rgba(16,185,129,0.14)); border:2px solid var(--cyan); border-radius:20px; padding:28px;">
            <div style="font-size:16px; font-weight:900; color:var(--cyan); font-family:var(--mono);">WEB APP &amp; OFFLINE PWA (INSTANT LAUNCH)</div>
            <div style="font-size:40px; font-weight:900; font-family:var(--mono); color:#FFFFFF; margin-top:8px;">tb-eg.vercel.app</div>
          </div>
          <div style="background:#0C131D; border:1px solid rgba(245,183,0,0.4); border-radius:20px; padding:24px;">
            <div style="font-size:15px; font-weight:900; color:var(--gold); font-family:var(--mono);">SIGNED ANDROID APK (versionCode 6000 · 105.95 MB)</div>
            <div style="font-size:21px; font-weight:800; color:#FFFFFF; margin-top:6px;">ThinkingBridge-v6.0.0.apk</div>
            <div style="font-size:14px; font-family:var(--mono); color:var(--muted); margin-top:8px; word-break:break-all;">
              github.com/AmrSherifCodes/Arabic-English-Thinking-Bridge/releases/tag/v6.0.0
            </div>
          </div>
          <div style="background:#0C131D; border:1px solid rgba(148,163,184,0.22); border-radius:18px; padding:20px 24px; font-size:16px; color:var(--muted); line-height:1.55;">
            🛡️ <strong style="color:#E2E8F0;">3-Tier Anti-Theft License:</strong> Software under <strong style="color:var(--cyan);">GNU AGPLv3</strong> · Educational Content under <strong style="color:var(--emerald);">CC BY-NC-SA 4.0</strong>
          </div>
        </div>
      `,
    }),
  },
];

function resolveExecutablePath() {
  try {
    const defaultExe = chromium.executablePath();
    if (defaultExe && fs.existsSync(defaultExe)) return defaultExe;
  } catch {}

  const msPlaywrightDir = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (msPlaywrightDir && fs.existsSync(msPlaywrightDir)) {
    const entries = fs.readdirSync(msPlaywrightDir, { withFileTypes: true }).filter((d) => d.isDirectory());
    const candidates = [
      (dir) => path.join(msPlaywrightDir, dir, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'),
      (dir) => path.join(msPlaywrightDir, dir, 'chrome-win64', 'chrome.exe'),
      (dir) => path.join(msPlaywrightDir, dir, 'chrome-win', 'chrome.exe'),
    ];
    for (const dirEntry of entries.sort((a, b) => b.name.localeCompare(a.name))) {
      for (const mkPath of candidates) {
        const exe = mkPath(dirEntry.name);
        if (fs.existsSync(exe)) return exe;
      }
    }
  }

  for (const sysExe of [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ]) {
    if (fs.existsSync(sysExe)) return sysExe;
  }
  return undefined;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const executablePath = resolveExecutablePath();
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  try {
    const context = await browser.newContext({ deviceScaleFactor: 1 });
    const page = await context.newPage();

    for (const item of SLIDES) {
      await page.setViewportSize({ width: item.width, height: item.height });
      await page.setContent(item.html, { waitUntil: 'load' });
      const outPath = path.join(OUT_DIR, item.file);
      await page.screenshot({ path: outPath, type: 'png' });
      const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`Generated ${item.file} (${item.width}x${item.height}, ${sizeKb} KB)`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
