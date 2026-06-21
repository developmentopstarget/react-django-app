import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }) =>
    [
        'rounded-md px-3 py-2 text-sm font-medium transition',
        isActive
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    ].join(' ');

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/', { replace: true });
    };

    return (
        <header className="border-b bg-white shadow-sm">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link to="/" className="text-lg font-bold text-gray-900">
                    React Django App
                </Link>

                <div className="flex items-center gap-2">
                    <NavLink to="/" className={navLinkClass}>
                        Home
                    </NavLink>

                    {user ? (
                        <>
                            <NavLink to="/dashboard" className={navLinkClass}>
                                Dashboard
                            </NavLink>
                            <NavLink to="/chat" className={navLinkClass}>
                                Chat
                            </NavLink>
                            <NavLink to="/items" className={navLinkClass}>
                                Items
                            </NavLink>

                            <span className="ml-3 hidden text-sm text-gray-500 sm:inline">
                                {user.username}
                            </span>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={navLinkClass}>
                                Login
                            </NavLink>
                            <NavLink to="/register" className={navLinkClass}>
                                Register
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
