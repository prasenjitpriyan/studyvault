import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Flashcard from '@/models/Flashcard';
import { verifyToken } from '@/lib/auth';
import { calculateSM2, SM2Rating } from '@/lib/sm2';

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  const verified = await verifyToken(token);
  return verified ? verified.userId : null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { rating, front, back } = body;

    await connectToDatabase();
    const card = await Flashcard.findOne({ _id: id, userId });

    if (!card) {
      return NextResponse.json({ error: 'Flashcard not found.' }, { status: 404 });
    }

    // Support editing front/back content
    if (front !== undefined) card.front = front;
    if (back !== undefined) card.back = back;

    // If rating is provided, execute decoupled SM-2 calculation
    if (rating) {
      if (!['again', 'hard', 'good', 'easy'].includes(rating)) {
        return NextResponse.json(
          { error: 'Valid rating ("again", "hard", "good", "easy") is required.' },
          { status: 400 }
        );
      }

      const sm2Result = calculateSM2(
        {
          easeFactor: card.easeFactor,
          interval: card.interval,
          repetitions: card.repetitions,
          nextReview: card.nextReview,
        },
        rating as SM2Rating
      );

      card.repetitions = sm2Result.repetitions;
      card.interval = sm2Result.interval;
      card.easeFactor = sm2Result.easeFactor;
      card.nextReview = sm2Result.nextReview;
    }

    await card.save();

    return NextResponse.json({ success: true, flashcard: card });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('PUT flashcard error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
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
    const card = await Flashcard.findOneAndDelete({ _id: id, userId });

    if (!card) {
      return NextResponse.json({ error: 'Flashcard not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Flashcard deleted successfully.' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('DELETE flashcard error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
