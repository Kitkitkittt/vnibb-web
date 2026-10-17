import { fireEvent, render, screen } from '@testing-library/react';
import { PromptsLibrary } from './modals/PromptsLibrary';
import { ScreenerFilters } from './ScreenerFilters';

beforeEach(() => {
    localStorage.setItem('vnibb-prompts', '[]');
    localStorage.setItem('screener_filter_presets', '[]');
});

afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
});

function rejectStorageWrites() {
    const error = new DOMException('Storage quota exceeded', 'QuotaExceededError');
    const reported: unknown[] = [];
    const onError = (event: ErrorEvent) => {
        if (event.error === error) {
            reported.push(event.error);
            event.preventDefault();
        }
    };
    window.addEventListener('error', onError);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw error; });
    return { error, reported, cleanup: () => window.removeEventListener('error', onError) };
}

test('prompt additions and deletions remain visible when persistence exceeds quota', () => {
    render(<PromptsLibrary isOpen onClose={jest.fn()} />);
    const failure = rejectStorageWrites();
    try {
        fireEvent.click(screen.getByRole('button', { name: 'Add Prompt' }));
        fireEvent.change(screen.getByPlaceholderText('Prompt name...'), { target: { value: 'Session prompt' } });
        fireEvent.change(screen.getByPlaceholderText('Prompt content...'), { target: { value: 'Analyze this company' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Prompt' }));
        expect(screen.getByRole('heading', { name: 'Session prompt' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Delete Session prompt' }));
        expect(screen.queryByRole('heading', { name: 'Session prompt' })).not.toBeInTheDocument();
        expect(failure.reported).toEqual([failure.error, failure.error]);
        expect(localStorage.getItem('vnibb-prompts')).toBe('[]');
    } finally {
        failure.cleanup();
    }
});

test('filter presets can be used and deleted after persistence exceeds quota', () => {
    const onFilterChange = jest.fn();
    render(<ScreenerFilters filters={{ pe_max: 12 }} onFilterChange={onFilterChange} />);
    const failure = rejectStorageWrites();
    try {
        fireEvent.click(screen.getByRole('button', { name: 'Save Current' }));
        fireEvent.change(screen.getByPlaceholderText('Preset name'), { target: { value: 'Session preset' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        fireEvent.click(screen.getByRole('button', { name: 'Session preset' }));
        expect(onFilterChange).toHaveBeenCalledWith({ pe_max: 12 });
        fireEvent.click(screen.getByRole('button', { name: 'Delete Session preset' }));
        expect(screen.queryByRole('button', { name: 'Session preset' })).not.toBeInTheDocument();
        expect(failure.reported).toEqual([failure.error, failure.error]);
        expect(localStorage.getItem('screener_filter_presets')).toBe('[]');
    } finally {
        failure.cleanup();
    }
});
