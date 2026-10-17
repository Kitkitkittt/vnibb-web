'use client';

import { memo, useMemo } from 'react';
import { WidgetContainer } from '@/components/ui/WidgetContainer';
import { useQuery } from '@tanstack/react-query';
import { getPriceDepth } from '@/lib/api';


interface OrderbookWidgetProps {
  symbol?: string;
  widgetId?: string;
}

function OrderbookWidgetComponent({ symbol = 'VNM', widgetId }: OrderbookWidgetProps) {
  const { data: orderbook, isLoading } = useQuery({
    queryKey: ['orderbook', symbol],
    queryFn: () => getPriceDepth(symbol),
    refetchInterval: 5000, // Real-time updates
  });

  const maxVolume = useMemo(() => {
    const entries = orderbook?.data || [];
    if (entries.length === 0) return 1;
    return Math.max(
      ...entries.map(e => Math.max(e.buy_volume || 0, e.sell_volume || 0))
    );
  }, [orderbook]);

  const entries = orderbook?.data || [];

  return (
    <WidgetContainer 
      title={`Order Book`}
      symbol={symbol}
      widgetId={widgetId}
      showLinkToggle
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex text-[10px] font-bold text-gray-500 px-3 py-2 border-b border-gray-800 uppercase tracking-wider">
          <div className="w-1/3">Bid Vol</div>
          <div className="w-1/3 text-center">Price</div>
          <div className="w-1/3 text-right">Ask Vol</div>
        </div>

        {/* Orderbook entries */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-xs">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-xs italic">
              No depth data available
            </div>
          ) : (
            entries.map((entry, i) => (
              <div key={i} className="flex items-center px-3 py-1.5 relative border-b border-gray-800/20">
                {/* Bid bar */}
                <div 
                  className="absolute left-0 top-0 h-full bg-green-500/10"
                  style={{ width: `${((entry.buy_volume || 0) / maxVolume) * 50}%` }}
                />
                {/* Ask bar */}
                <div 
                  className="absolute right-0 top-0 h-full bg-red-500/10"
                  style={{ width: `${((entry.sell_volume || 0) / maxVolume) * 50}%` }}
                />
                
                <div className="w-1/3 text-xs text-green-400 font-mono relative z-10">
                  {entry.buy_volume?.toLocaleString()}
                </div>
                <div className="w-1/3 text-center text-xs text-white font-bold relative z-10">
                  {entry.price?.toLocaleString()}
                </div>
                <div className="w-1/3 text-right text-xs text-red-400 font-mono relative z-10">
                  {entry.sell_volume?.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WidgetContainer>
  );
}

export const OrderbookWidget = memo(OrderbookWidgetComponent);
export default OrderbookWidget;
