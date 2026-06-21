import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const API_URL = `${API_BASE_URL}/api/auth/`;

const FIELD_LABELS = {
    username: 'Username',
    email: 'Email',
    password: 'Password',
    non_field_errors: '',
    detail: '',
};

function formatFieldName(fieldName) {
    if (FIELD_LABELS[fieldName] !== undefined) {
        return FIELD_LABELS[fieldName];
    }

    return fieldName
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeMessages(value) {
    if (!value) {
        return [];
    }

    if (typeof value === 'string') {
        return [value];
    }

    if (Array.isArray(value)) {
        return value.flatMap((item) => normalizeMessages(item));
    }

    if (typeof value === 'object') {
        return Object.entries(value).flatMap(([key, nestedValue]) => {
            const messages = normalizeMessages(nestedValue);
            const label = formatFieldName(key);

            return messages.map((message) =>
                label ? `${label}: ${message}` : message
            );
        });
    }

    return [String(value)];
}

export function parseAuthErrors(data, fallbackMessage = 'Something went wrong. Please try again.') {
    if (!data) {
        return [fallbackMessage];
    }

    if (typeof data === 'string' || Array.isArray(data)) {
        const messages = normalizeMessages(data);
        return messages.length > 0 ? messages : [fallbackMessage];
    }

    if (typeof data === 'object') {
        const messages = Object.entries(data).flatMap(([key, value]) => {
            const label = formatFieldName(key);
            const fieldMessages = normalizeMessages(value);

            return fieldMessages.map((message) =>
                label ? `${label}: ${message}` : message
            );
        });

        return messages.length > 0 ? messages : [fallbackMessage];
    }

    return [fallbackMessage];
}

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

export const useAuth = () => useContext(AuthContext);
