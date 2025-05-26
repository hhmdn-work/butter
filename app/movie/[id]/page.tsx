'use client';

import { useState, useEffect, useCallback, type JSX } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Paginator from '../../components/Paginator';
import LoadingDotsOverlay from '../../components/LoadingDotsOverlay';

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  runtime: number;
  production_companies: { id: number; name: string }[];
  imdb_id: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Review {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

interface MovieDetailProps {
  params: { id: string };
}

export default function MovieDetail({ params }: MovieDetailProps): JSX.Element {
  const { data: session } = useSession();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReview, setLoadingReview] = useState(true);
  const [rating, setRating] = useState(1);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [posterLoading, setPosterLoading] = useState(true);
  const [castLoading, setCastLoading] = useState<Record<number, boolean>>({});

  const reviewsPerPage = 2;
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  const fetchMovieData = useCallback(async () => {
    try {
      const movieId = params.id;

      const [movieRes, creditsRes, reviewsRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`),
        fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`),
        fetch(`https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${apiKey}`),
      ]);

      const movieData: Movie = await movieRes.json();
      const creditsData = await creditsRes.json();
      const reviewsData = await reviewsRes.json();

      setMovie(movieData);
      setCast(creditsData.cast.slice(0, 10));
      setReviews(reviewsData.results.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch movie data:', error);
    }
  }, [params.id, apiKey]);


  const fetchUserReview = useCallback(async () => {
    if (!session?.user?.name || !movie?.id) return;

    try {
      const res = await fetch(`/api/reviews?movieId=${movie.id}`);
      if (res.status === 204) return;

      if (!res.ok) return;

      const data = await res.json();
      setRating(data.rating || 1);
      setReviewText(data.comment || '');
      setSubmitted(true);
    } catch (err) {
      console.error('[Review Fetch] Failed:', err);
    } finally {
      setLoadingReview(false);
    }
  }, [session?.user?.name, movie?.id]);


  useEffect(() => {
    fetchMovieData();
  }, [fetchMovieData]);

  useEffect(() => {
    fetchUserReview();
  }, [fetchUserReview]);

  const handleReviewSubmit = async () => {
    if (!session?.user?.name || !movie?.id) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movie.id,
          rating,
          comment: reviewText,
        }),
      });

      if (res.ok) setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  useEffect(() => {
    fetchMovieData();
  }, [params.id, fetchMovieData]);

  useEffect(() => {
    fetchUserReview();
  }, [session?.user?.name, movie?.id, fetchUserReview]);

  if (!movie) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-60">
        <div className="flex space-x-1">
          {[0.3, 0.15, 0].map((delay, i) => (
            <span
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: `-${delay}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const currentReviews = reviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="relative w-full aspect-[2/3] max-w-[300px] mx-auto">
        <Image
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : '/images/fallback.png'
          }
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 120px, 140px"
          className={`object-contain rounded-lg shadow-lg transition-opacity ${
            posterLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setPosterLoading(false)}
        />
        {posterLoading && (
          <LoadingDotsOverlay />
        )}
      </div>


        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
          <p className="text-gray-300 mb-6">{movie.overview}</p>
          <ul className="text-gray-400 space-y-2">
            <li><strong className="text-white">Release Date:</strong> {movie.release_date}</li>
            <li><strong className="text-white">Rating:</strong> {movie.vote_average}/10</li>
            <li><strong className="text-white">Votes:</strong> {movie.vote_count}</li>
            <li><strong className="text-white">Runtime:</strong> {movie.runtime} mins</li>
            <li><strong className="text-white">Genres:</strong> {movie.genres.map(g => g.name).join(', ')}</li>
            <li><strong className="text-white">Companies:</strong> {movie.production_companies.map(c => c.name).join(', ')}</li>
          </ul>
        </div>
      </div>

      {/* Cast */}
      <section className="max-w-5xl mx-auto mt-12">
        <h2 className="text-2xl font-semibold mb-4 border-b border-indigo-800 h-[40px]">Top Cast</h2>
        {cast.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mt-12">
            {cast.map((actor) => (
              <div key={actor.id} className="text-center">
                <Image
                  src={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                      : '/images/fallback.png'
                  }
                  alt={actor.name}
                  width={120}
                  height={180}
                  className={`rounded-md mx-auto ${
                    castLoading[actor.id] ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() =>
                    setCastLoading((prev) => ({ ...prev, [actor.id]: false }))
                  }
                />
                {castLoading[actor.id] && <LoadingDotsOverlay />}
                <p className="mt-2 font-medium text-sm">{actor.name}</p>
                <p className="text-gray-400 text-xs">as {actor.character}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic mt-6">No cast members available.</p>
        )}
      </section>

      {/* My Review */}
      {session?.user?.name && !loadingReview && (
        <section className="max-w-5xl mx-auto mt-12">
          <h2 className="text-2xl font-semibold mb-4 border-b border-indigo-800 h-[40px]">
            My Review {submitted && <span className="ml-2 text-green-400 text-sm">(Submitted)</span>}
          </h2>
          <div className="bg-gray-900 p-4 rounded-lg space-y-4">
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  onClick={() => !submitted && setRating(star)}
                  onMouseEnter={() => !submitted && setHover(star)}
                  onMouseLeave={() => !submitted && setHover(0)}
                  className={`w-6 h-6 ${
                    star <= (hover || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-500'
                  } ${submitted ? 'cursor-default opacity-70' : 'cursor-pointer'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.95c.3.921-.755 1.688-1.538 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.197-1.538-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.075 9.377c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.95z" />
                </svg>
              ))}
            </div>

            <textarea
              disabled={submitted}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className={`w-full h-24 p-2 rounded-md border ${
                submitted ? 'bg-gray-800 cursor-not-allowed' : 'bg-gray-400 text-black'
              } placeholder:text-gray-900`}
              placeholder={submitted ? '' : 'Write your review here...'}
            />

            <button
              onClick={() => (submitted ? setSubmitted(false) : handleReviewSubmit())}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md"
            >
              {submitted ? 'Edit' : 'Submit'}
            </button>
          </div>
        </section>
      )}

      {/* Other Reviews */}
      <section className="max-w-5xl mx-auto mt-12">
        <h2 className="text-2xl font-semibold mb-4 border-b border-indigo-800 h-[40px] mb-5">User Reviews</h2>
        {currentReviews.length > 0 ? (
          <div className="space-y-6">
            {currentReviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-800 p-5 rounded-lg border border-gray-700 shadow-sm"
              >
                <p className="text-sm text-gray-300 mb-3 leading-relaxed whitespace-pre-wrap">
                  {review.content}
                </p>
                <div className="text-xs text-right text-gray-500 italic">
                  — {review.author},{' '}
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">No reviews available for this movie.</p>
        )}


        {/* Paginator */}
        {totalPages > 1 && (
          <Paginator
            currentPage={currentPage}
            maxPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* IMDb Link */}
        {movie.imdb_id && (
          <div className="mt-6 text-center">
            <a
              href={`https://www.imdb.com/title/${movie.imdb_id}/reviews`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Read more reviews on IMDb
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
