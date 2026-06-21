import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const navLinkClass = ({ isActive }) =>
    [
        'rounded-md px-3 py-2 text-sm font-medium transition',
        isActive
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
    ].join(' ');

function SearchIcon({ className = '' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
    );
}

function ArrowRightIcon({ className = '' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}

const searchableRoutes = [
    { label: 'home', path: '/' },
    { label: 'login', path: '/login' },
    { label: 'register', path: '/register' },
    { label: 'dashboard', path: '/dashboard' },
    { label: 'chat', path: '/chat' },
    { label: 'items', path: '/items' },
];

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = async () => {
        await logout();
        navigate('/', { replace: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        const normalizedQuery = searchQuery.trim().toLowerCase();
        if (!normalizedQuery) {
            return;
        }

        const match = searchableRoutes.find((route) =>
            route.label.includes(normalizedQuery)
        );

        if (match) {
            navigate(match.path);
            setSearchQuery('');
            setSearchOpen(false);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearchQuery('');
            setSearchOpen(false);
        }
    };

    return (
        <header className="border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link to="/" className="text-lg font-bold text-gray-900 dark:text-white">
                    React Django App
                </Link>

                <div className="flex items-center gap-2">
                    {searchOpen ? (
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative flex items-center"
                        >
                            <span className="pointer-events-none absolute left-3 text-gray-400 dark:text-gray-500">
                                <SearchIcon className="h-4 w-4" />
                            </span>

                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                autoFocus
                                placeholder="Search..."
                                className="w-48 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                            />

                            <button
                                type="submit"
                                aria-label="Search"
                                className="absolute right-2 rounded-md p-1 text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                            >
                                <ArrowRightIcon className="h-4 w-4" />
                            </button>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setSearchOpen(true)}
                            aria-label="Open search"
                            className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                            <SearchIcon className="h-4 w-4" />
                        </button>
                    )}

                    <NavLink to="/" end className={navLinkClass}>
                        Home
                    </NavLink>

                    {user ? (
                        <>
                            <NavLink to="/dashboard" className={navLinkClass}>
                                Dashboard
                            </NavLink>
                            <NavLink to="/chat" className={navLinkClass}>
                                Chat
                            </NavLink>
                            <NavLink to="/items" className={navLinkClass}>
                                Items
                            </NavLink>

                            <span className="ml-3 hidden text-sm text-gray-500 sm:inline dark:text-gray-400">
                                {user.username}
                            </span>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={navLinkClass}>
                                Login
                            </NavLink>
                            <NavLink to="/register" className={navLinkClass}>
                                Register
                            </NavLink>
                        </>
                    )}

                    <ThemeToggle />
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
