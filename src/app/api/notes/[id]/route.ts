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
    const { title, content, folder, tags, isFavorite } = body;

    await connectToDatabase();
    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      return NextResponse.json({ error: 'Note not found.' }, { status: 444 });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (folder !== undefined) note.folder = folder;
    if (tags !== undefined) note.tags = tags;
    if (isFavorite !== undefined) note.isFavorite = isFavorite;

    await note.save();

    return NextResponse.json({ success: true, note });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('PUT note error:', err);
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
    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) {
      return NextResponse.json({ error: 'Note not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Note deleted successfully.' });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('DELETE note error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
