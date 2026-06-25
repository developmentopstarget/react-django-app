import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { parseAuthErrors } from '../context/authErrors';
import { useAuth } from '../context/useAuth';

function UserIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function MailIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-10 6L2 7" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    );
}

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState([]);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors([]);

        const result = await register(username, email, password);

        if (result.ok) {
            navigate('/dashboard', { replace: true });
        } else {
            setErrors(parseAuthErrors(result.errors, 'Registration failed. Please check your details and try again.'));
        }

        setSubmitting(false);
    };

    return (
        <div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-900">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200">
                        <UserIcon />
                    </div>

                    <h2 className="mt-5 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Create account
                    </h2>

                    <p className="mt-2 text-base sm:text-sm text-gray-600 dark:text-gray-400">
                        Start using your RDA workspace
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    {errors.length > 0 && (
                        <div className="rounded-lg bg-red-50 p-3 text-base sm:text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            {errors.length === 1 ? (
                                <p>{errors[0]}</p>
                            ) : (
                                <ul className="list-inside list-disc space-y-1">
                                    {errors.map((message, index) => (
                                        <li key={index}>{message}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label
                            htmlFor="username"
                            className="block text-base sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Username
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-gray-500">
                                <UserIcon />
                            </span>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="email"
                            className="block text-base sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-gray-500">
                                <MailIcon />
                            </span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="password"
                            className="block text-base sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-gray-500">
                                <LockIcon />
                            </span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base sm:text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-indigo-600 py-2.5 text-base sm:text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-gray-800"
                    >
                        {submitting ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="mt-6 text-center text-base sm:text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
