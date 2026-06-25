import React from 'react';

export default function About() {
    return (
        <main className="min-h-screen bg-gray-100 px-4 py-12 dark:bg-gray-900">
            <div className="mx-auto max-w-4xl space-y-8">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                        About
                    </p>
                    <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                        DOT DevOps Target
                    </h1>
                    <p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">
                        This is a React and Django REST app with authentication, user-owned
                        items, and real-time chat.
                    </p>
                </div>

                <section className="grid gap-6 md:grid-cols-3">
                    {[
                        ['Auth', 'Register, log in, and access protected pages.'],
                        ['Items', 'Create and manage user-owned items.'],
                        ['Chat', 'Use real-time chat with saved history.'],
                    ].map(([title, description]) => (
                        <div key={title} className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {title}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                {description}
                            </p>
                        </div>
                    ))}
                </section>
            </div>
        </main>
    );
}
