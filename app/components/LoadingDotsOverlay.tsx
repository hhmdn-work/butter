'use client';

import { FC } from 'react';

/**
 * A full-size dark overlay with animated bouncing dots, useful for image or card loading states.
 */
const LoadingDotsOverlay: FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
    <div className="flex space-x-1">
      {[0.3, 0.15, 0].map((delay, idx) => (
        <span
          key={idx}
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: `-${delay}s` }}
        />
      ))}
    </div>
  </div>
);

export default LoadingDotsOverlay;
