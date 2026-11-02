import React from 'react';
import { ActionTile } from './ActionTile';
import { UserRound, ScrollText, Zap, Shield, BookMarked } from 'lucide-react';
import './menu.css';

export type MenuRoute = 'voice' | 'lesson' | 'flashcards' | 'preferences';

export interface ChoiceMenuProps {
  dueCards: number;
  onSelect: (r: MenuRoute) => void;
  onOpenCV?: () => void;
  onOpenConstitution?: () => void;
}

export function ChoiceMenu({
  dueCards,
  onSelect,
  onOpenCV,
  onOpenConstitution,
}: ChoiceMenuProps) {
  return (
    <div className="menu">
      <div className="menu__container">
        {/* 1. Top Badge & Hero */}
        <header className="menu__hero">
          <div className="menu__badge">
            <span>✦ Offline Ready</span>
          </div>
          <h1 className="menu__title">Thinking Bridge</h1>
          <p className="menu__tagline">
            Master English the Smart Way. Learn Egyptian Arabic the Real Way.
          </p>
        </header>

        {/* 2. Stats Strip */}
        <section className="menu__stats-strip" aria-label="Key app features">
          <div className="menu__stat-item">
            <Zap className="menu__stat-icon" />
            <span className="menu__stat-label">100% Free</span>
          </div>
          <div className="menu__stat-divider" />
          <div className="menu__stat-item">
            <Shield className="menu__stat-icon" />
            <span className="menu__stat-label">0% Tracking</span>
          </div>
          <div className="menu__stat-divider" />
          <div className="menu__stat-item">
            <BookMarked className="menu__stat-icon" />
            <span className="menu__stat-label">5,299 Words</span>
          </div>
        </section>

        {/* 3. Quote Banner */}
        <aside className="menu__quote-banner">
          <p className="menu__quote-en">“Think the structure, don't memorize words.”</p>
          <p className="menu__quote-ar" dir="rtl">«افهم بناء الفكرة، مش حفظ الجداول»</p>
        </aside>

        {/* 4. 2-Column Action Grid (CV & Constitution) */}
        <div className="menu__action-grid">
          <button
            type="button"
            onClick={onOpenCV}
            className="menu__sub-btn"
            aria-label="View Creator CV"
          >
            <UserRound className="menu__sub-btn-icon" />
            <span>View CV</span>
          </button>
          <button
            type="button"
            onClick={onOpenConstitution}
            className="menu__sub-btn"
            aria-label="Read Channel Constitution"
          >
            <ScrollText className="menu__sub-btn-icon" />
            <span>Constitution</span>
          </button>
        </div>

        {/* 5. Core Navigation Tiles */}
        <nav className="menu__tiles" aria-label="Main navigation">
          <ActionTile
            primary
            icon="🎙️"
            label="Voice Practice"
            hint="Tap to speak with your partner"
            onClick={() => onSelect('voice')}
          />
          <ActionTile
            icon="📖"
            label="Continue Lesson"
            hint="Resume your adaptive track"
            onClick={() => onSelect('lesson')}
          />
          <ActionTile
            icon="🗂️"
            label="Flashcards"
            hint={`${dueCards} cards due today`}
            badge={dueCards}
            onClick={() => onSelect('flashcards')}
          />
          <ActionTile
            icon="⚙️"
            label="Preferences"
            hint="Voice, speed, and data"
            onClick={() => onSelect('preferences')}
          />
        </nav>

        {/* 6. Two-line Footer */}
        <footer className="menu__footer">
          <p className="menu__footer-line1">
            Crafted in Alexandria, Egypt 🇪🇬
          </p>
          <p className="menu__footer-line2">
            Inspired by Mihalis Eleftheriou · CC0 1.0
          </p>
        </footer>
      </div>
    </div>
  );
}
