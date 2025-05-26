'use client';

import {
  useCallback,
  useEffect,
  useState,
  JSX
} from 'react';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import MovieContainer from '../components/MovieContainer';
import Paginator from '../components/Paginator';
import { ToggleMode } from '../components/TogglePanel';

type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
};

const PER_PAGE = 6;

function WatchlistContent(): JSX.Element {
  const { status } = useSession();
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [displayedMovies, setDisplayedMovies] = useState<Movie[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState<ToggleMode>(ToggleMode.Pagination);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /**
   * Fetches all movies from the watchlist based on TMDB IDs.
   */
  const fetchWatchlistMovies = async (): Promise<Movie[]> => {
    try {
      const idResponse = await fetch('/api/watchlist');
      const ids: number[] = await idResponse.json();

      const fetches = ids.map((id) =>
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`)
          .then((res) => (res.ok ? res.json() : null))
      );

      const movies = await Promise.all(fetches);
      return movies.filter(Boolean) as Movie[];
    } catch {
      return [];
    }
  };

  /**
   * Loads initial movies based on selected mode.
   */
  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    const fetched = await fetchWatchlistMovies();
    setAllMovies(fetched);
    setDisplayedMovies(
      mode === ToggleMode.Pagination ? fetched.slice(0, PER_PAGE) : fetched
    );
    setIsLoading(false);
  }, [mode]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadInitial();
    }
  }, [status, mode, loadInitial]);

  /**
   * Handles infinite scroll loading of more movies.
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || mode !== ToggleMode.Infinite) return;

    setIsLoadingMore(true);
    const fetched = await fetchWatchlistMovies();

    const nextSlice = fetched.slice(0, (currentPage + 1) * PER_PAGE);
    setDisplayedMovies(nextSlice);
    setCurrentPage((prev) => prev + 1);
    setIsLoadingMore(false);
  }, [currentPage, isLoadingMore, mode]);

  /**
   * Handles movie removal update.
   */
  const handleRemove = async () => {
    const fetched = await fetchWatchlistMovies();
    setAllMovies(fetched);

    const totalPages = Math.ceil(fetched.length / PER_PAGE);
    const safePage = Math.min(currentPage, totalPages || 1);
    setCurrentPage(safePage);

    const updated =
      mode === ToggleMode.Pagination
        ? fetched.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
        : fetched;

    setDisplayedMovies(updated);
  };

  // Initial load or when mode changes
  useEffect(() => {
    if (status === 'authenticated') {
      loadInitial();
    }
  }, [status, mode, loadInitial]);

  // Infinite scroll listener
  useEffect(() => {
    if (mode !== ToggleMode.Infinite) return;

    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300;

      if (nearBottom) loadMore();
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loadMore, mode]);

  if (status === 'unauthenticated') {
    return (
      <div className="text-white text-center mt-10">
        You must be logged in to view your watchlist.
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <Toaster position="top-right" />
      <main className="flex flex-col items-center justify-center py-6">
        {isLoading ? (
          <div className="text-center mt-12 text-white text-lg">
            <div className="flex justify-center space-x-2">
              {[0.3, 0.15, 0].map((delay, idx) => (
                <span
                  key={idx}
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: `-${delay}s` }}
                />
              ))}
            </div>
          </div>
        ) : displayedMovies.length === 0 ? (
          <div className="text-gray-400 text-center mt-12 text-lg">
            <p>Your watchlist is empty.</p>
            <p>
              <Link href="/" className="text-indigo-400 hover:underline">
                Return to Homepage
              </Link>
            </p>
          </div>
        ) : (
          <>
            <MovieContainer
              title="Your Watchlist"
              movies={displayedMovies}
              handleMovieClick={() => {}}
              mode={mode}
              onModeSwitch={(newMode) => {
                if (mode === newMode) return;
                setMode(newMode);
                setCurrentPage(1);
              }}
              onRemove={handleRemove}
            />

            {mode === ToggleMode.Pagination && (
              <Paginator
                currentPage={currentPage}
                maxPages={Math.ceil(allMovies.length / PER_PAGE)}
                onPageChange={(newPage) => {
                  setIsLoading(true);
                  const newSlice = allMovies.slice(
                    (newPage - 1) * PER_PAGE,
                    newPage * PER_PAGE
                  );
                  setDisplayedMovies(newSlice);
                  setCurrentPage(newPage);
                  setIsLoading(false);
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default WatchlistContent;

