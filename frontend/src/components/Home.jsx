import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

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

const Home = () => {
    const { user } = useAuth();

    return (
        <main className="min-h-[calc(100vh-65px)] w-full max-w-full overflow-x-hidden bg-gray-100 px-4 py-8 sm:px-6 lg:px-8 dark:bg-gray-900">
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <section className="rounded-lg bg-white p-5 shadow sm:p-6 lg:p-8 dark:bg-gray-800">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-center">
                        <div className="space-y-6">
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

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900">
                            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                App flow
                            </p>
                            <div className="mt-4 space-y-3">
                                <div className="rounded-md bg-white p-4 shadow-sm dark:bg-gray-800">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Sign in
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        Access protected pages through the current auth setup.
                                    </p>
                                </div>

                                <div className="rounded-md bg-white p-4 shadow-sm dark:bg-gray-800">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Manage items
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        Work with records owned by the active account.
                                    </p>
                                </div>

                                <div className="rounded-md bg-white p-4 shadow-sm dark:bg-gray-800">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Open chat
                                    </p>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        Continue real-time conversations with saved history.
                                    </p>
                                </div>
                            </div>
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
            </div>
        </main>
    );
};

export default Home;
