import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/runtime';

export default function Items() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [createError, setCreateError] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState(null);

    const [deletingId, setDeletingId] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

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
            window.dispatchEvent(new CustomEvent('rda:notifications-changed'));
        } catch {
            setCreateError('Failed to create item.');
        } finally {
            setSubmitting(false);
        }
    }

    function handleEditStart(item) {
        setEditingId(item.id);
        setEditName(item.name);
        setEditError(null);
        setDeleteError(null);
    }

    function handleEditCancel() {
        setEditingId(null);
        setEditName('');
        setEditError(null);
    }

    async function handleEditSave(id) {
        const trimmed = editName.trim();
        if (!trimmed) return;

        setEditSubmitting(true);
        setEditError(null);

        try {
            const response = await axios.patch(`${API_BASE_URL}/api/items/${id}/`, {
                name: trimmed,
            });

            setItems((currentItems) =>
                currentItems.map((item) =>
                    item.id === id ? response.data : item
                )
            );

            setEditingId(null);
            setEditName('');
        } catch {
            setEditError('Failed to save changes.');
        } finally {
            setEditSubmitting(false);
        }
    }

    async function handleDelete(id) {
        setDeletingId(id);
        setDeleteError(null);

        try {
            await axios.delete(`${API_BASE_URL}/api/items/${id}/`);

            setItems((currentItems) =>
                currentItems.filter((item) => item.id !== id)
            );

            if (editingId === id) {
                handleEditCancel();
            }
        } catch {
            setDeleteError('Failed to delete item.');
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="min-h-[100dvh] overflow-x-hidden bg-gray-100 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
            <div className="mx-auto max-w-md space-y-6">
                <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Items
                </h2>

                <p className="text-center text-base sm:text-sm text-gray-600 dark:text-gray-300">
                    View and manage your own items.
                </p>

                <div className="bg-white shadow rounded-lg p-6 space-y-4 dark:bg-gray-800">
                    <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="New item name"
                            disabled={submitting}
                            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-base sm:text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                        />

                        <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-base sm:text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Adding...' : 'Add'}
                        </button>
                    </form>

                    {createError && (
                        <p className="text-sm text-red-500">{createError}</p>
                    )}
                </div>

                {loading && (
                    <p className="text-center text-base sm:text-sm text-gray-500 dark:text-gray-400">
                        Loading items...
                    </p>
                )}

                {error && (
                    <p className="text-center text-base sm:text-sm text-red-500">
                        {error}
                    </p>
                )}

                {deleteError && (
                    <p className="text-center text-base sm:text-sm text-red-500">
                        {deleteError}
                    </p>
                )}

                {!loading && !error && items.length === 0 && (
                    <p className="text-center text-base sm:text-sm text-gray-500 dark:text-gray-400">
                        No items yet. Add one above.
                    </p>
                )}

                {!loading && !error && items.length > 0 && (
                    <ul className="bg-white shadow rounded-lg divide-y divide-gray-100 dark:divide-gray-700 dark:bg-gray-800">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className="px-6 py-3 text-base sm:text-sm text-gray-800 dark:text-gray-100"
                            >
                                {editingId === item.id ? (
                                    <div className="space-y-2">
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(event) =>
                                                    setEditName(event.target.value)
                                                }
                                                disabled={editSubmitting}
                                                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-base sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => handleEditSave(item.id)}
                                                disabled={
                                                    editSubmitting || !editName.trim()
                                                }
                                                className="rounded-md bg-indigo-600 px-3 py-1.5 text-base sm:text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {editSubmitting ? 'Saving...' : 'Save'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleEditCancel}
                                                disabled={editSubmitting}
                                                className="rounded-md border border-gray-300 px-3 py-1.5 text-base sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        {editError && (
                                            <p className="text-xs text-red-500">
                                                {editError}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <span>{item.name}</span>

                                        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => handleEditStart(item)}
                                                disabled={deletingId === item.id}
                                                className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deletingId === item.id}
                                                className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
                                            >
                                                {deletingId === item.id
                                                    ? 'Deleting...'
                                                    : 'Delete'}
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
