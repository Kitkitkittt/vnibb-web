import { fireEvent, render, screen } from '@testing-library/react';
import { WidgetSettingsModal } from './WidgetSettingsModal';
import type { WidgetInstance } from '@/types/dashboard';

const mockUpdateWidget = jest.fn();
const mockWidget: WidgetInstance = {
    id: 'price', type: 'price_chart', tabId: 'overview',
    config: { symbol: 'VNM', refreshInterval: 30 },
    layout: { i: 'price', x: 0, y: 0, w: 6, h: 4 },
};

jest.mock('@/contexts/DashboardContext', () => ({
    useDashboard: () => ({
        state: { dashboards: [{ id: 'main', tabs: [{ id: 'overview', widgets: [mockWidget] }] }] },
        updateWidget: mockUpdateWidget,
    }),
}));

test('invalid configuration cannot replace the widget and closing discards unsaved changes', () => {
    const onClose = jest.fn();
    const props = { widgetId: 'price', dashboardId: 'main', tabId: 'overview', onClose };
    const { rerender } = render(<WidgetSettingsModal {...props} isOpen />);
    const editor = screen.getByRole('textbox');

    fireEvent.change(editor, { target: { value: '[]' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(screen.getByText('Configuration must be a JSON object')).toBeInTheDocument();
    expect(mockUpdateWidget).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();

    rerender(<WidgetSettingsModal {...props} isOpen={false} />);
    rerender(<WidgetSettingsModal {...props} isOpen />);
    expect(screen.getByRole('textbox')).toHaveValue('{\n  "symbol": "VNM"\n}');
});
