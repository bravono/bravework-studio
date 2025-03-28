import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock database - replace with your actual database
const users: any[] = [
  {
    id: 'USER1',
    fullName: 'Test User',
    email: 'test@example.com',
    // This is a fresh hash for 'password123'
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    createdAt: new Date().toISOString()
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt:', { email }); // Log login attempt (without password)

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find user
    const user = users.find(user => user.email === email);
    if (!user) {
      console.log('User not found:', email); // Log when user is not found
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password verification:', { isValid: isValidPassword }); // Log password verification result

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return success response with token
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 