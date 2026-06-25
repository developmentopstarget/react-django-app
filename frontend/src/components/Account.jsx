import React from 'react';
import { useAuth } from '../context/useAuth';

export default function Account() {
    const { user } = useAuth();

    return (
        <main className="min-h-screen bg-gray-100 px-4 py-12 dark:bg-gray-900">
            <div className="mx-auto max-w-4xl space-y-8">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                        Account
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Your information
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        Profile editing and password changes will be added later.
                    </p>
                </div>

                <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Current account
                    </h2>
                    <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">Username</dt>
                            <dd className="mt-1 font-medium text-gray-900 dark:text-white">
                                {user?.username || 'Not available'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 dark:text-gray-400">Email</dt>
                            <dd className="mt-1 font-medium text-gray-900 dark:text-white">
                                {user?.email || 'No email set'}
                            </dd>
                        </div>
                    </dl>
                </section>

                <div className="grid gap-6 md:grid-cols-2">
                    <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Profile information
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Editable profile fields are planned for a future update.
                        </p>
                    </section>

                    <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Password and security
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Password change controls are placeholders and do not submit changes yet.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
