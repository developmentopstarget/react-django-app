import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import Chat from './components/Chat';

import AuthGate from './AuthGate';
import LogoutButton from './LogoutButton';
import ItemPage from './ItemPage';

function ItemsRoute() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-xl">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Items</h1>
            <LogoutButton />
          </div>
          <ItemPage />
        </div>
      </div>
    </AuthGate>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          <Route path="/items" element={<ItemsRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
