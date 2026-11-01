import { ActionTile } from './ActionTile';
import './menu.css';

export type MenuRoute = 'voice' | 'lesson' | 'flashcards' | 'preferences';

export function ChoiceMenu({ dueCards, onSelect }: { dueCards: number; onSelect: (r: MenuRoute) => void }) {
  return (
    <div className="menu">
      <header className="menu__header">
        <h1 className="menu__title">Thinking Bridge</h1>
      </header>
      <nav className="menu__tiles" aria-label="Main menu">
        <ActionTile primary icon="🎙️" label="Voice Practice" hint="Tap to speak with your partner" onClick={() => onSelect('voice')} />
        <ActionTile icon="📖" label="Continue Lesson" hint="Resume your adaptive track" onClick={() => onSelect('lesson')} />
        <ActionTile icon="🗂️" label="Flashcards" hint={`${dueCards} cards due today`} badge={dueCards} onClick={() => onSelect('flashcards')} />
        <ActionTile icon="⚙️" label="Preferences" hint="Voice, speed, and data" onClick={() => onSelect('preferences')} />
      </nav>
    </div>
  );
}

