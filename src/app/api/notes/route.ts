import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Note from '@/models/Note';
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
    const notes = await Note.find({ userId }).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, notes });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('GET notes error:', err);
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
    const { title, content, folder, tags } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const newNote = new Note({
      userId,
      title,
      content: content || '',
      folder: folder || 'General',
      tags: tags || [],
    });
    await newNote.save();

    return NextResponse.json({ success: true, note: newNote });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('POST notes error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
