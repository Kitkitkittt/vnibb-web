import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { WidgetGroupProvider, useWidgetGroups } from './WidgetGroupContext';
import { DEFAULT_GROUPS } from '@/types/widget';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

function GroupConsumer() {
    const { globalSymbol, getSymbolForGroup, setGroupSymbol } = useWidgetGroups();
    return <>
        <span>{globalSymbol}:{getSymbolForGroup('A')}</span>
        <button onClick={() => setGroupSymbol('A', 'VCB')}>Change group</button>
    </>;
}

test('saved groups load before persistence and subsequent changes are saved', () => {
    localStorage.clear();
    const groups = { ...DEFAULT_GROUPS, A: { ...DEFAULT_GROUPS.A, symbol: 'FPT' } };
    localStorage.setItem('vnibb-widget-groups-v1', JSON.stringify(groups));
    localStorage.setItem('vnibb-global-symbol', 'SSI');

    render(<WidgetGroupProvider><GroupConsumer /></WidgetGroupProvider>);
    expect(screen.getByText('SSI:FPT')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('vnibb-widget-groups-v1') ?? '{}').A.symbol).toBe('FPT');

    fireEvent.click(screen.getByRole('button', { name: 'Change group' }));
    expect(screen.getByText('SSI:VCB')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('vnibb-widget-groups-v1') ?? '{}').A.symbol).toBe('VCB');
});

test('useLocalStorage loads saved values and persists updates', () => {
    localStorage.clear();
    localStorage.setItem('hook-storage-regression', JSON.stringify('saved'));
    const { result } = renderHook(() => useLocalStorage('hook-storage-regression', 'initial'));
    expect(result.current[0]).toBe('saved');
    act(() => result.current[1]('updated'));
    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('hook-storage-regression')).toBe(JSON.stringify('updated'));
});
