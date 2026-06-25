import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/runtime';
import { AuthContext } from './authProviderContext';

const API_URL = `${API_BASE_URL}/api/auth/`;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            axios.defaults.headers.common.Authorization = `Token ${token}`;

            axios.get(`${API_URL}users/me/`)
                .then((response) => {
                    setUser(response.data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    delete axios.defaults.headers.common.Authorization;
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
            axios.defaults.headers.common.Authorization = `Token ${token}`;

            const userResponse = await axios.get(`${API_URL}users/me/`);
            setUser(userResponse.data);

            return { ok: true, errors: null };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                ok: false,
                errors: error.response?.data || { detail: 'Invalid username or password.' },
            };
        }
    };

    const register = async (username, email, password) => {
        try {
            await axios.post(`${API_URL}users/`, { username, email, password });
            return login(username, password);
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                ok: false,
                errors: error.response?.data || { detail: 'Registration failed. Please try again.' },
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}token/logout/`);
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common.Authorization;
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
