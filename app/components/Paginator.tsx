'use client';

import { FC, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Constants for styling and accessibility
const ICON_SIZE = 28;
const MIN_BUTTON_WIDTH = 'min-w-[40px]';
const PAGINATION_GAP = 'gap-4';
const TEXT_COLOR_ACTIVE = 'text-indigo-500 hover:text-indigo-400';
const TEXT_COLOR_DISABLED = 'text-gray-500';
const CONTAINER_CLASSES = `mt-6 flex justify-center items-center ${PAGINATION_GAP}`;

type PaginatorProps = {
  currentPage: number;
  onPageChange: (page: number) => void;
  maxPages?: number;
};

/**
 * Paginator component for pagination controls.
 * Handles conditional rendering of previous/next buttons.
 */
const Paginator: FC<PaginatorProps> = ({
  currentPage,
  onPageChange,
  maxPages,
}) => {
  const canGoNext = maxPages === undefined || currentPage < maxPages;
  const canGoPrev = currentPage > 1;
  const isSinglePage = maxPages === 1;

  const handlePrevious = () => {
    if (canGoPrev) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (canGoNext) onPageChange(currentPage + 1);
  };

  return (
    <div className={CONTAINER_CLASSES}>
      {!isSinglePage && (
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!canGoPrev}
          aria-label="Previous Page"
          className={`p-2 rounded bg-transparent ${MIN_BUTTON_WIDTH} text-center ${
            canGoPrev ? TEXT_COLOR_ACTIVE : TEXT_COLOR_DISABLED
          }`}
        >
          <ChevronLeft size={ICON_SIZE} className="mx-auto" />
        </button>
      )}

      <span
        className={`text-white bg-indigo-800 rounded px-4 py-1 text-center ${
          maxPages ? 'min-w-[8ch]' : 'min-w-[5ch]'
        }`}
      >
        {maxPages ? `${currentPage} / ${maxPages}` : currentPage}
      </span>

      {!isSinglePage && (
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="Next Page"
          className={`p-2 rounded bg-transparent ${MIN_BUTTON_WIDTH} text-center ${
            canGoNext ? TEXT_COLOR_ACTIVE : TEXT_COLOR_DISABLED
          }`}
        >
          <ChevronRight size={ICON_SIZE} className="mx-auto" />
        </button>
      )}
    </div>
  );
};

export default memo(Paginator);
