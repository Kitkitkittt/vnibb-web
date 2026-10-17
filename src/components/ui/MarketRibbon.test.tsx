import { render, screen } from '@testing-library/react';
import { MarketRibbon } from './MarketRibbon';

jest.mock('@tanstack/react-query', () => ({
    useQuery: () => ({
        data: {
            count: 1,
            data: [{ index_name: 'VNINDEX', current_value: 100, change: 2, change_pct: 2 }],
        },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        isFetching: false,
    }),
}));

jest.mock('@/lib/hooks/useWebSocket', () => ({
    useWebSocket: () => ({
        prices: new Map([['VNINDEX', { symbol: 'VNINDEX', price: 120 }]]),
        isConnected: true,
    }),
}));

test('uses live price while retaining API change fields when live changes are absent', () => {
    render(<MarketRibbon />);

    expect(screen.getByText('120,00')).toBeInTheDocument();
    expect(screen.getByText('+2,00')).toBeInTheDocument();
    expect(screen.getByText('(+2.00%)')).toBeInTheDocument();
});
