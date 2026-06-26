import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const bottomNavLinks = [
    { label: 'Home', to: '/', icon: 'home', end: true },
    { label: 'Items', to: '/items', icon: 'box' },
    { label: 'Chat', to: '/chat', icon: 'chat' },
    { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
];

const servicesLinks = [
    { label: 'Account', to: '/account', icon: 'user' },
    { label: 'Items', to: '/items', icon: 'box' },
    { label: 'Chat', to: '/chat', icon: 'chat' },
    { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
    { label: 'About', to: '/about', icon: 'info' },
];

function AppIcon({ name, className = '' }) {
    const iconProps = {
        className,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
    };

    switch (name) {
        case 'box':
            return (
                <svg {...iconProps}>
                    <path d="m21 8-9-5-9 5 9 5 9-5Z" />
                    <path d="M3 8v8l9 5 9-5V8" />
                    <path d="M12 13v8" />
                </svg>
            );
        case 'chat':
            return (
                <svg {...iconProps}>
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
                    <path d="M8 10h8" />
                    <path d="M8 14h5" />
                </svg>
            );
        case 'grid':
            return (
                <svg {...iconProps}>
                    <rect width="7" height="7" x="3" y="3" rx="1.5" />
                    <rect width="7" height="7" x="14" y="3" rx="1.5" />
                    <rect width="7" height="7" x="14" y="14" rx="1.5" />
                    <rect width="7" height="7" x="3" y="14" rx="1.5" />
                </svg>
            );
        case 'home':
            return (
                <svg {...iconProps}>
                    <path d="m3 10 9-7 9 7" />
                    <path d="M5 10v10h14V10" />
                    <path d="M9 20v-6h6v6" />
                </svg>
            );
        case 'user':
            return (
                <svg {...iconProps}>
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            );
        case 'info':
            return (
                <svg {...iconProps}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                </svg>
            );
        case 'services':
            return (
                <svg {...iconProps}>
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                </svg>
            );
        case 'logout':
            return (
                <svg {...iconProps}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="m16 17 5-5-5-5" />
                    <path d="M21 12H9" />
                </svg>
            );
        default:
            return null;
    }
}

function getDisplayName(user) {
    return user?.first_name || user?.username || user?.email || 'User';
}

function getAvatarInitial(user) {
    return getDisplayName(user).charAt(0).toUpperCase() || 'U';
}

function Sheet({ title, children, onClose }) {
    return (
        <>
            <button
                type="button"
                aria-label={`Close ${title}`}
                className="fixed inset-0 z-40 bg-black/30 md:hidden"
                onClick={onClose}
            />
            <section
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-gray-200 bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl md:hidden dark:border-gray-700 dark:bg-gray-900"
            >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="mx-auto max-w-md">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full px-3 py-1.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        >
                            Close
                        </button>
                    </div>
                    {children}
                </div>
            </section>
        </>
    );
}

function ServicesSheet({ onClose }) {
    return (
        <Sheet title="Services" onClose={onClose}>
            <div className="grid grid-cols-2 gap-3">
                {servicesLinks.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        onClick={onClose}
                        className="flex min-h-20 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm dark:bg-gray-900 dark:text-gray-200">
                            <AppIcon name={link.icon} className="h-5 w-5" />
                        </span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {link.label}
                        </span>
                    </Link>
                ))}
            </div>
        </Sheet>
    );
}

function ProfileSheet({ user, logout, onClose }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        onClose();
        await logout();
        navigate('/', { replace: true });
    };

    return (
        <Sheet title="Profile" onClose={onClose}>
            {user ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 dark:bg-gray-800">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-base font-bold text-white">
                            {getAvatarInitial(user)}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                {getDisplayName(user)}
                            </p>
                            {user.email && (
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <Link
                        to="/account"
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-2xl border border-gray-200 p-3 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                        <AppIcon name="user" className="h-5 w-5 text-gray-500 dark:text-gray-300" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            Account
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl border border-red-100 p-3 text-left transition hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/30"
                    >
                        <AppIcon name="logout" className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                            Logout
                        </span>
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    <Link
                        to="/login"
                        onClick={onClose}
                        className="rounded-2xl bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        Login
                    </Link>
                    <Link
                        to="/register"
                        onClick={onClose}
                        className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-center text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-900 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
                    >
                        Register
                    </Link>
                </div>
            )}
        </Sheet>
    );
}

export default function MobileAppShell() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [openSheet, setOpenSheet] = useState(null);

    useEffect(() => {
        setOpenSheet(null);
    }, [location.pathname]);

    if (location.pathname === '/chat') {
        return null;
    }

    return (
        <>
            {openSheet === 'services' && (
                <ServicesSheet onClose={() => setOpenSheet(null)} />
            )}
            {openSheet === 'profile' && (
                <ProfileSheet
                    user={user}
                    logout={logout}
                    onClose={() => setOpenSheet(null)}
                />
            )}

            <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
                <div className="mx-auto mb-2 flex max-w-md justify-end gap-2 px-3">
                    <button
                        type="button"
                        onClick={() => setOpenSheet('services')}
                        className="flex h-11 items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3 text-xs font-bold text-gray-700 shadow-lg backdrop-blur transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        <AppIcon name="services" className="h-4 w-4" />
                        Services
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpenSheet('profile')}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700"
                        aria-label="Open profile"
                    >
                        {user ? getAvatarInitial(user) : <AppIcon name="user" className="h-5 w-5" />}
                    </button>
                </div>

                <nav className="border-t border-gray-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
                    <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
                        {bottomNavLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={({ isActive }) =>
                                    [
                                        'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition',
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                                    ].join(' ')
                                }
                            >
                                <AppIcon name={link.icon} className="h-5 w-5" />
                                <span>{link.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </div>
        </>
    );
}
