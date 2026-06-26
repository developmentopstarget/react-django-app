import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import MobileAppShell from './components/MobileAppShell';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Chat from './components/Chat';
import Items from './components/Items';
import Account from './components/Account';
import About from './components/About';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <MobileAppShell />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/about" element={<About />} />

                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/chat"
                        element={
                            <PrivateRoute>
                                <Chat />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/items"
                        element={
                            <PrivateRoute>
                                <Items />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/account"
                        element={
                            <PrivateRoute>
                                <Account />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
