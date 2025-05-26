'use client';

import { useCallback, useEffect, useState, FormEvent, type JSX } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { BASE_URL } from '../constants';
import MovieContainer from '../components/MovieContainer';
import Paginator from '../components/Paginator';
import LoadingDotsOverlay from '../components/LoadingDotsOverlay';
import { ToggleMode } from '../components/TogglePanel';


interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  [key: string]: string | number | null | undefined;
}

interface SearchResult {
  results: Movie[];
  total_pages: number;
}

const MOVIES_PER_PAGE = 6;

/**
 * Performs API request to TMDB to fetch movie results.
 */
const searchMovies = async (query: string, page = 1): Promise<SearchResult> => {
  try {
    const res = await fetch(
      `${BASE_URL}/search/movie?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    const json = await res.json();

    return {
      results: Array.isArray(json.results) ? json.results : [],
      total_pages: typeof json.total_pages === 'number' ? json.total_pages : 1,
    };
  } catch (error) {
    console.error('[Search API Error]', error);
    return { results: [], total_pages: 1 };
  }
};

export default function SearchPage(): JSX.Element {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState<string>(urlQuery);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [mode, setMode] = useState<ToggleMode>(ToggleMode.Infinite);



  const getSpellingSuggestions = async (word: string): Promise<string[]> => {
    try {
      const res = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      });

      if (!res.ok) return [];

      const data = await res.json();
      return Array.isArray(data.suggestions) ? data.suggestions : [];
    } catch (err) {
      console.error('[Spellcheck API Error]', err);
      return [];
    }
  };

  /**
   * Handles full search and updates state.
   */
  const performSearch = useCallback(async (q: string, pageNum = 1) => {
    if (!q.trim()) return;

    setLoading(true);
    setSearchActive(true);

    const results = await searchMovies(q, pageNum);

    if (pageNum === 1) {
      const suggestions = await getSpellingSuggestions(q);
      for (const suggestion of suggestions) {
        const fallbackResults = await searchMovies(suggestion, 1);
        if (fallbackResults.results.length > 0) {
          results.results = [...results.results, ...fallbackResults.results];
        }
      }
    }

    // Update state using final query and results
    setTotalPages(results.total_pages);
    setMovies(results.results.slice(0, MOVIES_PER_PAGE));
    setPage(pageNum);
    setLoading(false);
  }, []);



  /**
   * Executes search when form is submitted.
   */
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    performSearch(query);
  };

  /**
   * Handles infinite scroll fetching.
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || page >= totalPages || !query) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const results = await searchMovies(query, nextPage);
      setMovies((prev) => [...prev, ...results.results.slice(0, MOVIES_PER_PAGE)]);
      setPage(nextPage);
    } catch (error) {
      console.error('[Load More Error]', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page, totalPages, query]);

  /**
   * Triggers search when URL query changes.
   */
  useEffect(() => {
    setQuery(urlQuery);
    if (urlQuery.trim()) performSearch(urlQuery);
  }, [urlQuery, performSearch]);

  /**
   * Scroll listener for infinite mode.
   */
  useEffect(() => {
    if (mode !== ToggleMode.Infinite || !searchActive) return;

    const handleScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom && !loadingMore && page < totalPages) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode, searchActive, loadingMore, page, totalPages, loadMore]);

  return (
    <div className="bg-[#0c0c0c] text-white min-h-screen">
      <main className="flex flex-col items-center justify-center py-6 px-4">

        {/* Search Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full max-w-2xl flex items-center justify-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies..."
            className="max-w-[300px] flex-1 px-4 py-2 rounded-lg border border-gray-500 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            className="flex items-center justify-center px-3 py-2 bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded transition whitespace-nowrap"
          >
            <Search size={18} />
            <span className="hidden sm:inline ml-2">Search</span>
          </button>
        </form>


        {/* Movie Results */}
        {loading ? (
          <div className="text-center text-gray-400">
            <LoadingDotsOverlay />
          </div>
        ) : movies.length === 0 && searchActive ? (
          <p className="text-gray-400 text-lg mt-6">No results found...</p>
        ) : (
          <MovieContainer
            title=""
            movies={movies}
            handleMovieClick={() => {}}
            mode={mode}
            onModeSwitch={(newMode: ToggleMode) => {
              if (mode === newMode) return;
              setMode(newMode);
              setPage(1);
              performSearch(query, 1);
            }}
          />
        )}

        {/* Paginator for pagination mode */}
        {!loading && mode === ToggleMode.Pagination && movies.length > 0 && (
          <Paginator
            currentPage={page}
            maxPages={totalPages}
            onPageChange={async (newPage: number) => {
              const results = await searchMovies(query, newPage);
              setMovies(results.results.slice(0, MOVIES_PER_PAGE));
              setPage(newPage);
              if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          />
        )}

        {loadingMore && <p className="mt-4 text-gray-400">Loading more...</p>}
      </main>
    </div>
  );
}
