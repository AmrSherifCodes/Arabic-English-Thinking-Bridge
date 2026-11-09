import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConstitutionModal } from '../ConstitutionModal';

describe('ConstitutionModal', () => {
  it('renders English content by default when isArabic={false}', () => {
    render(<ConstitutionModal isOpen={true} onClose={vi.fn()} isArabic={false} />);
    expect(screen.getByText('Channel Constitution')).toBeInTheDocument();
    expect(screen.getByText(/Ten Rules/i)).toBeInTheDocument();
  });

  it('renders Arabic content when Arabic tab is clicked', () => {
    render(<ConstitutionModal isOpen={true} onClose={vi.fn()} isArabic={false} />);
    fireEvent.click(screen.getByText('العربية'));
    expect(screen.getByText('دستور القناة')).toBeInTheDocument();
    expect(screen.getByText(/القواعد العشر/i)).toBeInTheDocument();
  });
});