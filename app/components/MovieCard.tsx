'use client';

import { useEffect, useState, useCallback, type JSX } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Eye, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingDotsOverlay from './LoadingDotsOverlay';
import type { Movie } from '../types';

type MovieCardProps = {
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
  };
  onRemove?: () => void;
  onClick: (movie: Movie) => void;
};

const FALLBACK_IMAGE = '/images/fallback.png';
const MAX_TITLE_LENGTH = 45;

export default function MovieCard({ movie, onRemove }: MovieCardProps): JSX.Element {
  const { data: session } = useSession();
  const [imgSrc, setImgSrc] = useState<string>(
    movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '/images/fallback.png'
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);

  const title = movie.title.length > MAX_TITLE_LENGTH
    ? `${movie.title.substring(0, MAX_TITLE_LENGTH)}...`
    : movie.title;

  const isAuthenticated = Boolean(session?.user?.name);

  /**
   * Checks if the movie is already in the user's watchlist.
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWatchlist = async () => {
      try {
        const res = await fetch('/api/watchlist');
        const watchlist: number[] = await res.json();
        if (Array.isArray(watchlist)) {
          setInWatchlist(watchlist.includes(movie.id));
        }
      } catch (err) {
        console.error('Failed to fetch watchlist:', err);
      }
    };

    fetchWatchlist();
  }, [movie.id, isAuthenticated]);

  /**
   * Adds a movie to the user's watchlist.
   */
  const addToWatchlist = useCallback(async () => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add to watchlist.');
      }

      setInWatchlist(true);
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [movie.id]);

  /**
   * Removes a movie from the user's watchlist.
   */
  const removeFromWatchlist = useCallback(async () => {
    try {
      const res = await fetch('/api/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to remove from watchlist.');
      }

      setInWatchlist(false);
      onRemove?.();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }, [movie.id, onRemove]);

  const handleImageLoad = () => {
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE);
    setTimeout(() => setIsLoading(false), 100);
  };

  return (
    <div data-testid="movie-card" className="w-full h-full flex flex-col items-start group">
      <div className="relative w-full aspect-[2/3] min-h-[1px] bg-gray-900 rounded-md overflow-hidden">
        <Link href={`/movie/${movie.id}`} className="block w-full h-full" passHref legacyBehavior>
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="256px"
            className="cursor-pointer object-cover w-full h-full"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </Link>

        {isLoading && (
          <LoadingDotsOverlay />
        )}

        {isAuthenticated && (
          <button
            data-testid="add-to-watchlist-buton"
            aria-label="Toggle Watchlist"
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-75 transition-opacity duration-500 bg-gradient-to-b from-gray-200 to-gray-400 text-indigo-900 shadow-md rounded-full p-1 z-20"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();

              if (inWatchlist) {
                removeFromWatchlist();
              } else {
                addToWatchlist();
              }
            }}
          >
            {inWatchlist ? (
              <X size={25} strokeWidth={2.25} />
            ) : (
              <Eye size={25} strokeWidth={2.25} />
            )}
          </button>
        )}
      </div>

      <Link href={`/movie/${movie.id}`} className="w-full">
        <h3
          className="text-white mt-2 text-sm sm:text-base md:text-lg cursor-pointer truncate whitespace-nowrap overflow-hidden"
          title={movie.title}
        >
          {title}
        </h3>
      </Link>


    </div>
  );
}
