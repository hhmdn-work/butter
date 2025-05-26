import { GET, POST, DELETE } from '../../../api/watchlist/route';
import { promises as fs } from 'fs';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

const mockReadFile = fs.readFile as jest.Mock;
const mockWriteFile = fs.writeFile as jest.Mock;
const mockGetSession = getServerSession as jest.Mock;

type WatchlistRequestBody = { movieId: number };

describe('/api/watchlist route', () => {
  const username = 'admin';

  const makeRequest = (method: 'POST' | 'DELETE', body: WatchlistRequestBody) =>
    new Request('http://localhost/api/watchlist', {
      method,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }) as NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 if not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it('returns watchlist for authenticated user', async () => {
      mockGetSession.mockResolvedValue({ user: { name: username } });
      mockReadFile.mockResolvedValue(JSON.stringify({ [username]: [1, 2, 3] }));

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual([1, 2, 3]);
    });

    it('returns empty list on read error', async () => {
      mockGetSession.mockResolvedValue({ user: { name: username } });
      mockReadFile.mockRejectedValue(new Error('fail'));

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe('POST', () => {
    it('returns 401 if not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);
      const res = await POST(makeRequest('POST', { movieId: 1 }));
      expect(res.status).toBe(401);
    });

    it('adds movie to watchlist', async () => {
      mockGetSession.mockResolvedValue({ user: { name: username } });
      mockReadFile.mockResolvedValue(JSON.stringify({ [username]: [1, 2] }));
      mockWriteFile.mockResolvedValue(undefined);

      const res = await POST(makeRequest('POST', { movieId: 3 }));
      const data = await res.json();

      expect(mockWriteFile).toHaveBeenCalled();
      expect(data).toEqual({ success: true, watchlist: [1, 2, 3] });
    });
  });

  describe('DELETE', () => {
    it('removes movie from watchlist', async () => {
      mockGetSession.mockResolvedValue({ user: { name: username } });
      mockReadFile.mockResolvedValue(JSON.stringify({ [username]: [1, 2, 3] }));
      mockWriteFile.mockResolvedValue(undefined);

      const res = await DELETE(makeRequest('DELETE', { movieId: 2 }));
      const data = await res.json();

      expect(mockWriteFile).toHaveBeenCalled();
      expect(data).toEqual({ success: true, watchlist: [1, 3] });
    });

    it('returns 404 if user has no watchlist', async () => {
      mockGetSession.mockResolvedValue({ user: { name: username } });
      mockReadFile.mockResolvedValue(JSON.stringify({}));

      const res = await DELETE(makeRequest('DELETE', { movieId: 1 }));
      expect(res.status).toBe(404);
    });
  });
});
