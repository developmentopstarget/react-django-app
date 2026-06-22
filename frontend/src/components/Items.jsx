import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/runtime';

export default function Items() {
    const mountedRef = useRef(false);

    const [items, setItems] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

    const [error, setError] = useState('');
    const [createError, setCreateError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [editError, setEditError] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);

    const fetchItems = useCallback(async ({ initial = false } = {}) => {
        if (initial) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        setError('');

        try {
            const response = await axios.get(`${API_BASE_URL}/api/items/`);

            if (!mountedRef.current) {
                return;
            }

            setItems(response.data);
            setLastRefreshedAt(new Date());
        } catch (fetchError) {
            if (!mountedRef.current) {
                return;
            }

            setError('Unable to load items.');
        } finally {
            if (!mountedRef.current) {
                return;
            }

            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchItems({ initial: true });

        return () => {
            mountedRef.current = false;
        };
    }, [fetchItems]);

    useEffect(() => {
        const refreshWhenVisible = () => {
            if (document.visibilityState === 'visible') {
                fetchItems();
            }
        };

        const refreshOnFocus = () => {
            fetchItems();
        };

        const intervalId = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                fetchItems();
            }
        }, 30000);

        document.addEventListener('visibilitychange', refreshWhenVisible);
        window.addEventListener('focus', refreshOnFocus);

        return () => {
            document.removeEventListener('visibilitychange', refreshWhenVisible);
            window.removeEventListener('focus', refreshOnFocus);
            window.clearInterval(intervalId);
        };
    }, [fetchItems]);

    const handleCreate = async (event) => {
        event.preventDefault();

        const trimmed = name.trim();

        if (!trimmed) {
            return;
        }

        setSubmitting(true);
        setCreateError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/api/items/`, {
                name: trimmed,
            });

            setItems((currentItems) => [response.data, ...currentItems]);
            setName('');
            setLastRefreshedAt(new Date());
            window.dispatchEvent(new CustomEvent('rda:notifications-changed'));
        } catch (createRequestError) {
            setCreateError('Unable to create item.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditStart = (item) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditError('');
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditName('');
        setEditError('');
    };

    const handleEditSubmit = async (itemId) => {
        const trimmed = editName.trim();

        if (!trimmed) {
            setEditError('Item name is required.');
            return;
        }

        setEditSubmitting(true);
        setEditError('');

        try {
            const response = await axios.patch(`${API_BASE_URL}/api/items/${itemId}/`, {
                name: trimmed,
            });

            setItems((currentItems) =>
                currentItems.map((item) => (item.id === itemId ? response.data : item)),
            );

            setEditingId(null);
            setEditName('');
            setLastRefreshedAt(new Date());
        } catch (editRequestError) {
            setEditError('Unable to update item.');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDelete = async (itemId) => {
        setDeletingId(itemId);
        setDeleteError('');

        try {
            await axios.delete(`${API_BASE_URL}/api/items/${itemId}/`);
            setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
            setLastRefreshedAt(new Date());
        } catch (deleteRequestError) {
            setDeleteError('Unable to delete item.');
        } finally {
            setDeletingId(null);
        }
    };

    const lastRefreshedLabel = lastRefreshedAt
        ? lastRefreshedAt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
          })
        : null;

    return (
        <div className="min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-gray-100 px-4 py-10 sm:px-6 sm:py-12 lg:px-8 dark:bg-gray-900">
            <div className="mx-auto w-full max-w-md space-y-6">
                <div className="space-y-3 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Items
                    </h2>

                    <p className="text-base text-gray-600 sm:text-sm dark:text-gray-300">
                        View and manage your own items.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
                        <button
                            type="button"
                            onClick={() => fetchItems()}
                            disabled={loading || refreshing}
                            className="w-full rounded-md border border-indigo-200 bg-white px-4 py-2 text-base font-medium text-indigo-700 shadow-sm hover:bg-indigo-50 disabled:opacity-50 sm:w-auto sm:text-sm dark:border-indigo-700 dark:bg-gray-800 dark:text-indigo-300 dark:hover:bg-gray-700"
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>

                        {lastRefreshedLabel && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Last refreshed {lastRefreshedLabel}
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-full max-w-full rounded-lg bg-white p-4 shadow sm:p-6 dark:bg-gray-800">
                    <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="New item name"
                            disabled={submitting}
                            className="w-full min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                        />

                        <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 disabled:opacity-50 sm:text-sm"
                        >
                            {submitting ? 'Adding...' : 'Add'}
                        </button>
                    </form>

                    {createError && (
                        <p className="mt-3 text-base text-red-500 sm:text-sm">
                            {createError}
                        </p>
                    )}
                </div>

                {loading && (
                    <p className="text-center text-base text-gray-500 sm:text-sm dark:text-gray-400">
                        Loading items...
                    </p>
                )}

                {error && (
                    <p className="text-center text-base text-red-500 sm:text-sm">
                        {error}
                    </p>
                )}

                {deleteError && (
                    <p className="text-center text-base text-red-500 sm:text-sm">
                        {deleteError}
                    </p>
                )}

                {editError && (
                    <p className="text-center text-base text-red-500 sm:text-sm">
                        {editError}
                    </p>
                )}

                {!loading && !error && items.length === 0 && (
                    <p className="text-center text-base text-gray-500 sm:text-sm dark:text-gray-400">
                        No items yet.
                    </p>
                )}

                {!loading && !error && items.length > 0 && (
                    <ul className="w-full max-w-full overflow-hidden rounded-lg bg-white shadow divide-y divide-gray-100 dark:divide-gray-700 dark:bg-gray-800">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="px-4 py-4 text-base text-gray-800 sm:px-6 sm:py-3 sm:text-sm dark:text-gray-100"
                            >
                                {editingId === item.id ? (
                                    <div className="space-y-2">
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(event) => setEditName(event.target.value)}
                                                disabled={editSubmitting}
                                                className="w-full min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => handleEditSubmit(item.id)}
                                                disabled={editSubmitting}
                                                className="rounded-md bg-indigo-600 px-3 py-2 text-base font-medium text-white hover:bg-indigo-700 disabled:opacity-50 sm:text-sm"
                                            >
                                                {editSubmitting ? 'Saving...' : 'Save'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleEditCancel}
                                                disabled={editSubmitting}
                                                className="rounded-md border border-gray-300 px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 sm:text-sm dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <span className="min-w-0 break-words">{item.name}</span>

                                        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleEditStart(item)}
                                                className="flex-1 rounded-md border border-indigo-200 px-3 py-2 text-base font-medium text-indigo-700 hover:bg-indigo-50 sm:flex-none sm:text-sm dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-gray-700"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deletingId === item.id}
                                                className="flex-1 rounded-md border border-red-200 px-3 py-2 text-base font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 sm:flex-none sm:text-sm dark:border-red-800 dark:text-red-300 dark:hover:bg-gray-700"
                                            >
                                                {deletingId === item.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
