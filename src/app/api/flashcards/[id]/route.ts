import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Flashcard from '@/models/Flashcard';
import { verifyToken } from '@/lib/auth';

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
    const { rating } = body; // 'easy' | 'good' | 'hard'

    if (!rating || !['easy', 'good', 'hard'].includes(rating)) {
      return NextResponse.json({ error: 'Valid rating ("easy", "good", "hard") is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const card = await Flashcard.findOne({ _id: id, userId });

    if (!card) {
      return NextResponse.json({ error: 'Flashcard not found.' }, { status: 404 });
    }

    // SM-2 Spaced Repetition Algorithm
    // Map rating to response quality q (0-5)
    // 5: perfect response (easy)
    // 4: correct response after a hesitation (good)
    // 2: incorrect response; where the correct one seemed easy to recall (hard)
    let q = 4;
    if (rating === 'easy') q = 5;
    else if (rating === 'hard') q = 2;

    let repetitions = card.repetitions || 0;
    let interval = card.interval || 0;
    let easeFactor = card.easeFactor || 2.5;

    if (q >= 3) {
      if (repetitions === 0) {
        interval = 1; // 1 day
      } else if (repetitions === 1) {
        interval = 6; // 6 days
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions++;
    } else {
      repetitions = 0;
      interval = 1; // Reset interval to 1 day
    }

    // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easeFactor < 1.3) {
      easeFactor = 1.3;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    card.repetitions = repetitions;
    card.interval = interval;
    card.easeFactor = easeFactor;
    card.nextReview = nextReview;

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
