import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL || 'ws://127.0.0.1:8000').replace(/\/$/, '');

const formatMessageTime = (timestamp) => {
    if (!timestamp) {
        return '';
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        ...(date.getFullYear() !== new Date().getFullYear() ? { year: 'numeric' } : {}),
        hour: '2-digit',
        minute: '2-digit',
    });
};

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [historyError, setHistoryError] = useState('');
    const { user } = useAuth();

    const roomName = user ? `user_${user.id}` : null;
    const token = localStorage.getItem('token');
    const socketUrl = token && roomName ? `${WS_BASE_URL}/ws/chat/${roomName}/?token=${token}` : null;

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
        shouldReconnect: () => true,
    });

    useEffect(() => {
        if (!user) {
            setMessages([]);
            return;
        }

        axios
            .get(`${API_BASE_URL}/api/chat/history/`)
            .then((response) => {
                setMessages(
                    response.data.map((entry) => ({
                        message: entry.message,
                        timestamp: entry.timestamp,
                    }))
                );
                setHistoryError('');
            })
            .catch(() => {
                setHistoryError('Failed to load chat history.');
            });
    }, [user]);

    useEffect(() => {
        if (lastMessage !== null) {
            const data = JSON.parse(lastMessage.data);
            setMessages((prev) =>
                prev.concat({
                    message: data.message,
                    timestamp: data.timestamp || new Date().toISOString(),
                })
            );
        }
    }, [lastMessage]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (input.trim()) {
            sendMessage(JSON.stringify({ message: input }));
            setInput('');
        }
    };

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Please log in to chat.</div>;
    }

    return (
        <div className="flex h-[calc(100vh-65px)] flex-col bg-gray-100">
            <div className="p-4 bg-gray-200 text-center">
                <span>The WebSocket is currently {connectionStatus}</span>
            </div>

            {historyError && (
                <div className="bg-red-50 p-3 text-center text-sm text-red-700">
                    {historyError}
                </div>
            )}

            <div className="flex-grow p-6 overflow-auto">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg shadow-md">
                            <p className="text-gray-800">{msg.message}</p>
                            {formatMessageTime(msg.timestamp) && (
                                <p className="mt-1 text-xs text-gray-400">
                                    {formatMessageTime(msg.timestamp)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-grow px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Type a message..."
                        disabled={readyState !== ReadyState.OPEN}
                    />
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                        disabled={readyState !== ReadyState.OPEN}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
