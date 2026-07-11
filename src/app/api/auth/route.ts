import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, comparePassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { action, username, email, password } = body;

    // --- SIGN UP ACTION ---
    if (action === 'signup') {
      if (!username || !email || !password) {
        return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return NextResponse.json({ error: 'Username or email already exists.' }, { status: 400 });
      }

      // Hash password and save user
      const passwordHash = await hashPassword(password);
      const user = new User({
        username,
        email,
        passwordHash,
      });
      await user.save();

      // Sign token
      const token = await signToken({ userId: user._id.toString(), email: user.email });

      const response = NextResponse.json({
        success: true,
        user: { id: user._id, username: user.username, email: user.email },
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    // --- LOGIN ACTION ---
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
      }

      const isPasswordMatch = await comparePassword(password, user.passwordHash);
      if (!isPasswordMatch) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
      }

      // Sign token
      const token = await signToken({ userId: user._id.toString(), email: user.email });

      const response = NextResponse.json({
        success: true,
        user: { id: user._id, username: user.username, email: user.email },
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    // --- LOGOUT ACTION ---
    if (action === 'logout') {
      const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
      response.cookies.delete('token');
      return response;
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Authentication API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
