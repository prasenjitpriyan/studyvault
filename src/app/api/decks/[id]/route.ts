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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();
    
    // Find and delete the deck
    const deck = await Deck.findOneAndDelete({ _id: id, userId });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found.' }, { status: 404 });
    }

    // Delete all flashcards belonging to this deck
    await Flashcard.deleteMany({ deckId: id, userId });

    return NextResponse.json({ success: true, message: 'Deck and associated flashcards deleted.' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('DELETE deck error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
