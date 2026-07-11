import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Task from '@/models/Task';
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
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, tasks });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('GET tasks error:', err);
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
    const { title, status, priority, dueDate } = body;

    if (!title) {
      return NextResponse.json({ error: 'Task title is required.' }, { status: 400 });
    }

    await connectToDatabase();
    const newTask = new Task({
      userId,
      title,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    await newTask.save();

    return NextResponse.json({ success: true, task: newTask });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('POST tasks error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
