import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const hubCards = [
    {
        title: 'Account',
        description: 'Review the profile details tied to your signed-in session.',
        action: 'View account',
        to: '/account',
        tone: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200',
    },
    {
        title: 'Items',
        description: 'Create, search, edit, and remove the items attached to your account.',
        action: 'Manage items',
        to: '/items',
        tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200',
    },
    {
        title: 'Chat',
        description: 'Open your authenticated chat workspace and message history.',
        action: 'Open chat',
        to: '/chat',
        tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-200',
    },
];

const quickActions = [
    { label: 'Update account details', to: '/account' },
    { label: 'Add or review items', to: '/items' },
    { label: 'Continue a chat', to: '/chat' },
];

export default function Dashboard() {
    const { user } = useAuth();
    const displayName = user?.first_name || user?.username || user?.email || 'User';
    const avatarInitial = displayName.charAt(0).toUpperCase();

    return (
        <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-gray-100 px-4 py-8 sm:px-6 lg:px-8 dark:bg-gray-900">
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <section className="rounded-lg bg-white p-5 shadow sm:p-6 dark:bg-gray-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                                Dashboard
                            </p>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                Welcome back, {displayName}
                            </h1>
                            <p className="max-w-2xl text-base text-gray-600 sm:text-sm dark:text-gray-300">
                                Use this hub to move between your account, item workspace, and chat.
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-base font-semibold text-white">
                                    {avatarInitial}
                                </span>
                                <dl className="min-w-0 text-sm">
                                    <div>
                                        <dt className="sr-only">Username</dt>
                                        <dd className="truncate font-semibold text-gray-900 dark:text-white">
                                            {user?.username || 'Not available'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="sr-only">Email</dt>
                                        <dd className="truncate text-gray-500 dark:text-gray-400">
                                            {user?.email || 'No email set'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-3">
                    {hubCards.map((card) => (
                        <article
                            key={card.title}
                            className="flex min-h-56 flex-col justify-between rounded-lg bg-white p-6 shadow dark:bg-gray-800"
                        >
                            <div className="space-y-4">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${card.tone}`}>
                                    {card.title}
                                </span>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {card.title}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                        {card.description}
                                    </p>
                                </div>
                            </div>

                            <Link
                                to={card.to}
                                className="mt-6 inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            >
                                {card.action}
                            </Link>
                        </article>
                    ))}
                </section>

                <section className="rounded-lg bg-white p-5 shadow sm:p-6 dark:bg-gray-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Quick actions
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                Jump into the most common parts of the app.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.to}
                                    to={action.to}
                                    className="rounded-md border border-indigo-200 bg-white px-4 py-2 text-center text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50 dark:border-indigo-700 dark:bg-gray-900 dark:text-indigo-300 dark:hover:bg-gray-700"
                                >
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
