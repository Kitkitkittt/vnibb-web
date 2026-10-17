// Widget Settings Modal
'use client';

import { useState } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import type { WidgetInstance } from '@/types/dashboard';

interface WidgetSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    widgetId: string | null;
    dashboardId: string | null;
    tabId: string | null;
}

export function WidgetSettingsModal({ isOpen, onClose, widgetId, dashboardId, tabId }: WidgetSettingsModalProps) {
    const { state } = useDashboard();
    const widget = isOpen && dashboardId && tabId && widgetId
        ? state.dashboards.find(d => d.id === dashboardId)?.tabs.find(t => t.id === tabId)?.widgets.find(w => w.id === widgetId) ?? null
        : null;

    if (!widget || !dashboardId || !tabId || !widgetId) return null;

    return (
        <WidgetSettingsEditor
            key={`${dashboardId}:${tabId}:${widgetId}`}
            widget={widget}
            dashboardId={dashboardId}
            tabId={tabId}
            onClose={onClose}
        />
    );
}

function WidgetSettingsEditor({ widget, dashboardId, tabId, onClose }: {
    widget: WidgetInstance;
    dashboardId: string;
    tabId: string;
    onClose: () => void;
}) {
    const { updateWidget } = useDashboard();
    const [config, setConfig] = useState(() => {
        const { refreshInterval: _, ...otherConfig } = widget.config;
        return JSON.stringify(otherConfig, null, 2);
    });
    const [refreshInterval, setRefreshInterval] = useState(widget.config.refreshInterval || 0);
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        try {
            const parsedConfig: unknown = JSON.parse(config);
            if (typeof parsedConfig !== 'object' || parsedConfig === null || Array.isArray(parsedConfig)) {
                setError('Configuration must be a JSON object');
                return;
            }
            const newConfig: WidgetInstance['config'] = {
                ...(parsedConfig as WidgetInstance['config']),
                refreshInterval: refreshInterval > 0 ? refreshInterval : undefined
            };
            updateWidget(dashboardId, tabId, widget.id, { config: newConfig });
            onClose();
        } catch {
            setError('Invalid JSON configuration');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#0b1221] border border-[#1e293b] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0f172a]">
                    <h2 className="text-lg font-semibold text-white">
                        Settings: <span className="text-blue-400">{widget.type}</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Common Settings */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">
                            Auto-Refresh Interval (seconds)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                min="0"
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 0)}
                                className="bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 w-32"
                            />
                            <span className="text-xs text-gray-500">Set to 0 to disable</span>
                        </div>
                    </div>

                    <div className="border-t border-[#1e293b]" />

                    {/* Advanced Configuration (JSON) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-300">
                                Advanced Configuration (JSON)
                            </label>
                            <button
                                onClick={() => setConfig('{}')}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <RotateCcw size={12} /> Reset
                            </button>
                        </div>
                        <textarea
                            value={config}
                            onChange={(e) => {
                                setConfig(e.target.value);
                                setError(null);
                            }}
                            className={`w-full h-40 bg-[#1e293b] border ${error ? 'border-red-500' : 'border-[#334155]'} rounded-lg p-3 text-sm font-mono text-gray-300 focus:outline-none focus:border-blue-500 resize-none`}
                        />
                        {error && <p className="text-xs text-red-400">{error}</p>}
                        <p className="text-xs text-gray-500">
                            Edit widget-specific properties directly.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1e293b] bg-[#0f172a]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                        <Save size={16} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
