import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Base URL for your Django backend
    const API_URL = 'http://127.0.0.1:8000/api/auth/';

    useEffect(() => {
        // Check for token in localStorage on initial load
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            // Optionally, verify the token or fetch user details
            axios.get(`${API_URL}users/me/`)
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common['Authorization'];
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post(`${API_URL}token/login/`, { username, password });
            const token = response.data.auth_token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            const userResponse = await axios.get(`${API_URL}users/me/`);
            setUser(userResponse.data);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const register = async (username, email, password) => {
        try {
            await axios.post(`${API_URL}users/`, { username, email, password });
            // Optionally, log in the user immediately after registration
            return login(username, password);
        } catch (error) {
            console.error('Registration failed:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}token/logout/`);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
