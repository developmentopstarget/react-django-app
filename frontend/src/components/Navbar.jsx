import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const navLinkClass = ({ isActive }) =>
    [
        'rounded-md px-3 py-2 text-sm font-medium transition',
        isActive
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
    ].join(' ');

const mobileNavLinkClass = ({ isActive }) =>
    [
        'block rounded-lg px-3 py-2 text-sm font-medium transition',
        isActive
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white',
    ].join(' ');

function SearchIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
    );
}

function ArrowRightIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}

function BellIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.27 21a2 2 0 0 0 3.46 0" />
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        </svg>
    );
}

function MenuIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
        </svg>
    );
}

function CloseIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
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

const notifications = [
    {
        id: 1,
        title: 'Chat history ready',
        message: 'Your saved chat messages are available in Chat.',
        time: 'Now',
    },
    {
        id: 2,
        title: 'Items workspace active',
        message: 'Create, edit, and delete your user-owned items.',
        time: 'Today',
    },
    {
        id: 3,
        title: 'Dashboard updated',
        message: 'Account, Items, and Chat cards are ready.',
        time: 'Today',
    },
];

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const notificationsRef = useRef(null);

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
            setMobileMenuOpen(false);
        }
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearchQuery('');
            setSearchOpen(false);
        }
    };

    const handleNotificationKeyDown = (e) => {
        if (e.key === 'Escape') {
            setNotificationsOpen(false);
        }
    };

    useEffect(() => {
        setNotificationsOpen(false);
        setMobileMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!notificationsOpen) {
            return undefined;
        }

        const handleClickOutside = (event) => {
            if (
                notificationsRef.current &&
                !notificationsRef.current.contains(event.target)
            ) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [notificationsOpen]);

    return (
        <header className="border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <nav className="mx-auto max-w-6xl px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                    <Link to="/" className="shrink-0 text-lg font-bold text-gray-900 dark:text-white">
                        React Django App
                    </Link>

                    <div className="flex min-w-0 items-center gap-2">
                        {searchOpen ? (
                            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
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
                                    className="w-40 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-48 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
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
                                onClick={() => {
                                    setSearchOpen(true);
                                    setMobileMenuOpen(false);
                                    setNotificationsOpen(false);
                                }}
                                aria-label="Open search"
                                className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                            >
                                <SearchIcon className="h-4 w-4" />
                            </button>
                        )}

                        <div className="hidden items-center gap-2 md:flex">
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
                        </div>

                        {user && (
                            <>
                                <span className="hidden text-sm text-gray-500 lg:inline dark:text-gray-400">
                                    {user.username}
                                </span>

                                <div ref={notificationsRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNotificationsOpen((open) => !open);
                                            setMobileMenuOpen(false);
                                        }}
                                        onKeyDown={handleNotificationKeyDown}
                                        aria-label={notificationsOpen ? 'Close notifications' : 'Open notifications'}
                                        aria-expanded={notificationsOpen}
                                        className="relative rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                                    >
                                        <BellIcon className="h-5 w-5" />
                                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                                            {notifications.length}
                                        </span>
                                    </button>

                                    {notificationsOpen && (
                                        <div className="absolute right-0 top-11 z-50 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:w-80 dark:border-gray-700 dark:bg-gray-800">
                                            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        Notifications
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Static demo messages
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                                                    {notifications.length} new
                                                </span>
                                            </div>

                                            <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
                                                {notifications.map((notification) => (
                                                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/60">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                                                    {notification.message}
                                                                </p>
                                                            </div>
                                                            <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                                                                {notification.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                                                Real notifications can be connected in a later backend/API PR.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="hidden rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 md:inline-flex"
                                >
                                    Logout
                                </button>
                            </>
                        )}

                        <ThemeToggle />

                        <button
                            type="button"
                            onClick={() => {
                                setMobileMenuOpen((open) => !open);
                                setNotificationsOpen(false);
                            }}
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileMenuOpen}
                            className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 md:hidden dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                            {mobileMenuOpen ? (
                                <CloseIcon className="h-5 w-5" />
                            ) : (
                                <MenuIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="mt-3 space-y-2 border-t border-gray-200 pt-3 md:hidden dark:border-gray-700">
                        <NavLink to="/" end className={mobileNavLinkClass}>
                            Home
                        </NavLink>

                        {user ? (
                            <>
                                <NavLink to="/dashboard" className={mobileNavLinkClass}>
                                    Dashboard
                                </NavLink>
                                <NavLink to="/chat" className={mobileNavLinkClass}>
                                    Chat
                                </NavLink>
                                <NavLink to="/items" className={mobileNavLinkClass}>
                                    Items
                                </NavLink>

                                <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                                    Signed in as <span className="font-semibold">{user.username}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full rounded-lg bg-red-600 px-3 py-2 text-left text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={mobileNavLinkClass}>
                                    Login
                                </NavLink>
                                <NavLink to="/register" className={mobileNavLinkClass}>
                                    Register
                                </NavLink>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;
