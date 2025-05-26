'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Film,
  Search,
  Play,
  Star,
} from 'lucide-react';

enum SidebarStyle {
  container = 'fixed top-0 left-0 h-full w-64 z-40 bg-indigo-950 text-gray-100 transform transition-transform duration-500 ease-in-out shadow-xl border-r border-indigo-800 pt-20',
  button = 'fixed top-4 left-4 sm:top-8 sm:left-10 z-50 p-2 text-white bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 rounded-full shadow-lg transition sm:block',
  searchContainer = 'px-4 py-4 border-b border-indigo-800',
  searchInput = 'bg-transparent text-sm text-gray-100 placeholder-gray-400 focus:outline-none w-full',
  searchWrapper = 'flex items-center bg-indigo-800 px-3 py-2 rounded-md',
  navMenu = 'mt-4 flex flex-col gap-2 px-4',
  navItem = 'flex items-center p-3 rounded-md hover:bg-indigo-700 hover:text-white transition duration-200',
  backdrop = 'fixed inset-0 bg-black bg-opacity-50 z-30',
}

interface NavItem {
  href: string;
  title: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', title: 'Latest', icon: Film },
  { href: '/now-playing', title: 'Now Playing', icon: Play },
  { href: '/top-rated', title: 'Top Rated', icon: Star },
];

const Sidebar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const closeSidebar = () => setIsOpen(false);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (!trimmed) return;
    router.push(`/search?query=${encodeURIComponent(trimmed)}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Responsive Menu Toggle Button */}
      <button
        className={SidebarStyle.button}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Panel */}
      <aside
        className={`${SidebarStyle.container} ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Search Field */}
        <form onSubmit={handleSearchSubmit} className={SidebarStyle.searchContainer}>
          <div className={SidebarStyle.searchWrapper}>
            <Search className="w-4 h-4 text-gray-300 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Movies..."
              className={SidebarStyle.searchInput}
              aria-label="Search Movies"
            />
          </div>
        </form>

        {/* Navigation Links */}
        <nav className={SidebarStyle.navMenu}>
          {NAV_ITEMS.map(({ href, title, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={closeSidebar}
              className={SidebarStyle.navItem}
            >
              <Icon className="w-4 h-4 mr-2" />
              {title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Dimmed Backdrop */}
      {isOpen && (
        <div className={SidebarStyle.backdrop} onClick={closeSidebar} role="presentation" />
      )}
    </>
  );
};

export default Sidebar;
