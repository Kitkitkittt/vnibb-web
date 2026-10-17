import { fireEvent, render, screen } from '@testing-library/react';
import { Header } from './Header';

jest.mock('../widgets/AlertNotificationPanel', () => ({ AlertNotificationPanel: () => null }));
jest.mock('../ui/ConnectionStatus', () => ({ ConnectionStatus: () => null }));
jest.mock('@/contexts/SymbolLinkContext', () => ({ useSymbolLink: () => ({}) }));

test('external symbols update idle search without overwriting an active draft', () => {
    const onSymbolChange = jest.fn();
    const { rerender } = render(<Header currentSymbol="VNM" onSymbolChange={onSymbolChange} />);
    const input = screen.getByPlaceholderText('Search symbol (e.g., VNM, FPT)');

    rerender(<Header currentSymbol="FPT" onSymbolChange={onSymbolChange} />);
    expect(input).toHaveValue('FPT');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'VCB' } });
    rerender(<Header currentSymbol="SSI" onSymbolChange={onSymbolChange} />);
    expect(input).toHaveValue('VCB');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveValue('SSI');
    expect(onSymbolChange).not.toHaveBeenCalled();
});
