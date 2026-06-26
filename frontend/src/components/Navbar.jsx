import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { API_BASE_URL } from '../config/runtime';
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
        'block rounded-lg px-3 py-2 text-base font-medium transition',
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

function LogoutIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
        </svg>
    );
}

function UserIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function InfoIcon({ className = '' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    );
}

function BrandLogo() {
    return (
        <span className="flex items-center gap-2" aria-label="DOT DevOps Target">
            <span className="relative inline-flex items-center text-lg font-black tracking-normal text-gray-950 dark:text-white">
                <span>D</span>
                <svg className="mx-0.5 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" />
                    <circle cx="12" cy="12" r="5" fill="none" stroke="#dc2626" strokeWidth="3" />
                    <circle cx="12" cy="12" r="2" fill="#dc2626" />
                </svg>
                <span>T</span>
            </span>
            <span className="flex flex-col leading-none">
                <span className="text-sm font-bold text-gray-900 dark:text-white">DevOps</span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-red-600">Target</span>
            </span>
        </span>
    );
}

function formatNotificationTime(value) {
    if (!value) return '';
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

const searchableRoutes = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Items', path: '/items' },
    { label: 'Chat', path: '/chat' },
    { label: 'Account', path: '/account' },
    { label: 'About', path: '/about' },
];

function getDisplayName(user) {
    return user?.first_name || user?.username || user?.email || 'User';
}

