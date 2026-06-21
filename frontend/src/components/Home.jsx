import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
    {
        label: 'Authentication',
        description: 'Register, log in, and access protected app pages.',
    },
    {
        label: 'User-owned items',
        description: 'Create, view, edit, and delete your own items.',
    },
    {
        label: 'Real-time chat',
        description: 'Use WebSocket chat with saved, user-owned history.',
    },
];

const Home = () => {
    const { user } = useAuth();

    return (
        <main className="min-h-[calc(100vh-65px)] bg-gray-100 px-4 py-16">
            <div className="mx-auto max-w-5xl space-y-10">
                <section className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                        React Django App
                    </p>

                    <h1 className="mt-3 text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        A full-stack app starter with auth, CRUD, and chat
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
                        RDA combines React, Django REST Framework, protected user data,
                        real-time WebSocket chat, and saved user-owned history.
                    </p>

                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Go to Dashboard
                                </Link>

                                <Link
                                    to="/items"
                                    className="rounded-md bg-white px-5 py-3 text-sm font-medium text-gray-900 shadow hover:bg-gray-50"
                                >
                                    Manage Items
                                </Link>

                                <Link
                                    to="/chat"
                                    className="rounded-md bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                                >
                                    Open Chat
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="rounded-md bg-white px-5 py-3 text-sm font-medium text-gray-900 shadow hover:bg-gray-50"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-3">
                    {features.map(({ label, description }) => (
                        <div key={label} className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {label}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                {description}
                            </p>
                        </div>
                    ))}
                </section>
            </div>
        </main>
    );
};

export default Home;
