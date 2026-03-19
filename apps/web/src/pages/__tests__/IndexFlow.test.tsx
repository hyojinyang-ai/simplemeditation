import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Index from '../Index';
import TrackerPage from '../TrackerPage';
import AnalyticsPage from '../AnalyticsPage';
import BottomNav from '@/components/BottomNav';
import { useMeditationStore } from '@/lib/meditation-store';

vi.mock('@repo/meditation-content', () => ({
  getRandomQuote: () => ({
    text: 'Stillness reveals what hurry hides.',
    author: 'Test Author',
  }),
}));

vi.mock('@/lib/analytics', () => ({
  trackPageView: vi.fn(),
  trackPreMoodSelection: vi.fn(),
  trackPostMoodSelection: vi.fn(),
  trackSoundChange: vi.fn(),
  trackQuoteSaved: vi.fn(),
  trackNoteAdded: vi.fn(),
  trackSessionStart: vi.fn(),
  trackSessionComplete: vi.fn(),
  trackSessionAbandoned: vi.fn(),
  trackPullToRefresh: vi.fn(),
}));

vi.mock('@/hooks/use-page-meta', () => ({
  usePageMeta: vi.fn(),
}));

vi.mock('@/components/MeditationPlayer', () => ({
  default: ({
    onComplete,
    onCountdownComplete,
  }: {
    onComplete: () => void;
    onCountdownComplete?: () => void;
  }) => (
    <button
      onClick={() => {
        useMeditationStore.getState().setMeditating(true);
        onCountdownComplete?.();
        useMeditationStore.getState().setMeditating(false);
        onComplete();
      }}
      type="button"
    >
      Finish meditation
    </button>
  ),
}));

describe('Index meditation flow', () => {
  beforeEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    useMeditationStore.setState({ entries: [], isMeditating: false });

    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('saves the completed session, allows quote saving, shows journal and insights data, and resets home state from the result screen', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
        <BottomNav />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Stressed'));

    fireEvent.click(await screen.findByText('Quick reset'));

    fireEvent.click(await screen.findByText('Rain'));

    fireEvent.click(await screen.findByText('Finish meditation'));
    fireEvent.click(await screen.findByText('Calm'));
    fireEvent.change(screen.getByPlaceholderText('Add a note about your session… (optional)'), {
      target: { value: 'I feel much steadier now.' },
    });
    fireEvent.click(screen.getByText('Save & Continue'));
    expect(await screen.findByText('Begin again')).toBeInTheDocument();

    await waitFor(() => {
      expect(useMeditationStore.getState().entries).toHaveLength(1);
    });

    const savedEntry = useMeditationStore.getState().entries[0];
    expect(savedEntry.preMood).toBe('stressed');
    expect(savedEntry.postMood).toBe('calm');
    expect(savedEntry.note).toBe('I feel much steadier now.');
    expect(savedEntry.sessionMinutes).toBe(3);
    expect(savedEntry.sound).toBe('rain');

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(useMeditationStore.getState().entries[0].savedQuote).toEqual({
        text: 'Stillness reveals what hurry hides.',
        author: 'Test Author',
      });
    });

    fireEvent.click(screen.getByText('Home'));
    expect(await screen.findByText('How are you feeling?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Journal'));
    expect(await screen.findByText(/I feel much steadier now\./)).toBeInTheDocument();
    expect(screen.getByText(/Stillness reveals what hurry hides\./)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Insights'));
    expect(await screen.findByText('Sessions')).toBeInTheDocument();
    expect(screen.queryByText('Complete sessions to see insights here.')).not.toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });
});
