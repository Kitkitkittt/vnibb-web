import { act, render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

function ThemeConsumer() {
    const { theme, resolvedTheme } = useTheme();
    return <span>{theme}:{resolvedTheme}</span>;
}

test('saved system preference resolves and updates the document when the system changes', () => {
    localStorage.setItem('vnibb-theme', 'system');
    let dark = true;
    const listeners = new Set<() => void>();
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn(() => ({
        get matches() { return dark; },
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
            if (typeof listener === 'function') listeners.add(listener as () => void);
        },
        removeEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
            if (typeof listener === 'function') listeners.delete(listener as () => void);
        },
        dispatchEvent: () => true,
    }));

    try {
        render(<ThemeProvider><ThemeConsumer /></ThemeProvider>);
        expect(screen.getByText('system:dark')).toBeInTheDocument();
        expect(document.documentElement).toHaveClass('dark');
        act(() => {
            dark = false;
            listeners.forEach(listener => listener());
        });
        expect(screen.getByText('system:light')).toBeInTheDocument();
        expect(document.documentElement).toHaveClass('light');
    } finally {
        window.matchMedia = originalMatchMedia;
        localStorage.removeItem('vnibb-theme');
    }
});
