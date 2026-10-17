import { fireEvent, render, screen } from '@testing-library/react';
import { ManageTabsModal } from './ManageTabsModal';
import type { DashboardTab } from '@/types/dashboard';

const tabs: DashboardTab[] = [
    { id: 'overview', name: 'Overview', order: 0, widgets: [] },
    { id: 'financials', name: 'Financials', order: 1, widgets: [] },
];

test('discarded tab edits do not leak into the next modal session', () => {
    const onClose = jest.fn();
    const onSave = jest.fn();
    const props = { tabs, onClose, onSave };
    const { rerender } = render(<ManageTabsModal {...props} isOpen />);

    fireEvent.change(screen.getByDisplayValue('Overview'), { target: { value: 'Unsaved' } });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();

    rerender(<ManageTabsModal {...props} isOpen={false} />);
    rerender(<ManageTabsModal {...props} isOpen />);
    expect(screen.getByDisplayValue('Overview')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Unsaved')).not.toBeInTheDocument();
});

test('tabs added outside the open editor are retained when saving', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const { rerender } = render(<ManageTabsModal tabs={tabs} onSave={onSave} onClose={onClose} isOpen />);
    const updatedTabs = [...tabs, { id: 'news', name: 'News', order: 2, widgets: [] }];
    rerender(<ManageTabsModal tabs={updatedTabs} onSave={onSave} onClose={onClose} isOpen />);
    expect(screen.getByDisplayValue('News')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(onSave).toHaveBeenCalledWith(updatedTabs);
});
