// app/api/reviews/route.ts
import path from 'path';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth-config';

// Path to the local reviews data file
const REVIEWS_FILE = path.join(process.cwd(), 'app/data/reviews.json');

type ReviewEntry = {
  username: string;
  movieId: number;
  rating: number;
  comment: string;
};

// POST: Submit or update a movie review
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    console.warn('[Reviews] Unauthorized access attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const username = session.user.name;

  try {
    const { movieId, rating, comment } = await req.json();

    // Basic validation
    if (
      typeof movieId !== 'number' ||
      typeof rating !== 'number' ||
      typeof comment !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid or missing fields' }, { status: 400 });
    }

    let reviews: ReviewEntry[] = [];

    // Load existing reviews, if available
    try {
      const content = await fs.readFile(REVIEWS_FILE, 'utf-8');
      reviews = JSON.parse(content);
    } catch {
      console.warn('[Reviews] No existing reviews.json found. Initializing empty list.');
    }

    // Check if the user already submitted a review for the movie
    const existingIndex = reviews.findIndex(
      (entry) => entry.username === username && entry.movieId === movieId
    );

    if (existingIndex !== -1) {
      reviews[existingIndex] = { username, movieId, rating, comment };
    } else {
      reviews.push({ username, movieId, rating, comment });
    }

    await fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

// GET: Fetch the current user's review for a specific movie
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const movieIdParam = searchParams.get('movieId');
  const movieId = movieIdParam ? parseInt(movieIdParam, 10) : NaN;

  if (isNaN(movieId)) {
    return NextResponse.json({ error: 'Missing or invalid movieId' }, { status: 400 });
  }

  try {
    const content = await fs.readFile(REVIEWS_FILE, 'utf-8');
    const reviews: ReviewEntry[] = JSON.parse(content);

    const userReview = reviews.find(
      (entry) => entry.username === session?.user?.name && entry.movieId === movieId
    );

    // Return review if found, otherwise 204 No Content
  return userReview
    ? NextResponse.json(userReview)
    : new Response(null, { status: 204 });
  } catch (err) {
    console.error('[Reviews] Failed to read reviews file:', err);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}
