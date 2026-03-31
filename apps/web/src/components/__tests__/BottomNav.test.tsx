import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BottomNav from '../BottomNav';
import { useMeditationStore } from '@/lib/meditation-store';
import { I18nProvider } from '@/lib/i18n';

const { stopMock } = vi.hoisted(() => ({
  stopMock: vi.fn(),
}));

vi.mock('@/lib/ambient-engine', () => ({
  ambientEngine: {
    stop: stopMock,
  },
}));

describe('BottomNav', () => {
  beforeEach(() => {
    stopMock.mockClear();
    useMeditationStore.setState({ isMeditating: true });
  });

  it('stops audio immediately when confirming a session stop', async () => {
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={['/tracker']}>
          <BottomNav />
        </MemoryRouter>
      </I18nProvider>
    );

    fireEvent.click(screen.getByText('Home'));
    fireEvent.click(await screen.findByText('Stop session'));

    await waitFor(() => {
      expect(stopMock).toHaveBeenCalledTimes(1);
      expect(useMeditationStore.getState().isMeditating).toBe(false);
    });
  });
});
