// app/now-playing/page.tsx
'use client';

import { FC } from 'react';
import ContentPageClient from '../client/ContentPageClient';
import { BASE_URL } from '../constants';

// Constants
const ITEMS_PER_PAGE = 6;
const NOW_PLAYING_ENDPOINT = `${BASE_URL}/movie/now_playing`;

/**
 * Displays movies that are currently in theaters.
 */
const NowPlayingPage: FC = () => {
  const apiUrl = `${NOW_PLAYING_ENDPOINT}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`;

  return (
    <ContentPageClient
      title="Now Playing"
      apiUrl={apiUrl}
      perPage={ITEMS_PER_PAGE}
    />
  );
};

export default NowPlayingPage;
