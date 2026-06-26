import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAuth } from '../context/useAuth';
import { API_BASE_URL, WS_BASE_URL } from '../config/runtime';


const AUTH_CLOSE_CODES = new Set([4001, 4003]);

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
    const [historyLoading, setHistoryLoading] = useState(false);
    const [wsAuthenticated, setWsAuthenticated] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const roomName = user ? `user_${user.id}` : null;
    const token = localStorage.getItem('token');
    const socketUrl = token && roomName ? `${WS_BASE_URL}/ws/chat/${roomName}/` : null;
    const trimmedInput = input.trim();

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
        shouldReconnect: (closeEvent) => !AUTH_CLOSE_CODES.has(closeEvent.code),
        onOpen: () => sendMessage(JSON.stringify({ type: 'auth', token })),
        onClose: () => setWsAuthenticated(false),
    });

    useEffect(() => {
        if (!user) {
            setMessages([]);
            return;
        }

        setHistoryLoading(true);
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
            })
            .finally(() => {
                setHistoryLoading(false);
            });
    }, [user]);

    useEffect(() => {
        if (lastMessage !== null) {
            let data;

            try {
                data = JSON.parse(lastMessage.data);
            } catch {
                return;
            }

            if (data.type === 'auth.success') {
                setWsAuthenticated(true);
                return;
            }

            if (data.type === 'error') {
                if (typeof data.error === 'string') {
                    setHistoryError(data.error);
                }
                return;
            }

            if (typeof data.message !== 'string') {
                return;
            }

            setMessages((prev) =>
                prev.concat({
                    message: data.message,
                    timestamp: data.timestamp || new Date().toISOString(),
                })
            );
        }
    }, [lastMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (trimmedInput) {
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
    const canSend = readyState === ReadyState.OPEN && wsAuthenticated && Boolean(trimmedInput);
    const isConnected = readyState === ReadyState.OPEN && wsAuthenticated;
    const statusTone = isConnected
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';

    const getMessageKind = (message) => {
        if (message.startsWith('AI: ')) {
            return 'ai';
        }

        if (user?.username && message.startsWith(`${user.username}:`)) {
            return 'current';
        }

        return 'other';
    };

    if (!user) {
        return (
            <div className="flex min-h-screen w-full max-w-full items-center justify-center overflow-x-hidden bg-gray-100 px-4 text-center text-gray-900 dark:bg-gray-900 dark:text-white">
                Please log in to chat.
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100dvh-65px)] flex-col bg-slate-100 text-slate-900 md:h-[calc(100vh-65px)] dark:bg-gray-950 dark:text-gray-100">
            <div className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:px-6">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-950 dark:text-white">Chat</h1>
                        <p className="text-sm text-slate-500 dark:text-gray-400">
                            Signed in as {user.username || 'your account'}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-medium sm:justify-end">
                        <span className={`rounded-full px-3 py-1 ${statusTone}`}>
                            WebSocket: {connectionStatus}
                        </span>
                        <span className={`rounded-full px-3 py-1 ${statusTone}`}>
                            Auth: {wsAuthenticated ? 'Verified' : 'Pending'}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700 dark:bg-gray-800 dark:text-gray-300">
                            History: {historyLoading ? 'Loading' : 'Loaded'}
                        </span>
                    </div>
                </div>
            </div>

            {historyError && (
                <div className="border-b border-red-200 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-300">
                    {historyError}
                </div>
            )}

            <div className="flex-grow overflow-auto px-4 pb-24 pt-5 sm:px-6 md:pb-5">
                <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col">
                    {historyLoading && messages.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400">
                            Loading chat history...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 p-8 text-center dark:border-gray-700 dark:bg-gray-900/60">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">No messages yet</h2>
                                <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-gray-400">
                                    Start the conversation with a message below.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, index) => {
                                const messageKind = getMessageKind(msg.message);
                                const isCurrentUser = messageKind === 'current';
                                const bubbleClass = isCurrentUser
                                    ? 'bg-indigo-600 text-white'
                                    : messageKind === 'ai'
                                      ? 'bg-violet-50 text-violet-950 ring-1 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-100 dark:ring-violet-800'
                                      : 'bg-white text-slate-900 ring-1 ring-slate-200 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800';
                                const timeClass = isCurrentUser
                                    ? 'text-indigo-100'
                                    : 'text-slate-500 dark:text-gray-400';
                                const formattedTime = formatMessageTime(msg.timestamp);

                                return (
                                    <div
                                        key={index}
                                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[72%] ${bubbleClass}`}>
                                            <p className="whitespace-pre-wrap break-words text-sm leading-6">{msg.message}</p>
                                            {formattedTime && (
                                                <p className={`mt-2 text-xs ${timeClass}`}>
                                                    {formattedTime}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-slate-200 bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] dark:border-gray-800 dark:bg-gray-900 sm:px-6 md:pb-4">
                <form onSubmit={handleSendMessage} className="mx-auto flex w-full max-w-5xl gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="min-w-0 flex-grow rounded-lg border border-slate-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:placeholder-gray-400 dark:disabled:bg-gray-800"
                        placeholder="Type a message..."
                        disabled={readyState !== ReadyState.OPEN || !wsAuthenticated}
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 dark:focus:ring-offset-gray-900 sm:px-6"
                        disabled={!canSend}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chat;
