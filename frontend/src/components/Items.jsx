import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    'http://127.0.0.1:8000'
).replace(/\/$/, '');

export default function Items() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [createError, setCreateError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        axios
            .get(`${API_BASE_URL}/api/items/`)
            .then((response) => {
                if (isMounted) {
                    setItems(response.data);
                    setError(null);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setError('Failed to load items.');
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleCreate(event) {
        event.preventDefault();

        const trimmed = name.trim();
        if (!trimmed) return;

        setSubmitting(true);
        setCreateError(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/items/`, {
                name: trimmed,
            });

            setItems((currentItems) => [response.data, ...currentItems]);
            setName('');
        } catch {
            setCreateError('Failed to create item.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md space-y-6">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Items
                </h2>

                <p className="text-center text-sm text-gray-600">
                    View and create your own items.
                </p>

                <div className="bg-white shadow rounded-lg p-6 space-y-4">
                    <form onSubmit={handleCreate} className="flex gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="New item name"
                            disabled={submitting}
                            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Adding...' : 'Add'}
                        </button>
                    </form>

                    {createError && (
                        <p className="text-sm text-red-500">{createError}</p>
                    )}
                </div>

                {loading && (
                    <p className="text-center text-sm text-gray-500">
                        Loading items...
                    </p>
                )}

                {error && (
                    <p className="text-center text-sm text-red-500">
                        {error}
                    </p>
                )}

                {!loading && !error && items.length === 0 && (
                    <p className="text-center text-sm text-gray-500">
                        No items yet. Add one above.
                    </p>
                )}

                {!loading && !error && items.length > 0 && (
                    <ul className="bg-white shadow rounded-lg divide-y divide-gray-100">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="px-6 py-3 text-sm text-gray-800"
                            >
                                {item.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
