import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Local file path for storing users
const USERS_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'users.json');

// Type definition for user objects
interface StoredUser {
  id: string;
  username: string;
  hashedPassword: string;
}

// POST /api/auth/signup — Creates a new user
export async function POST(req: Request) {
  try {
    const { username, password }: { username?: string; password?: string } = await req.json();

    // Basic input validation
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Initialize user list
    let users: StoredUser[] = [];

    try {
      // Attempt to read existing users from file
      const fileContent = await fs.readFile(USERS_FILE_PATH, 'utf-8');
      users = JSON.parse(fileContent) as StoredUser[];
    } catch {
      // File may not exist yet (first-time run)
      users = [];
    }

    // Check if username is already taken
    const userExists = users.some((u) => u.username === username);
    if (userExists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Securely hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and store new user
    const newUser: StoredUser = {
      id: Date.now().toString(),
      username,
      hashedPassword,
    };

    users.push(newUser);

    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
