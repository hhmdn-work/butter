'use client';

import {
  useCallback,
  useEffect,
  useState,
  JSX,
} from 'react';
import MovieContainer from '../components/MovieContainer';
import Paginator from '../components/Paginator';
import { ToggleMode } from '../components/TogglePanel';
import type { Movie } from '../types';

type ContentPageClientProps = {
  title: string;
  apiUrl: string;
  perPage?: number;
  initialMovies?: Movie[];
};

type MovieApiResponse = {
  results: Movie[];
  total_pages: number;
};

// Utility to sanitize and build paged URLs
const buildPagedUrl = (baseUrl: string, page: number): string => {
  const cleanedUrl = baseUrl.replace(/([&?])page=\d+/, '');
  const separator = cleanedUrl.includes('?') ? '&' : '?';
  return `${cleanedUrl}${separator}page=${page}`;
};

export default function ContentPageClient({
  title,
  apiUrl,
  initialMovies,
  perPage = 6,
}: ContentPageClientProps): JSX.Element {
  const [movies, setMovies] = useState<Movie[]>(initialMovies ?? []);
  const [hasInitialMovies, setHasInitialMovies] = useState<boolean>(!!initialMovies?.length);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [mode, setMode] = useState<ToggleMode>(ToggleMode.Infinite);

  // Fetch movies for a specific page
  const fetchMovies = useCallback(
    async (pageToFetch: number): Promise<MovieApiResponse> => {
      try {
        if (hasInitialMovies) {
          setHasInitialMovies(false);
          setMovies([]); // Clear placeholder
        }

        const url = buildPagedUrl(apiUrl, pageToFetch);
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch movies');
        return await res.json();
      } catch (error) {
        console.error('fetchMovies failed:', error);
        return { results: [], total_pages: 1 }; // fallback
      }
    },
    [apiUrl, hasInitialMovies]
  );

  // Toggle between infinite scroll and pagination
  const switchMode = useCallback(
    async (newMode: ToggleMode) => {
      if (newMode === mode) return;

      setMode(newMode);
      setPage(1);

      const data = await fetchMovies(1);
      setMaxPages(data.total_pages);
      const movies =
        newMode === ToggleMode.Pagination
          ? data.results.slice(0, perPage)
          : data.results;

      setMovies(movies);
    },
    [mode, fetchMovies, perPage]
  );

  // Load next page of results for infinite scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || page >= maxPages) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchMovies(nextPage);

      setMovies((prev) => {
        const combined = [...prev, ...data.results];
        const deduped = Array.from(new Map(combined.map((m) => [m.id, m])).values());
        return deduped;
      });

      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page, maxPages, fetchMovies]);

  // Infinite scroll handler
  useEffect(() => {
    if (mode !== ToggleMode.Infinite) return;

    const handleScroll = (): void => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, mode]);

  // Initial load or refetch when apiUrl or mode changes
  useEffect(() => {
    const load = async () => {
      const data = await fetchMovies(1);
      setMaxPages(data.total_pages);
      setPage(1);

      const results =
        mode === ToggleMode.Pagination
          ? data.results.slice(0, perPage)
          : data.results;

      setMovies(results);
    };

    load();
  }, [fetchMovies, mode, perPage]);

  return (
    <div className="bg-[#0c0c0c] text-white min-h-screen">
      <main className="flex flex-col items-center justify-center py-6">
        <MovieContainer
          title={title}
          movies={movies}
          handleMovieClick={() => {}}
          mode={mode}
          onModeSwitch={switchMode}
        />

        {mode === ToggleMode.Pagination && (
          <Paginator
            currentPage={page}
            maxPages={maxPages}
            onPageChange={async (newPage) => {
              setLoadingMore(true);
              try {
                const data = await fetchMovies(newPage);
                setMovies(data.results.slice(0, perPage));
                setPage(newPage);

                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }

              } catch (error) {
                console.error('Pagination error:', error);
              } finally {
                setLoadingMore(false);
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
