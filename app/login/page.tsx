'use client';

import { useState, FormEvent, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import CustomToaster from '../components/CustomToaster';

enum Label {
  Username = 'Username',
  Password = 'Password',
  LoginFailed = 'Login failed: Invalid credentials',
  LoginTitle = 'Login',
  SignIn = 'Sign In',
  NoAccount = 'Don’t have an account?',
  SignUp = 'Sign up',
}

export default function LoginPage(): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (res?.ok) {
      router.push('/');
      router.refresh();
    } else {
      toast.error(Label.LoginFailed);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] bg-gray-900 text-white flex items-center justify-center">
      <CustomToaster />

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded w-96 shadow space-y-4"
        aria-label="Login Form"
      >
        <h2 className="text-xl font-bold">{Label.LoginTitle}</h2>

        <input
          type="text"
          placeholder={Label.Username}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <input
          type="password"
          placeholder={Label.Password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 transition w-full py-2 rounded font-semibold"
        >
          {Label.SignIn}
        </button>

        <p className="text-sm text-gray-400 text-center mt-2">
          {Label.NoAccount}{' '}
          <Link href="/signup" className="text-indigo-400 hover:underline">
            {Label.SignUp}
          </Link>
        </p>
      </form>
    </div>
  );
}
