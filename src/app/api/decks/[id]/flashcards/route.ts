import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Deck from '@/models/Deck';
import Flashcard from '@/models/Flashcard';
import { verifyToken } from '@/lib/auth';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  const verified = await verifyToken(token);
  return verified ? verified.userId : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id: deckId } = await params;

    await connectToDatabase();
    
    // Verify deck belongs to user
    const deck = await Deck.findOne({ _id: deckId, userId });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found.' }, { status: 404 });
    }

    const flashcards = await Flashcard.find({ deckId, userId }).sort({ nextReview: 1 });
    return NextResponse.json({ success: true, flashcards });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('GET flashcards error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id: deckId } = await params;
    const body = await request.json();
    const { front, back } = body;

    if (!front || !back) {
      return NextResponse.json({ error: 'Front and back content are required.' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify deck belongs to user
    const deck = await Deck.findOne({ _id: deckId, userId });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found.' }, { status: 404 });
    }

    const flashcard = new Flashcard({
      deckId,
      userId,
      front,
      back,
    });
    await flashcard.save();

    return NextResponse.json({ success: true, flashcard });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('POST flashcard error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
