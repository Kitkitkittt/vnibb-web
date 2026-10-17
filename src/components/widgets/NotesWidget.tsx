// Notes Widget - Personal notes for stocks

'use client';

import { useState, useSyncExternalStore } from 'react';
import { StickyNote, Save, Trash2 } from 'lucide-react';

interface NotesWidgetProps {
    symbol: string;
    isEditing?: boolean;
    onRemove?: () => void;
}

const STORAGE_KEY = 'vnibb_notes';

const subscribeToHydration = () => () => {};

export function NotesWidget(props: NotesWidgetProps) {
    const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
    return hydrated ? <NotesSession key={props.symbol} {...props} /> : null;
}

function NotesSession({ symbol }: NotesWidgetProps) {
    const [savedNotes, setSavedNotes] = useState<Record<string, string>>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    });
    const [notes, setNotes] = useState(savedNotes[symbol] || '');
    const [isSaved, setIsSaved] = useState(true);

    const saveNote = () => {
        const updated = { ...savedNotes, [symbol]: notes };
        setSavedNotes(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setIsSaved(true);
    };

    const clearNote = () => {
        setNotes('');
        const updated = { ...savedNotes };
        delete updated[symbol];
        setSavedNotes(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setIsSaved(true);
    };

    const handleChange = (value: string) => {
        setNotes(value);
        setIsSaved(false);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-1 py-1 mb-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <StickyNote size={12} className="text-yellow-400" />
                    <span>Notes - {symbol}</span>
                    {!isSaved && <span className="text-orange-400">•</span>}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={saveNote}
                        className="p-1 text-gray-500 hover:text-green-400 hover:bg-gray-800 rounded"
                        title="Save"
                    >
                        <Save size={12} />
                    </button>
                    <button
                        onClick={clearNote}
                        className="p-1 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded"
                        title="Clear"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Notes Textarea */}
            <div className="flex-1 px-1">
                <textarea
                    value={notes}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={`Write your notes about ${symbol}...`}
                    className="w-full h-full bg-gray-800/30 text-white text-sm p-2 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            {/* Footer */}
            <div className="px-1 py-1 text-[10px] text-gray-500 text-right">
                {notes.length} characters
            </div>
        </div>
    );
}
