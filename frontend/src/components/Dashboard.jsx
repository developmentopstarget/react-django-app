import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    'http://127.0.0.1:8000'
).replace(/\/$/, '');

const Dashboard = () => {
    const { user } = useAuth();
    const [me, setMe] = useState(null);
    const [meLoading, setMeLoading] = useState(true);
    const [meError, setMeError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        axios
            .get(`${API_BASE_URL}/api/me/`)
            .then((response) => {
                if (isMounted) {
                    setMe(response.data);
                    setMeError(null);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setMeError('Failed to load user info.');
                }
            })
            .finally(() => {
                if (isMounted) {
                    setMeLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome to your Dashboard, {user ? user.username : 'Guest'}!
                </h2>

                <p className="mt-2 text-center text-sm text-gray-600">
                    This is a protected route, only accessible to authenticated users.
                </p>

                {meLoading && (
                    <p className="text-center text-sm text-gray-500">
                        Loading user info...
                    </p>
                )}

                {meError && (
                    <p className="text-center text-sm text-red-500">
                        {meError}
                    </p>
                )}

                {me && (
                    <div className="bg-white shadow rounded-lg p-6 space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                            User info
                        </h3>

                        <p className="text-sm font-medium text-gray-700">
                            <span className="text-gray-500">Username:</span> {me.username}
                        </p>

                        <p className="text-sm font-medium text-gray-700">
                            <span className="text-gray-500">Email:</span> {me.email || 'No email set'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
