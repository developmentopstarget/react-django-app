import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import ThemeToggle from './ThemeToggle';

const bottomNavLinks = [
    { label: 'Home', to: '/', icon: 'home', end: true },
    { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
    { label: 'Chat', to: '/chat', icon: 'chat' },
];

const searchableRoutes = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Items', to: '/items' },
    { label: 'Chat', to: '/chat' },
    { label: 'Account', to: '/account' },
    { label: 'About', to: '/about' },
];

const serviceLinks = [
    { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
    { label: 'Items', to: '/items', icon: 'box' },
    { label: 'Chat', to: '/chat', icon: 'chat' },
    { label: 'Account', to: '/account', icon: 'user' },
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
        case 'search':
            return (
                <svg {...iconProps}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
            );
        case 'bell':
            return (
                <svg {...iconProps}>
                    <path d="M10.27 21a2 2 0 0 0 3.46 0" />
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
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

function getAvatarSrc(user) {
    return user?.avatar_url || user?.avatar || user?.photo_url || user?.photo || '';
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

function HeaderIconButton({ label, onClick, children }) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:focus:ring-offset-gray-900"
        >
            {children}
        </button>
    );
}

function ProfileNavAvatar({ user, active = false }) {
    const baseClass = active
        ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 dark:ring-indigo-800'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    const avatarSrc = getAvatarSrc(user);

    return (
        <span className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ${baseClass}`}>
            {avatarSrc ? (
                <img
                    src={avatarSrc}
                    alt=""
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                />
            ) : user ? (
                <span className="text-xs font-bold">{getAvatarInitial(user)}</span>
            ) : (
                <AppIcon name="user" className="h-4 w-4" />
            )}
        </span>
    );
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

function SearchSheet({ onClose }) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const normalizedQuery = query.trim().toLowerCase();
    const suggestions = normalizedQuery
        ? searchableRoutes.filter((route) =>
              route.label.toLowerCase().includes(normalizedQuery)
          )
        : searchableRoutes;

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!suggestions[0]) return;
        onClose();
        navigate(suggestions[0].to);
    };

    return (
        <Sheet title="Search" onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <AppIcon name="search" className="h-5 w-5 shrink-0" />
                    <span className="sr-only">Search app routes</span>
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search app areas"
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                        autoFocus
                    />
                </label>

                <div className="grid gap-2">
                    {suggestions.length > 0 ? (
                        suggestions.map((route) => (
                            <button
                                key={route.to}
                                type="button"
                                onClick={() => {
                                    onClose();
                                    navigate(route.to);
                                }}
                                className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 text-left transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {route.label}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {route.to}
                                </span>
                            </button>
                        ))
                    ) : (
                        <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            Try Home, Dashboard, Items, Chat, Account, or About.
                        </p>
                    )}
                </div>
            </form>
        </Sheet>
    );
}

function ServicesSheet({ onClose }) {
    return (
        <Sheet title="Services" onClose={onClose}>
            <div className="grid grid-cols-2 gap-3">
                {serviceLinks.map((service) => (
                    <Link
                        key={service.to}
                        to={service.to}
                        onClick={onClose}
                        className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 text-center transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                            <AppIcon name={service.icon} className="h-5 w-5" />
                        </span>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                            {service.label}
                        </span>
                    </Link>
                ))}
            </div>
        </Sheet>
    );
}

function ProfileSheet({ user, logout, onClose }) {
    const navigate = useNavigate();
    const avatarSrc = getAvatarSrc(user);

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
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-base font-bold text-white">
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                getAvatarInitial(user)
                            )}
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
    const notificationLabel = user
        ? 'Notifications are not available on mobile yet'
        : 'Notifications require sign in';

    useEffect(() => {
        setOpenSheet(null);
    }, [location.pathname]);

    return (
        <>
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden dark:border-gray-800 dark:bg-gray-950/95">
                <div className="mx-auto flex max-w-md items-center justify-between gap-3">
                    <Link
                        to="/"
                        className="shrink-0 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        aria-label="Go to home"
                    >
                        <BrandLogo />
                    </Link>

                    <div className="flex items-center gap-1">
                        <HeaderIconButton
                            label="Open search"
                            onClick={() => setOpenSheet('search')}
                        >
                            <AppIcon name="search" className="h-5 w-5" />
                        </HeaderIconButton>
                        <HeaderIconButton
                            label={notificationLabel}
                            onClick={() => setOpenSheet(null)}
                        >
                            <AppIcon name="bell" className="h-5 w-5" />
                        </HeaderIconButton>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {openSheet === 'search' && (
                <SearchSheet onClose={() => setOpenSheet(null)} />
            )}

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
                <nav className="border-t border-gray-200 bg-white/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
                    <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
                        {bottomNavLinks.slice(0, 2).map((link) => (
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
                        <button
                            type="button"
                            onClick={() => setOpenSheet('services')}
                            className={[
                                '-mt-5 flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition',
                                openSheet === 'services'
                                    ? 'text-indigo-700 dark:text-indigo-200'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
                            ].join(' ')}
                            aria-label="Open services"
                            aria-haspopup="dialog"
                            aria-expanded={openSheet === 'services'}
                        >
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 ring-4 ring-white dark:ring-gray-900">
                                <AppIcon name="box" className="h-5 w-5" />
                            </span>
                            <span>Services</span>
                        </button>
                        {bottomNavLinks.slice(2).map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
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
                        <button
                            type="button"
                            onClick={() => setOpenSheet('profile')}
                            className={[
                                'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition',
                                openSheet === 'profile'
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-200'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                            ].join(' ')}
                            aria-label="Open profile"
                            aria-haspopup="dialog"
                            aria-expanded={openSheet === 'profile'}
                        >
                            <ProfileNavAvatar user={user} active={openSheet === 'profile'} />
                            <span>Profile</span>
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
}
