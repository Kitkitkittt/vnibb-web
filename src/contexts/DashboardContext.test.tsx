import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { DashboardProvider, useDashboard } from './DashboardContext';
import type { Dashboard, DashboardFolder } from '@/types/dashboard';

jest.mock('@/lib/useDashboardSync', () => ({ useDashboardSync: jest.fn() }));
jest.mock('@/components/widgets/WidgetRegistry', () => ({ defaultWidgetLayouts: {} }));

function DashboardConsumer() {
    const { activeDashboard, activeTab, updateDashboard } = useDashboard();
    return <>
        <span>{activeDashboard?.name}:{activeTab?.name}</span>
        <button onClick={() => {
            if (activeDashboard) updateDashboard(activeDashboard.id, { name: 'Renamed dashboard' });
        }}>Rename dashboard</button>
    </>;
}

test('persisted dashboards load before saving and later provider updates persist', () => {
    localStorage.clear();
    const dashboard: Dashboard = {
        id: 'saved-dashboard',
        name: 'Saved dashboard',
        folderId: 'saved-folder',
        order: 0,
        isDefault: false,
        showGroupLabels: true,
        tabs: [{ id: 'saved-tab', name: 'Research', order: 0, widgets: [] }],
        syncGroups: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const folders: DashboardFolder[] = [
        { id: 'saved-folder', name: 'Saved folder', order: 0, isExpanded: true },
    ];
    localStorage.setItem('vnibb_dashboards', JSON.stringify([dashboard]));
    localStorage.setItem('vnibb_folders', JSON.stringify(folders));
    localStorage.setItem('vnibb_migration_version', '2');
    const writes = jest.spyOn(Storage.prototype, 'setItem');

    try {
        render(<StrictMode><DashboardProvider><DashboardConsumer /></DashboardProvider></StrictMode>);
        expect(screen.getByText('Saved dashboard:Research')).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem('vnibb_dashboards') ?? '[]')).toEqual([dashboard]);
        expect(JSON.parse(localStorage.getItem('vnibb_folders') ?? '[]')).toEqual(folders);

        fireEvent.click(screen.getByRole('button', { name: 'Rename dashboard' }));
        expect(screen.getByText('Renamed dashboard:Research')).toBeInTheDocument();
        expect(JSON.parse(localStorage.getItem('vnibb_dashboards') ?? '[]')[0].name).toBe('Renamed dashboard');
        const dashboardWrites = writes.mock.calls.filter(([key]) => key === 'vnibb_dashboards');
        expect(dashboardWrites.length).toBeGreaterThan(0);
        for (const [, value] of dashboardWrites) {
            expect(JSON.parse(value)[0].id).toBe(dashboard.id);
        }
    } finally {
        writes.mockRestore();
        localStorage.clear();
    }
});
