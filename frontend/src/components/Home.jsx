import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();

    return (
        <main className="min-h-[calc(100vh-65px)] bg-gray-100 px-4 py-16">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                <h1 className="text-4xl font-extrabold text-gray-900">
                    Welcome to the Home Page
                </h1>

                <p className="mt-4 text-lg text-gray-600">
                    A full-stack React + Django app with authentication, dashboard access,
                    and real-time chat.
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
                                className="rounded-md bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Home;
