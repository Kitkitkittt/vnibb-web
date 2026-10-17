import { fireEvent, render, screen, within } from '@testing-library/react';
import { PerformanceTable } from './PerformanceTable';
import { SavedScreensDropdown } from './SavedScreensDropdown';

test('performance rows render API ticker and missing financial cells without invented values', () => {
    render(<PerformanceTable data={[
        { ticker: 'VCB', company_name: 'Vietcombank' },
        { ticker: 'FPT', organ_name: 'FPT Corporation', price: 0, perf_1d: 0 },
    ]} />);

    const missingRow = screen.getByRole('row', { name: /Vietcombank/ });
    expect(within(missingRow).getByText('VCB')).toBeInTheDocument();
    expect(within(missingRow).getAllByRole('cell').slice(1).map(cell => cell.textContent))
        .toEqual(['—', '—', '—', '—', '—', '—', '—', '—']);

    const zeroRow = screen.getByRole('row', { name: /FPT Corporation/ });
    const zeroCells = within(zeroRow).getAllByRole('cell');
    expect(zeroCells[1]).toHaveTextContent('0');
    expect(zeroCells[2]).toHaveTextContent('+0.00%');
});

test('gainers and losers select executable active-filter metadata', () => {
    const onSelect = jest.fn();
    render(<SavedScreensDropdown
        activeScreenId="all"
        customScreens={[]}
        onSelect={onSelect}
        onSave={jest.fn()}
        onDelete={jest.fn()}
    />);

    fireEvent.click(screen.getByRole('button', { name: 'All Stocks' }));
    fireEvent.click(screen.getByRole('button', { name: 'Top Gainers' }));
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({
        id: 'gainers',
        filters: [{ id: 'change_1d', value: { gt: 5 }, displayValue: 'Above 5%' }],
    }));

    fireEvent.click(screen.getByRole('button', { name: 'All Stocks' }));
    fireEvent.click(screen.getByRole('button', { name: 'Top Losers' }));
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({
        id: 'losers',
        filters: [{ id: 'change_1d', value: { lt: -5 }, displayValue: 'Below -5%' }],
    }));
});
