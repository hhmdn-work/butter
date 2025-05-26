import ContentPageClient from './client/ContentPageClient';
import { BASE_URL, REVALIDATE_INTERVAL } from './constants';
import type { JSX } from 'react';
import type { Movie } from './types';

const MOVIES_PER_PAGE = 6;
const SORT_BY = 'primary_release_date.desc';

type LatestMoviesResponse = {
  results: Movie[];
  total_pages: number;
};

export default async function HomePage(): Promise<JSX.Element> {
  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();

  const apiUrl = [
    `${BASE_URL}/discover/movie?`,
    `api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
    `sort_by=${SORT_BY}`,
    `primary_release_date.gte=${currentYear}-01-01`,
    `primary_release_date.lte=${today}`,
    'page=1',
  ].join('&');

  let data: LatestMoviesResponse;

  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: REVALIDATE_INTERVAL }, // ISR: revalidate every 60s
    });

    if (!response.ok) {
      throw new Error(`TMDB fetch failed with status ${response.status}`);
    }

    data = await response.json();
  } catch (error) {
    console.error('[HomePage Error]', error);
    throw new Error('Failed to load latest movies. Please try again later.');
  }

  return (
    <ContentPageClient
      title="Latest Movies"
      apiUrl={apiUrl}
      initialMovies={data.results.slice(0, MOVIES_PER_PAGE)}
      perPage={MOVIES_PER_PAGE}
    />
  );
}
