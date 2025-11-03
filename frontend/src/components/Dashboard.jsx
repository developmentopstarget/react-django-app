import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome to your Dashboard, {user ? user.username : 'Guest'}!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    This is a protected route, only accessible to authenticated users.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
