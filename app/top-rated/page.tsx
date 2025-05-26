'use client';

import { FC } from 'react';
import ContentPageClient from '../client/ContentPageClient';
import { BASE_URL } from '../constants';

/**
 * Constants
 */
const API_PATH = '/movie/top_rated';
const ITEMS_PER_PAGE = 6;

const apiUrl = `${BASE_URL}${API_PATH}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;

/**
 * TopRatedPage component displays the highest-rated movies
 * using the shared <ContentPageClient /> with pagination or infinite mode.
 */
const TopRatedPage: FC = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <ContentPageClient
        title="Top Rated Movies"
        apiUrl={apiUrl}
        perPage={ITEMS_PER_PAGE}
      />
    </div>
  );
};

export default TopRatedPage;
