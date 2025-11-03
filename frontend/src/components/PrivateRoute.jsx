import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    console.log('PrivateRoute rendering, loading:', loading, 'user:', user);

    if (loading) {
        console.log('PrivateRoute: loading');
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Or a spinner
    }

    console.log('PrivateRoute: not loading, user:', user);
    return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
