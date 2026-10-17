'use client';

import { useState } from 'react';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScreenerData } from '@/types/screener';
import { formatScreenerValue } from '@/utils/formatters';


type PerformanceColumn = 'perf_1d' | 'perf_1w' | 'perf_1m' | 'perf_3m' | 'perf_6m' | 'perf_ytd' | 'perf_1y';

const TIMEFRAME_COLUMNS: { key: PerformanceColumn; label: string }[] = [
  { key: 'perf_1d', label: '1D' },
  { key: 'perf_1w', label: '1W' },
  { key: 'perf_1m', label: '1M' },
  { key: 'perf_3m', label: '3M' },
  { key: 'perf_6m', label: '6M' },
  { key: 'perf_ytd', label: 'YTD' },
  { key: 'perf_1y', label: '1Y' },
];

interface PerformanceTableProps {
  data: ScreenerData[];
}

export function PerformanceTable({ data }: PerformanceTableProps) {
  const [sortColumn, setSortColumn] = useState<PerformanceColumn>('perf_1d');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortColumn] ?? 0;
    const bVal = b[sortColumn] ?? 0;
    return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const toggleSort = (column: PerformanceColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  return (
    <div className="h-full overflow-auto scrollbar-hide">
      <table className="w-full text-[11px] border-separate border-spacing-0">
        <thead className="sticky top-0 bg-secondary z-10 shadow-sm border-b border-gray-800">
          <tr>
            <th className="text-left px-4 py-2 text-gray-500 font-bold uppercase tracking-tighter w-[180px] bg-secondary border-b border-gray-800">Symbol</th>
            <th className="text-right px-3 py-2 text-gray-500 font-bold uppercase tracking-tighter bg-secondary border-b border-gray-800">Price</th>
            {TIMEFRAME_COLUMNS.map(col => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className="text-right px-3 py-2 text-gray-500 font-bold uppercase tracking-tighter cursor-pointer hover:bg-white/5 transition-colors bg-secondary border-b border-gray-800"
              >
                <div className="flex items-center justify-end gap-1">
                  {col.label}
                  {sortColumn === col.key ? (
                      sortDirection === 'desc' ? <ArrowDown size={10} className="text-blue-400" /> : <ArrowUp size={10} className="text-blue-400" />
                  ) : <ArrowUpDown size={10} className="opacity-20" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/30">
          {sortedData.map((row) => (
            <tr key={row.ticker} className="hover:bg-white/5 transition-colors group">
              <td className="px-4 py-2 border-r border-gray-800/10">
                <div className="flex items-center gap-2">
                  <CompanyLogo symbol={row.ticker} size={20} />
                  <div>
                    <div className="text-gray-100 font-bold tracking-tight">{row.ticker}</div>
                    <div className="text-[9px] text-gray-600 font-medium truncate max-w-[110px] uppercase tracking-tighter">{row.organ_name ?? row.company_name ?? row.ticker}</div>
                  </div>
                </div>
              </td>
              <td className="text-right px-3 py-2 font-mono text-gray-300 group-hover:text-white">
                {formatScreenerValue(row.price, 'number')}
              </td>
              {TIMEFRAME_COLUMNS.map(col => {
                const value = row[col.key];
                const isPositive = value != null && value > 0;
                const isNegative = value != null && value < 0;
                
                return (
                  <td
                    key={col.key}
                    className={cn(
                        "text-right px-3 py-2 font-mono font-medium",
                        isPositive ? 'text-green-500 bg-green-500/5' : isNegative ? 'text-red-500 bg-red-500/5' : 'text-gray-500'
                    )}
                  >
                    {formatScreenerValue(value, 'change')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
