'use client';

import { FC } from 'react';
import MovieCard from './MovieCard';
import type { Movie } from '../types';

type MovieGridProps = {
  movies: Movie[];
  handleMovieClick: (movie: Movie) => void;
  onRemove?: () => void;
};

/**
 * MovieGrid renders a responsive grid of MovieCard components.
 * It passes down optional `onRemove` handler for watchlist management.
 */
const MovieGrid: FC<MovieGridProps> = ({
  movies,
  handleMovieClick,
  onRemove,
}) => {
  if (!Array.isArray(movies) || movies.length === 0) {
    return (
      <p className="text-gray-400 text-center w-full mt-6">
        No movies found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-8">
      {movies.map((movie) => (
        <MovieCard
          key={String(movie.id)}
          movie={movie}
          onClick={handleMovieClick}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default MovieGrid;