function getAvatarInitial(user) {
    return getDisplayName(user).charAt(0).toUpperCase() || 'U';
}

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationsLoading, setNotificationsLoading] = useState(false);
    const [notificationsError, setNotificationsError] = useState('');

    const searchWrapperRef = useRef(null);
    const searchInputRef = useRef(null);
    const notificationsRef = useRef(null);
    const avatarRef = useRef(null);

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const handleLogout = async () => {
        setAvatarOpen(false);
        setMobileMenuOpen(false);
        await logout();
        navigate('/', { replace: true });
    };

    const suggestions = searchQuery.trim()
        ? searchableRoutes.filter((r) =>
              r.label.toLowerCase().includes(searchQuery.trim().toLowerCase())
          )
        : searchableRoutes;

    const handleSuggestionClick = (path) => {
        navigate(path);
        setSearchQuery('');
        setSearchOpen(false);
        setMobileMenuOpen(false);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Escape') {
            setSearchQuery('');
            setSearchOpen(false);
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (suggestions.length > 0) handleSuggestionClick(suggestions[0].path);
        }
    };

    const handleAvatarKeyDown = (e) => {
        if (e.key === 'Escape') setAvatarOpen(false);
    };

    const markAllNotificationsRead = async () => {
        if (!user || unreadCount === 0) return;
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.post(
                `${API_BASE_URL}/api/notifications/mark-all-read/`,
                {},
                { headers: { Authorization: `Token ${token}` } }
            );
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        }
    };

    const handleNotificationToggle = () => {
        setNotificationsOpen((open) => {
            const next = !open;
            if (next) void markAllNotificationsRead();
            return next;
        });
        setAvatarOpen(false);
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
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id ? { ...n, is_read: true } : n
                    )
                );
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
        setNotificationsOpen(false);
        if (notification.link) navigate(notification.link);
    };

    // Load notifications
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
            axios
                .get(`${API_BASE_URL}/api/notifications/`, {
                    headers: { Authorization: `Token ${token}` },
                })
                .then((res) => { if (!ignore) setNotifications(res.data); })
                .catch((err) => {
                    if (!ignore) {
                        console.error('Failed to load notifications:', err);
                        setNotificationsError('Could not load notifications.');
                    }
                })
                .finally(() => { if (!ignore) setNotificationsLoading(false); });
        };
        loadNotifications();
        window.addEventListener('rda:notifications-changed', loadNotifications);
        return () => {
            ignore = true;
            window.removeEventListener('rda:notifications-changed', loadNotifications);
        };
    }, [user]);

    // Close all panels on route change
    useEffect(() => {
        setNotificationsOpen(false);
        setMobileMenuOpen(false);
        setAvatarOpen(false);
        setSearchOpen(false);
        setSearchQuery('');
    }, [location.pathname]);

    // Focus search input when panel opens
    useEffect(() => {
        if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
    }, [searchOpen]);
    // Click-outside: search
    useEffect(() => {
        if (!searchOpen) return undefined;

        const handle = (e) => {
            if (!searchWrapperRef.current?.contains(e.target)) {
                setSearchOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handle);
        document.addEventListener('touchstart', handle);

        return () => {
            document.removeEventListener('mousedown', handle);
            document.removeEventListener('touchstart', handle);
        };
    }, [searchOpen]);

    // Click-outside: notifications
    useEffect(() => {
        if (!notificationsOpen) return undefined;
        const handle = (e) => {
            if (notificationsRef.current && !notificationsRef.current.contains(e.target))
                setNotificationsOpen(false);
        };
        document.addEventListener('mousedown', handle);
        document.addEventListener('touchstart', handle);
        return () => {
            document.removeEventListener('mousedown', handle);
            document.removeEventListener('touchstart', handle);
        };
    }, [notificationsOpen]);

    useEffect(() => {
        if (!notificationsOpen) return undefined;
        const handle = (e) => {
            if (e.key === 'Escape') setNotificationsOpen(false);
        };
        document.addEventListener('keydown', handle);
        return () => document.removeEventListener('keydown', handle);
    }, [notificationsOpen]);

    // Click-outside: avatar
    useEffect(() => {
        if (!avatarOpen) return undefined;
        const handle = (e) => {
            if (avatarRef.current && !avatarRef.current.contains(e.target))
                setAvatarOpen(false);
        };
        document.addEventListener('mousedown', handle);
        document.addEventListener('touchstart', handle);
        return () => {
            document.removeEventListener('mousedown', handle);
            document.removeEventListener('touchstart', handle);
        };
    }, [avatarOpen]);

    useEffect(() => {
        if (!avatarOpen) return undefined;
        const handle = (e) => {
            if (e.key === 'Escape') setAvatarOpen(false);
        };
        document.addEventListener('keydown', handle);
        return () => document.removeEventListener('keydown', handle);
    }, [avatarOpen]);

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

            {/*
              No overflow-x-hidden on header or nav — those clip absolute-positioned
              dropdown children. Horizontal overflow is handled by flex constraints.
            */}
            <header className="relative z-50 hidden w-full border-b bg-white shadow-sm md:block dark:border-gray-700 dark:bg-gray-800">
                <nav className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-4">
                    <div className="flex w-full items-center justify-between gap-2">

                        {/* Logo — far left */}
                        <Link
                            to="/"
                            className="shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            <BrandLogo />
                        </Link>

                        {/* Right cluster: search · nav links · divider · bell · theme · avatar · hamburger */}
                        <div className="flex items-center gap-1.5">

                            {/* Search: icon button or inline input */}
                            <div ref={searchWrapperRef} className="relative">
                                {searchOpen ? (
                                    <>
                                        <div className="flex w-52 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-gray-500 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-400">
                                            <SearchIcon className="h-4 w-4 shrink-0" />
                                            <input
                                                ref={searchInputRef}
                                                type="search"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={handleSearchKeyDown}
                                                placeholder="Search pages"
                                                aria-label="Search pages"
                                                aria-controls="navbar-search-results"
                                                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-gray-400"
                                            />
                                        </div>
                                        <div
                                            id="navbar-search-results"
                                            className="absolute right-0 top-11 z-50 w-64 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <div className="border-b border-gray-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                                Pages
                                            </div>
                                            {suggestions.length > 0 ? (
                                                <div className="py-1">
                                                    {suggestions.map((route) => (
                                                        <button
                                                            key={route.path}
                                                            type="button"
                                                            onClick={() => handleSuggestionClick(route.path)}
                                                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:text-gray-200 dark:hover:bg-gray-700/60 dark:focus:bg-gray-700/60"
                                                        >
                                                            <span className="font-medium">{route.label}</span>
                                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                                {route.path}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-3 py-4">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                        No matching pages
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Try Home, Dashboard, Items, Chat, Account, or About.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchOpen(true);
                                            setNotificationsOpen(false);
                                            setAvatarOpen(false);
                                            setMobileMenuOpen(false);
                                        }}
                                        aria-label="Open search"
                                        className="rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                                    >
                                        <SearchIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Desktop nav links */}
                            <div className="hidden items-center gap-1 md:flex">
                                <NavLink to="/" end className={navLinkClass}>
                                    Home
                                </NavLink>
                                {user ? (
                                    <>
                                        <NavLink to="/dashboard" className={navLinkClass}>
                                            Dashboard
                                        </NavLink>
                                        <NavLink to="/items" className={navLinkClass}>
                                            Items
                                        </NavLink>
                                        <NavLink to="/chat" className={navLinkClass}>
                                            Chat
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

                            {/* Divider */}
                            <span
                                className="hidden h-5 w-px bg-gray-200 md:block dark:bg-gray-600"
                                aria-hidden="true"
                            />

                            {/* Bell */}
                            {user && (
                                <div ref={notificationsRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={handleNotificationToggle}
                                        aria-label={notificationsOpen ? 'Close notifications' : 'Open notifications'}
                                        aria-controls="navbar-notifications"
                                        aria-expanded={notificationsOpen}
                                        aria-haspopup="dialog"
                                        className="relative rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-offset-gray-800"
                                    >
                                        <BellIcon className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {notificationsOpen && (
                                        <div
                                            id="navbar-notifications"
                                            role="dialog"
                                            aria-label="Notifications"
                                            className="absolute right-0 top-11 z-50 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:w-80 dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        Notifications
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {notificationsLoading
                                                            ? 'Loading...'
                                                            : notificationsError || 'App alerts and updates'}
                                                    </p>
                                                </div>
                                                <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                                                    {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
                                                </span>
                                            </div>

                                            <div className="max-h-80 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
                                                {notificationsLoading ? (
                                                    <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                                                        Loading notifications...
                                                    </div>
                                                ) : notificationsError ? (
                                                    <div className="px-4 py-6 text-sm text-red-600 dark:text-red-400">
                                                        {notificationsError}
                                                    </div>
                                                ) : notifications.length > 0 ? (
                                                    notifications.map((n) => (
                                                        <button
                                                            key={n.id}
                                                            type="button"
                                                            onClick={() => handleNotificationClick(n)}
                                                            className="w-full px-4 py-3 text-left transition hover:bg-gray-50 focus:bg-gray-50 focus:outline-none dark:hover:bg-gray-700/60 dark:focus:bg-gray-700/60"
                                                        >
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <p className="break-words text-sm font-medium text-gray-900 dark:text-white">
                                                                            {n.title}
                                                                        </p>
                                                                        {!n.is_read && (
                                                                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-900 dark:text-red-200">
                                                                                New
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="mt-1 break-words text-sm text-gray-600 dark:text-gray-300">
                                                                        {n.message}
                                                                    </p>
                                                                </div>
                                                                <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                                                                    {formatNotificationTime(n.created_at)}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-6">
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                            No notifications yet.
                                                        </p>
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                            App alerts will appear here when there is something to review.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
                                                Notifications are generated by app events.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Theme toggle */}
                            <ThemeToggle />

                            {/* Avatar menu — desktop only */}
                            {user && (
                                <div ref={avatarRef} className="relative hidden md:block">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAvatarOpen((o) => !o);
                                            setNotificationsOpen(false);
                                        }}
                                        onKeyDown={handleAvatarKeyDown}
                                        aria-label={avatarOpen ? 'Close user menu' : 'Open user menu'}
                                        aria-expanded={avatarOpen}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                    >
                                        {getAvatarInitial(user)}
                                    </button>

                                    {avatarOpen && (
                                        <div className="absolute right-0 top-10 z-50 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                            <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                                    {getDisplayName(user)}
                                                </p>
                                                {user.email && (
                                                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                                                        {user.email}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-700/60"
                                            >
                                                <LogoutIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                                                <span>
                                                    <span className="block text-sm font-semibold text-red-600">Logout</span>
                                                    <span className="block text-xs text-gray-500 dark:text-gray-400">End this session</span>
                                                </span>
                                            </button>
                                            <Link
                                                to="/account"
                                                onClick={() => setAvatarOpen(false)}
                                                className="flex items-start gap-3 border-t border-gray-100 px-4 py-3 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/60"
                                            >
                                                <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500 dark:text-gray-300" />
                                                <span>
                                                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">Account</span>
                                                    <span className="block text-xs text-gray-500 dark:text-gray-400">Edit your information</span>
                                                </span>
                                            </Link>
                                            <Link
                                                to="/about"
                                                onClick={() => setAvatarOpen(false)}
                                                className="flex items-start gap-3 px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-gray-700/60"
                                            >
                                                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500 dark:text-gray-300" />
                                                <span>
                                                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">About</span>
                                                    <span className="block text-xs text-gray-500 dark:text-gray-400">About this site</span>
                                                </span>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Mobile hamburger */}
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileMenuOpen((o) => !o);
                                    setNotificationsOpen(false);
                                    setAvatarOpen(false);
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

                    {/* Mobile menu — in-flow, beneath main row */}
                    {mobileMenuOpen && (
                        <div className="mt-3 w-full space-y-1.5 border-t border-gray-200 pt-3 md:hidden dark:border-gray-700">
                            {user && (
                                <div className="mb-3 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900/40">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                                            {getAvatarInitial(user)}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {getDisplayName(user)}
                                            </p>
                                            {user.email && (
                                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="shrink-0 text-sm text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}

                            <NavLink to="/" end className={mobileNavLinkClass}>
                                Home
                            </NavLink>

                            {user ? (
                                <>
                                    <NavLink to="/dashboard" className={mobileNavLinkClass}>
                                        Dashboard
                                    </NavLink>
                                    <NavLink to="/items" className={mobileNavLinkClass}>
                                        Items
                                    </NavLink>
                                    <NavLink to="/chat" className={mobileNavLinkClass}>
                                        Chat
                                    </NavLink>
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
