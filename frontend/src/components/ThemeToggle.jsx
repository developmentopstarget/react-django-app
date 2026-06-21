import React from 'react';

import { useTheme } from '../context/ThemeContext';

function SunIcon({ className = '' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </svg>
    );
}

function MoonIcon({ className = '' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M20.99 12.74A9 9 0 1 1 11.26 3.01a7 7 0 0 0 9.73 9.73Z" />
        </svg>
    );
}

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="relative inline-flex h-9 w-16 items-center rounded-full border border-gray-300 bg-gray-100 p-1 transition dark:border-gray-600 dark:bg-gray-700"
        >
            <span className="flex w-full items-center justify-between px-1 text-gray-500 dark:text-gray-300">
                <SunIcon className="h-4 w-4" />
                <MoonIcon className="h-4 w-4" />
            </span>

            <span
                className={`absolute left-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-900 shadow transition-transform dark:bg-gray-900 dark:text-white ${
                    isDark ? 'translate-x-7' : 'translate-x-0'
                }`}
            >
                {isDark ? (
                    <MoonIcon className="h-4 w-4" />
                ) : (
                    <SunIcon className="h-4 w-4" />
                )}
            </span>
        </button>
    );
}
