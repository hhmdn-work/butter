// app/api/watchlist/route.ts

import path from 'path';
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/auth-config';

const WATCHLIST_FILE = path.join(process.cwd(), 'app/data/watchlist.json');

type WatchlistData = Record<string, number[]>;

/**
 * GET /api/watchlist
 * Returns the current user's watchlist.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const content = await fs.readFile(WATCHLIST_FILE, 'utf-8');
    const data: WatchlistData = JSON.parse(content);
    const userList = data[session.user.name] || [];

    return NextResponse.json(userList);
  } catch (error) {
    console.error('[Watchlist] Read error:', error);
    return NextResponse.json([], { status: 200 }); // fallback to empty array
  }
}

/**
 * POST /api/watchlist
 * Adds a movie to the user's watchlist.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const username = session.user.name;

  try {
    const { movieId } = await req.json();

    if (typeof movieId !== 'number') {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    let data: WatchlistData = {};

    // Read existing file or initialize
    try {
      const content = await fs.readFile(WATCHLIST_FILE, 'utf-8');
      data = JSON.parse(content);
    } catch {
      console.warn('[Watchlist] Creating new watchlist file.');
    }

    // Initialize user entry
    if (!data[username]) {
      data[username] = [];
    }

    // Add movie if not already present
    if (!data[username].includes(movieId)) {
      data[username].push(movieId);

      try {
        await fs.writeFile(WATCHLIST_FILE, JSON.stringify(data, null, 2), 'utf-8');
      } catch (writeErr) {
        console.error('[Watchlist] Write error:', writeErr);
        return NextResponse.json({ error: 'Failed to save watchlist' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, watchlist: data[username] });
  } catch (err) {
    console.error('[Watchlist] Unexpected POST error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

/**
 * DELETE /api/watchlist
 * Removes a movie from the user's watchlist.
 */
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const username = session.user.name;

  try {
    const { movieId } = await req.json();

    if (typeof movieId !== 'number') {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    const content = await fs.readFile(WATCHLIST_FILE, 'utf-8');
    const data: WatchlistData = JSON.parse(content);

    if (!data[username]) {
      return NextResponse.json({ error: 'Watchlist not found' }, { status: 404 });
    }

    data[username] = data[username].filter((id) => id !== movieId);

    await fs.writeFile(WATCHLIST_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({ success: true, watchlist: data[username] });
  } catch (err) {
    console.error('[Watchlist] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to update watchlist' }, { status: 500 });
  }
}
