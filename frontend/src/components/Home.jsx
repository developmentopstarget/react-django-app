import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import HomeCardStack from './HomeCardStack';

const features = [
    {
        label: 'Authentication',
        eyebrow: 'Protected access',
        description: 'Register, log in, and move through private app pages with the existing auth flow.',
        tone: 'bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-200 dark:ring-indigo-900',
    },
    {
        label: 'User-owned items',
        eyebrow: 'Personal workspace',
        description: 'Create, view, edit, and delete records that stay attached to the signed-in user.',
        tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900',
    },
    {
        label: 'Real-time chat',
        eyebrow: 'Live messaging',
        description: 'Use authenticated WebSocket chat with message history saved for the account.',
        tone: 'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950/50 dark:text-violet-200 dark:ring-violet-900',
    },
];

const appRoutes = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Items', to: '/items' },
    { label: 'Chat', to: '/chat' },
    { label: 'Account', to: '/account' },
    { label: 'About', to: '/about' },
];

const happeningCards = [
    {
        title: 'Items workspace',
        description: 'Create, search, edit, and remove user-owned items.',
        to: '/items',
        tone: 'from-emerald-500 to-teal-600',
    },
    {
        title: 'Chat area',
        description: 'Open authenticated real-time chat with saved history.',
        to: '/chat',
        tone: 'from-violet-500 to-indigo-600',
    },
    {
        title: 'Dashboard hub',
        description: 'Move between account, items, and chat from one place.',
        to: '/dashboard',
        tone: 'from-indigo-500 to-blue-600',
    },
    {
        title: 'Notifications',
        description: 'App alerts appear from the bell in the top navigation.',
        to: '/',
        tone: 'from-rose-500 to-orange-500',
    },
];

const quickActions = [
    { label: 'Items', to: '/items', icon: 'box', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200' },
    { label: 'Chat', to: '/chat', icon: 'chat', tone: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200' },
    { label: 'Dashboard', to: '/dashboard', icon: 'grid', tone: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200' },
];

const serviceLinks = [
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
        case 'search':
            return (
                <svg {...iconProps}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
            );
        case 'arrow':
            return (
                <svg {...iconProps}>
                    <path d="M5 12h14" />
                    <path d="m13 5 7 7-7 7" />
                </svg>
            );
        default:
            return null;
    }
}

function MobileSearchRow() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    const suggestions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return appRoutes.slice(0, 3);
        return appRoutes.filter((route) =>
            route.label.toLowerCase().includes(normalizedQuery)
        );
    }, [query]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (suggestions[0]) {
            navigate(suggestions[0].to);
        }
    };

    return (
        <section className="md:hidden">
            <form
                onSubmit={handleSubmit}
                className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
                <div className="flex items-center gap-2">
                    <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                        <AppIcon name="search" className="h-4 w-4 shrink-0" />
                        <span className="sr-only">Search app routes</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search app areas"
                            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                        />
                    </label>

                    <button
                        type="submit"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        aria-label="Open matching app area"
                    >
                        <AppIcon name="arrow" className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {suggestions.length > 0 ? (
                        suggestions.map((route) => (
                            <Link
                                key={route.to}
                                to={route.to}
                                className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-200"
                            >
                                {route.label}
                            </Link>
                        ))
                    ) : (
                        <p className="px-1 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                            Try Dashboard, Items, Chat, Account, or About.
                        </p>
                    )}
                </div>
            </form>
        </section>
    );
}

function MobileHomeSections() {
    return (
        <div className="space-y-5 md:hidden">
            <MobileSearchRow />

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        What's happening
                    </h2>
                    <Link
                        to="/dashboard"
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-300"
                    >
                        View hub
                    </Link>
                </div>

                <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
                    {happeningCards.map((card) => (
                        <Link
                            key={card.title}
                            to={card.to}
                            className={`flex min-h-36 w-64 shrink-0 flex-col justify-between rounded-2xl bg-gradient-to-br ${card.tone} p-4 text-white shadow-sm`}
                        >
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-white/75">
                                    RDA
                                </p>
                                <h3 className="mt-1 text-lg font-bold">{card.title}</h3>
                            </div>
                            <p className="text-sm leading-5 text-white/90">
                                {card.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Quick actions
                </h2>
                <div className="grid grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                        <Link
                            key={action.to}
                            to={action.to}
                            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow dark:bg-gray-800 dark:ring-gray-700"
                        >
                            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${action.tone}`}>
                                <AppIcon name={action.icon} className="h-5 w-5" />
                            </span>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                                {action.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Services
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-1">
                    {serviceLinks.map((service) => (
                        <Link
                            key={service.to}
                            to={service.to}
                            className="flex min-w-20 shrink-0 flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-4 text-center shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
                                <AppIcon name={service.icon} className="h-4 w-4" />
                            </span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                {service.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}

const Home = () => {
    const { user } = useAuth();

    return (
        <main className="min-h-[calc(100vh-65px)] w-full max-w-full overflow-x-hidden bg-gray-100 px-4 pb-24 pt-5 sm:px-6 sm:py-8 lg:px-8 dark:bg-gray-900">
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <MobileHomeSections />

                <section className="rounded-2xl bg-white p-5 shadow sm:rounded-lg sm:p-6 lg:p-8 dark:bg-gray-800">
                    <div className="max-w-3xl space-y-6">
                        <div className="space-y-3">
                            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                                React + Django REST
                            </p>

                            <h1 className="text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl dark:text-white">
                                A focused full-stack app for auth, items, and chat
                            </h1>

                            <p className="max-w-2xl text-base leading-7 text-gray-600 sm:text-lg dark:text-gray-300">
                                RDA brings together a React interface, Django REST APIs,
                                account-based item ownership, and authenticated real-time chat.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            {user ? (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex justify-center rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                    >
                                        Dashboard
                                    </Link>

                                    <Link
                                        to="/items"
                                        className="inline-flex justify-center rounded-md border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-indigo-700 dark:bg-gray-900 dark:text-indigo-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                                    >
                                        Items
                                    </Link>

                                    <Link
                                        to="/chat"
                                        className="inline-flex justify-center rounded-md border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                                    >
                                        Chat
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="inline-flex justify-center rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="inline-flex justify-center rounded-md border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-indigo-700 dark:bg-gray-900 dark:text-indigo-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-3">
                    {features.map(({ label, eyebrow, description, tone }) => (
                        <article
                            key={label}
                            className="flex min-h-56 flex-col rounded-lg bg-white p-6 shadow dark:bg-gray-800"
                        >
                            <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone}`}>
                                {eyebrow}
                            </span>

                            <div className="mt-5">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {label}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                    {description}
                                </p>
                            </div>
                        </article>
                    ))}
                </section>

                <section className="space-y-4">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Explore the app flow
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                            See how the main parts of the app fit together across auth,
                            personal items, chat, and the signed-in workspace.
                        </p>
                    </div>

                    <HomeCardStack />
                </section>
            </div>
        </main>
    );
};

export default Home;
