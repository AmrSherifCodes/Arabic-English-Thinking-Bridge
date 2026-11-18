import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OnboardingFlow } from './OnboardingFlow';

describe('OnboardingFlow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the first step and navigates to the next step', () => {
    const handleComplete = vi.fn();
    render(<OnboardingFlow onComplete={handleComplete} />);

    // First step
    expect(screen.getByText('فكّر بالإنجليزي، مش تترجم')).toBeDefined();

    // Click next
    const nextBtn = screen.getByText('التالي');
    fireEvent.click(nextBtn);

    // Second step should appear
    expect(screen.getByText('الدروس الهيكلية التفاعلية')).toBeDefined();

    // Complete shouldn't be called yet
    expect(handleComplete).not.toHaveBeenCalled();
    expect(localStorage.getItem('tb.onboardingComplete')).toBeNull();
  });

  it('skip button calls onComplete and sets localStorage flag', () => {
    const handleComplete = vi.fn();
    render(<OnboardingFlow onComplete={handleComplete} />);

    const skipBtn = screen.getByText('تخطي المقدمة');
    fireEvent.click(skipBtn);

    expect(handleComplete).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('tb.onboardingComplete')).toBe('true');
  });

  it('navigates through all steps, sets localStorage flag, and calls onComplete at the end', () => {
    const handleComplete = vi.fn();
    render(<OnboardingFlow onComplete={handleComplete} />);

    // Step 1
    fireEvent.click(screen.getByText('التالي'));
    // Step 2
    fireEvent.click(screen.getByText('التالي'));
    // Step 3
    fireEvent.click(screen.getByText('التالي'));

    // Step 4
    expect(screen.getByText('نظام المراجعة الذكي (SRS)')).toBeDefined();

    const startBtn = screen.getByText('ابدأ رحلتك');
    fireEvent.click(startBtn);

    expect(handleComplete).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('tb.onboardingComplete')).toBe('true');
  });
});
