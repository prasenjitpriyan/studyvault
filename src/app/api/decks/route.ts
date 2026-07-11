import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Deck from '@/models/Deck';
import { verifyToken } from '@/lib/auth';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  const verified = await verifyToken(token);
  return verified ? verified.userId : null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await connectToDatabase();
    const decks = await Deck.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, decks });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('GET decks error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Deck name is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const newDeck = new Deck({
      userId,
      name,
      description: description || '',
    });
    await newDeck.save();

    return NextResponse.json({ success: true, deck: newDeck });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('POST decks error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
