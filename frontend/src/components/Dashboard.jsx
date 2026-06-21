import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    'http://127.0.0.1:8000'
).replace(/\/$/, '');

export default function Dashboard() {
    const { user } = useAuth();
    const [me, setMe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        axios
            .get(`${API_BASE_URL}/api/me/`)
            .then((response) => {
                if (isMounted) {
                    setMe(response.data);
                    setError(null);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setError('Failed to load account details.');
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Welcome, {user?.username || 'User'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Your RDA app home for account details, items, and chat.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-lg bg-white p-6 shadow space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Account
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Your authenticated profile information.
                            </p>
                        </div>

                        {loading && (
                            <p className="text-sm text-gray-500">
                                Loading account details...
                            </p>
                        )}

                        {error && (
                            <p className="text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        {me && (
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-gray-500">Username</dt>
                                    <dd className="font-medium text-gray-900">
                                        {me.username}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-gray-500">Email</dt>
                                    <dd className="font-medium text-gray-900">
                                        {me.email || 'No email set'}
                                    </dd>
                                </div>
                            </dl>
                        )}
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow flex flex-col justify-between space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Items
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage user-owned items with create, edit, and delete actions.
                            </p>
                        </div>

                        <Link
                            to="/items"
                            className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Go to Items
                        </Link>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow flex flex-col justify-between space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Chat
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Use real-time chat with saved, user-owned message history.
                            </p>
                        </div>

                        <Link
                            to="/chat"
                            className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Go to Chat
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
