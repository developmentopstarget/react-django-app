import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { parseAuthErrors, useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState([]);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const redirectTo = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors([]);

        const result = await login(username, password);

        if (result.ok) {
            navigate(redirectTo, { replace: true });
        } else {
            setErrors(parseAuthErrors(result.errors, 'Invalid username or password.'));
        }

        setSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                            create a new account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {errors.length > 0 && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                            {errors.length === 1 ? (
                                <p>{errors[0]}</p>
                            ) : (
                                <ul className="list-disc list-inside space-y-1">
                                    {errors.map((message, index) => (
                                        <li key={index}>{message}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={submitting}
                        />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={submitting}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {submitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
