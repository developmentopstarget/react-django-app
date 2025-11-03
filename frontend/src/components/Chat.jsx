import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const { user } = useAuth();

    const roomName = 'general';
    const token = localStorage.getItem('token');
    const socketUrl = `ws://${window.location.host.split(':')[0]}:8000/ws/chat/${roomName}/?token=${token}`;

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
        shouldReconnect: (closeEvent) => true,
    });

    useEffect(() => {
        if (lastMessage !== null) {
            const data = JSON.parse(lastMessage.data);
            setMessages((prev) => prev.concat(data.message));
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
        <div className="min-h-screen flex flex-col h-screen bg-gray-100">
            <div className="p-4 bg-gray-200 text-center">
                <span>The WebSocket is currently {connectionStatus}</span>
            </div>
            <div className="flex-grow p-6 overflow-auto">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg shadow-md">
                            <p className="text-gray-800">{message}</p>
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
