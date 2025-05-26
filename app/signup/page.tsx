'use client';

import { useState, useEffect, type JSX, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { Toaster, toast } from 'react-hot-toast';
import Link from 'next/link';

const SIGNUP_API = '/api/auth/signup';
const HOME_ROUTE = '/';
const LOGIN_ROUTE = '/login';

const SignupPage = (): JSX.Element => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(HOME_ROUTE);
    }
  }, [status, router]);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      const res = await fetch(SIGNUP_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Signup successful!');

        const loginRes = await signIn('credentials', {
          redirect: false,
          username,
          password,
        });

        if (loginRes?.ok) {
          toast.dismiss();
          router.push(HOME_ROUTE);
        } else {
          toast.error('Signup succeeded but login failed.');
        }
      } else {
        toast.error(data?.error || 'Signup failed.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unexpected error');
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] bg-gray-900 text-white flex items-center justify-center px-4">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #4f46e5',
            padding: '12px 16px',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#1f2937',
            },
          },
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded w-full max-w-sm shadow space-y-4"
      >
        <h2 className="text-xl font-bold text-center">Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 transition w-full py-2 rounded font-semibold"
        >
          Create Account
        </button>

        <p className="text-sm text-gray-400 text-center mt-2">
          Already have an account?{' '}
          <Link href={LOGIN_ROUTE} className="text-indigo-400 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
