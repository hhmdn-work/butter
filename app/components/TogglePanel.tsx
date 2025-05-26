'use client';

import { useState, FC } from 'react';
import { Infinity as InfinityIcon, BookOpen } from 'lucide-react';

// Enum for toggle modes
export enum ToggleMode {
  Infinite = 'infinite',
  Pagination = 'pagination',
}

// Props for the TogglePanel component
interface TogglePanelProps {
  mode: ToggleMode;
  onModeSwitch: (mode: ToggleMode) => void;
}

// Optional labels
const ModeLabels: Record<ToggleMode, string> = {
  [ToggleMode.Infinite]: 'Infinite Scroll',
  [ToggleMode.Pagination]: 'Pagination',
};

// TogglePanel allows switching between Infinite Scroll and Pagination modes
const TogglePanel: FC<TogglePanelProps> = ({ mode, onModeSwitch }) => {
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  const handleHover = (label: string | null) => setHoverLabel(label);

  return (
    <div data-testid="toggle-panel" className="relative w-fit">
      {/* Hover label displayed above the buttons */}
      <div className="absolute -top-6 right-0 text-xs text-gray-400 transition-opacity duration-200 h-4 w-full text-center whitespace-nowrap">
        {hoverLabel && <span>{hoverLabel}</span>}
      </div>

      <div className="flex gap-px bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg shadow-sm overflow-hidden">
        <button
          data-testid="infinite-button"
          onClick={() => onModeSwitch(ToggleMode.Infinite)}
          onMouseEnter={() => handleHover(ModeLabels[ToggleMode.Infinite])}
          onMouseLeave={() => handleHover(null)}
          className={`flex items-center justify-center p-2 transition rounded-l-lg bg-gradient-to-b ${
            mode === ToggleMode.Infinite
              ? 'from-indigo-500 to-indigo-600 text-white'
              : 'from-zinc-700 to-zinc-900'
          }`}
          aria-label="Switch to Infinite Scroll"
        >
          <InfinityIcon size={20} />
        </button>

        <button
          data-testid="paginate-button"
          onClick={() => onModeSwitch(ToggleMode.Pagination)}
          onMouseEnter={() => handleHover(ModeLabels[ToggleMode.Pagination])}
          onMouseLeave={() => handleHover(null)}
          className={`flex items-center justify-center p-2 transition rounded-r-lg bg-gradient-to-b ${
            mode === ToggleMode.Pagination
              ? 'from-indigo-500 to-indigo-600 text-white'
              : 'from-zinc-700 to-zinc-900'
          }`}
          aria-label="Switch to Pagination"
        >
          <BookOpen size={20} />
        </button>
      </div>
    </div>
  );
};

export default TogglePanel;
