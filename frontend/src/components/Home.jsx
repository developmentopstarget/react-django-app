import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-gray-900">Welcome to the Home Page</h1>
            <div className="mt-8 space-x-4">
                {user ? (
                    <>
                        <p className="text-lg text-gray-700">Hello, {user.username}!</p>
                        <button
                            onClick={logout}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Logout
                        </button>
                        <Link to="/dashboard" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Go to Dashboard
                        </Link>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Login
                        </Link>
                        <Link to="/register" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;
