'use client';

import { FC } from 'react';
import MovieGrid from './MovieGrid';
import TogglePanel, { ToggleMode } from './TogglePanel';
import type { Movie } from '../types';

type MovieContainerProps = {
  title?: string;
  movies: Movie[];
  handleMovieClick: (movie: Movie) => void;
  mode: ToggleMode;
  onModeSwitch: (mode: ToggleMode) => void;
  onRemove?: () => void;
};

/**
 * Renders a section with a title, view mode toggle, and a responsive movie grid.
 */
const MovieContainerContent: FC<MovieContainerProps> = ({
  title,
  movies,
  handleMovieClick,
  mode,
  onModeSwitch,
  onRemove,
}) => {
  if (!movies?.length) return null;

  return (
    <section className="mt-6 space-y-6 w-full max-w-6xl px-4">
      {/* Header section with title and view toggle */}
      <header className="flex items-center justify-between min-h-[3rem]">
        <h1 className="text-3xl tracking-widest uppercase text-white font-staatliches">
          {title || <span className="invisible">Placeholder</span>}
        </h1>
        <TogglePanel mode={mode} onModeSwitch={onModeSwitch} />
      </header>


      {/* Main content grid */}
      <MovieGrid
        movies={movies}
        handleMovieClick={handleMovieClick}
        onRemove={onRemove}
      />
    </section>
  );
};

/**
 * Top-level movie container wrapper for layout consistency.
 */
const MovieContainer: FC<MovieContainerProps> = (props) => {
  return <MovieContainerContent {...props} />;
};

export default MovieContainer;
