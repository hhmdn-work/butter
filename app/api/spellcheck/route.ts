import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import nspell from 'nspell';

// Define interface for incoming request
interface SpellRequestBody {
  word: string;
}

// POST handler for spellchecking words
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = (await req.json()) as SpellRequestBody;
    const { word } = body;

    // Validate input
    if (!word || typeof word !== 'string') {
      return NextResponse.json({ suggestions: [] });
    }

    // Construct absolute paths to the dictionary files
    const affPath = join(process.cwd(), 'public', 'dict', 'en_US.aff');
    const dicPath = join(process.cwd(), 'public', 'dict', 'en_US.dic');

    // Load both files in parallel
    const [aff, dic] = await Promise.all([
      readFile(affPath, 'utf-8'),
      readFile(dicPath, 'utf-8'),
    ]);

    const spellChecker = nspell(aff, dic);

    // If word is already correct, return empty suggestion list
    if (spellChecker.correct(word)) {
      return NextResponse.json({ suggestions: [] });
    }

    // Return top 5 suggestions
    const suggestions = spellChecker.suggest(word).slice(0, 5);
    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('[Spellcheck Error]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
