import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/runtime';
import ThemeToggle from './ThemeToggle';

const navLinkClass = ({ isActive }) =>
    [
        'rounded-md px-3 py-2 text-base sm:text-sm font-medium transition',
        isActive
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
    ].join(' ');

const mobileNavLinkClass = ({ isActive }) =>
    [
        'block rounded-lg px-3 py-2 text-base sm:text-sm font-medium transition',
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

function formatNotificationTime(value) {
    if (!value) {
        return '';
    }

    try {
        return new Intl.DateTimeFormat(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value));
    } catch {
        return '';
    }
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


const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState('');
    const notificationsRef = useRef(null);
    const unreadCount = notifications.filter((notification) => !notification.is_read).length;

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

    const markAllNotificationsRead = async () => {
        if (!user || unreadCount === 0) {
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/api/notifications/mark-all-read/`,
                {},
                { headers: { Authorization: `Token ${token}` } }
            );

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) => ({
                    ...notification,
                    is_read: true,
                }))
            );
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const handleNotificationToggle = () => {
        setNotificationsOpen((open) => {
            const nextOpen = !open;

            if (nextOpen) {
                void markAllNotificationsRead();
            }

            return nextOpen;
        });
        setMobileMenuOpen(false);
    };

    const handleNotificationClick = async (notification) => {
        const token = localStorage.getItem('token');

        if (!notification.is_read && token) {
            try {
                await axios.post(
                    `${API_BASE_URL}/api/notifications/${notification.id}/mark-read/`,
                    {},
                    { headers: { Authorization: `Token ${token}` } }
                );

                setNotifications((currentNotifications) =>
                    currentNotifications.map((currentNotification) =>
                        currentNotification.id === notification.id
                            ? { ...currentNotification, is_read: true }
                            : currentNotification
                    )
                );
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }

        setNotificationsOpen(false);

        if (notification.link) {
            navigate(notification.link);
        }
    };

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setNotificationsOpen(false);
            return undefined;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setNotifications([]);
            return undefined;
        }

        let ignore = false;

        const loadNotifications = () => {
            setNotificationsLoading(true);
            setNotificationsError('');

            axios.get(`${API_BASE_URL}/api/notifications/`, {
                headers: { Authorization: `Token ${token}` },
            })
                .then((response) => {
                    if (!ignore) {
                        setNotifications(response.data);
                    }
                })
                .catch((error) => {
                    if (!ignore) {
                        console.error('Failed to load notifications:', error);
                        setNotificationsError('Could not load notifications.');
                    }
                })
                .finally(() => {
                    if (!ignore) {
                        setNotificationsLoading(false);
                    }
                });
        };

        loadNotifications();
        window.addEventListener('rda:notifications-changed', loadNotifications);

        return () => {
            ignore = true;
            window.removeEventListener('rda:notifications-changed', loadNotifications);
        };
    }, [user]);

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
        <>
            {mobileMenuOpen && (
                <button
                    type="button"
                    aria-label="Close mobile menu backdrop"
                    className="fixed inset-0 z-40 cursor-default bg-transparent md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <header className="relative z-50 border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <nav className="mx-auto max-w-6xl px-4 py-3">
                <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-3">
                    <Link to="/" className="min-w-0 flex-1 truncate text-base font-bold text-gray-900 sm:flex-none sm:text-lg dark:text-white">
                        React Django App
                    </Link>

                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
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
                                    className="w-40 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-10 text-base sm:text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-48 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
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
                                <span className="hidden text-base sm:text-sm text-gray-500 lg:inline dark:text-gray-400">
                                    {user.username}
                                </span>

                                <div ref={notificationsRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={handleNotificationToggle}
                                        onKeyDown={handleNotificationKeyDown}
                                        aria-label={notificationsOpen ? 'Close notifications' : 'Open notifications'}
                                        aria-expanded={notificationsOpen}
                                        className="relative rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                                    >
                                        <BellIcon className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {notificationsOpen && (
                                        <div className="fixed inset-x-3 top-20 z-50 max-h-[70vh] w-auto max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-11 sm:w-80 sm:max-w-sm dark:border-gray-700 dark:bg-gray-800">
                                            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        Notifications
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {notificationsLoading
                                                            ? 'Loading...'
                                                            : notificationsError || 'Backend notifications'}
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                                                    {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
                                                </span>
                                            </div>

                                            <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
                                                {notificationsLoading ? (
                                                    <div className="px-4 py-6 text-base sm:text-sm text-gray-500 dark:text-gray-400">
                                                        Loading notifications...
                                                    </div>
                                                ) : notificationsError ? (
                                                    <div className="px-4 py-6 text-base sm:text-sm text-red-600 dark:text-red-400">
                                                        {notificationsError}
                                                    </div>
                                                ) : notifications.length > 0 ? (
                                                    notifications.map((notification) => (
                                                        <button
                                                            key={notification.id}
                                                            type="button"
                                                            onClick={() => handleNotificationClick(notification)}
                                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                            {notification.title}
                                                                        </p>
                                                                        {!notification.is_read && (
                                                                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-900 dark:text-red-200">
                                                                                New
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="mt-1 text-base sm:text-sm text-gray-600 dark:text-gray-300">
                                                                        {notification.message}
                                                                    </p>
                                                                </div>
                                                                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                                                                    {formatNotificationTime(notification.created_at)}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-6 text-base sm:text-sm text-gray-500 dark:text-gray-400">
                                                        No notifications yet.
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                                                Notifications are generated by backend app events.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="hidden rounded-md bg-red-600 px-3 py-2 text-base sm:text-sm font-medium text-white hover:bg-red-700 md:inline-flex"
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

                                <div className="rounded-lg bg-gray-50 px-3 py-2 text-base sm:text-sm text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                                    Signed in as <span className="font-semibold">{user.username}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full rounded-lg bg-red-600 px-3 py-2 text-left text-base sm:text-sm font-medium text-white hover:bg-red-700"
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
        </>
    );
};

export default Navbar;
