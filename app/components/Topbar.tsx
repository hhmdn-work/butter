'use client';

import { FC, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

enum Routes {
  Home = '/',
  Login = '/login',
  Signup = '/signup',
  Watchlist = '/watchlist',
}

const Topbar: FC = () => <TopbarContent />;

const TopbarContent: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: Routes.Home });
  };

  return (
    <header className="relative h-[80px] sm:h-[100px] bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-md">
      <div className="relative h-full flex items-center justify-center px-4 sm:px-6">
        {/* Centered Logo */}
        <Link
          href={Routes.Home}
          className="absolute left-1/2 transform -translate-x-1/2 flex items-center h-full"
        >
          <div className="relative h-full w-[100px] sm:w-[140px]">
            <Image
              src="/images/butter-logo.png"
              alt="Butter logo"
              fill
              className="object-contain select-none"
              sizes="(max-width: 768px) 120px, 140px"
              priority
            />
          </div>
        </Link>

        {/* Avatar Dropdown */}
        <div className="absolute right-4 sm:right-10" tabIndex={0} ref={menuRef}>
          <button
            data-testid="user-dropdown-option"
            onClick={() => setIsOpen((prev) => !prev)}
            className="rounded-full ring-2 ring-indigo-500 hover:ring-indigo-400 transition duration-200 p-[1px] sm:p-[2px]"
            aria-label="User menu"
          >
            <Image
              src="/images/avatar.png"
              alt="User avatar"
              width={36}
              height={36}
              className="rounded-full select-none sm:w-12 sm:h-12 w-9 h-9"
            />
          </button>

          {isOpen && (
            <nav className="absolute right-0 top-full mt-2 w-32 sm:w-40 bg-indigo-800 text-white rounded-md shadow-[0_8px_20px_rgba(0,0,0,0.6)] z-50 text-sm">
              {!session?.user ? (
                <>
                  <Link
                    data-testid="login-option"
                    href={Routes.Login}
                    className="block px-4 py-2 hover:bg-indigo-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href={Routes.Signup}
                    className="block px-4 py-2 hover:bg-indigo-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    data-testid="watchlist-option"
                    href={Routes.Watchlist}
                    className="block px-4 py-2 hover:bg-indigo-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Watchlist
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-indigo-700"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
