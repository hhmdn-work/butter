import { POST } from '../../../api/spellcheck/route';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

// Mock nspell
const suggestMock = jest.fn();
const correctMock = jest.fn();
jest.mock('nspell', () => {
  return jest.fn(() => ({
    suggest: suggestMock,
    correct: correctMock,
  }));
});

import { readFile } from 'fs/promises';

type SpellRequestBody = { word: string };

describe('POST /api/spellcheck', () => {
  const createRequest = (data: SpellRequestBody) =>
    new Request('http://localhost/api/spellcheck', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns suggestions for misspelled word', async () => {
    (readFile as jest.Mock).mockResolvedValue('aff_or_dic_content');
    correctMock.mockReturnValue(false);
    suggestMock.mockReturnValue(['hello', 'hell', 'help', 'halo', 'hill']);

    const req = createRequest({ word: 'helo' });
    const res = await POST(req);
    const json = await res.json();

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(correctMock).toHaveBeenCalledWith('helo');
    expect(suggestMock).toHaveBeenCalledWith('helo');
    expect(json.suggestions).toEqual(['hello', 'hell', 'help', 'halo', 'hill']);
  });

  it('returns empty suggestions if word is correct', async () => {
    (readFile as jest.Mock).mockResolvedValue('aff_or_dic_content');
    correctMock.mockReturnValue(true);

    const req = createRequest({ word: 'hello' });
    const res = await POST(req);
    const json = await res.json();

    expect(json.suggestions).toEqual([]);
  });

  it('returns empty suggestions on invalid input', async () => {
    const req = createRequest({ word: 'oops' });
    const res = await POST(req);
    const json = await res.json();

    expect(json.suggestions).toEqual([]);
  });

  it('returns 500 on thrown error', async () => {
    (readFile as jest.Mock).mockRejectedValue(new Error('File error'));

    const req = createRequest({ word: 'test' });
    const res = await POST(req);

    expect(res.status).toBe(500);
  });
});
