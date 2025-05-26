import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'users.json');

interface StoredUser {
  id: string;
  username: string;
  hashedPassword: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        const fileContents = await fs.readFile(USERS_FILE_PATH, 'utf-8');
        const users: StoredUser[] = JSON.parse(fileContents);
        const matchedUser = users.find((u) => u.username === credentials.username);
        if (!matchedUser) return null;
        const isValid = await bcrypt.compare(credentials.password, matchedUser.hashedPassword);
        return isValid ? { id: matchedUser.id, name: matchedUser.username } : null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 3600,
    updateAge: 900,
  },
  callbacks: {
    async jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000);
      if (user) {
        token.user = user;
        token.exp = now + 3600;
      }
      if (token.exp && typeof token.exp === 'number' && now > token.exp) {
        throw new Error('JWT token expired');
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as { name?: string | null; email?: string | null; image?: string | null };
      session.expires = new Date((token.exp as number) * 1000).toISOString();
      return session;
    },
  },
};
