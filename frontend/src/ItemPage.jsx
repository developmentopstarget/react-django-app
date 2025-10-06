// frontend/src/ItemPage.jsx
import { useEffect, useRef, useState } from "react";
import { api } from "./api";

export default function ItemPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");

const abortRef = useRef(null);
const timerRef = useRef(null);
const reqIdRef = useRef(0); // ⬅️ new


  // initial load
  useEffect(() => {
    fetchList();
    return () => abortRef.current?.abort?.();
  }, []);

function fetchList({ search } = {}) {
  // cancel the in-flight request
  abortRef.current?.abort?.();
  const controller = new AbortController();
  abortRef.current = controller;

  const myId = ++reqIdRef.current;
  setLoading(true);
  setErr("");

  api
    .listItems({ search, signal: controller.signal })
    .then((data) => {
      if (reqIdRef.current === myId) setItems(data); // ignore stale
    })
    .catch((e) => {
      // ignore deliberate aborts from debounce/unmount
      if (e?.name === "AbortError") return;
      if (reqIdRef.current === myId) setErr(e.message || "Failed to load items");
    })
    .finally(() => {
      if (reqIdRef.current === myId) setLoading(false);
    });
}


  // debounce search (300ms)
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => fetchList({ search: query.trim() }),
      300
    );
    return () => clearTimeout(timerRef.current);
  }, [query]);

  async function create(e) {
    e.preventDefault();
    const val = name.trim();
    if (!val) return;

    // optimistic create
    const temp = { id: `tmp-${Date.now()}`, name: val, _optimistic: true };
    setItems((prev) => [temp, ...prev]);
    setName("");

    try {
      const created = await api.createItem({ name: val });
      setItems((prev) => prev.map((it) => (it.id === temp.id ? created : it)));
    } catch (e) {
      setItems((prev) => prev.filter((it) => it.id !== temp.id));
      setErr(e.message || "Failed to add item");
    }
  }

  async function remove(id) {
    const snapshot = items;
    setItems((prev) => prev.filter((i) => i.id !== id)); // optimistic remove
    try {
      await api.deleteItem(id);
    } catch (e) {
      setItems(snapshot); // rollback
      setErr(e.message || "Failed to delete item");
    }
  }

  function upsertLocal(patch) {
    setItems((prev) => prev.map((i) => (i.id === patch.id ? { ...i, ...patch } : i)));
  }

  async function commitRename(id, newName) {
    const before = items.find((i) => i.id === id);
    if (!before) return;

    const name = newName.trim();
    if (!name || name === before.name) {
      upsertLocal({ id, _saving: false, _error: "" });
      return;
    }

    // optimistic rename
    upsertLocal({ id, name, _saving: true, _error: "" });

    try {
      const saved = await api.patchItem(id, { name });
      upsertLocal({ ...saved, _saving: false, _error: "" });
    } catch (e) {
      upsertLocal({ ...before, _saving: false, _error: e.message || "Rename failed" });
      setTimeout(() => upsertLocal({ id, _error: "" }), 2000);
    }
  }

  return (
    <div className="mt-8 w-full max-w-md bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-semibold mb-3">Items</h2>

      <form onSubmit={create} className="flex gap-2 mb-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New item"
          className="flex-1 border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 active:scale-[.98]">
          Add
        </button>
      </form>

      {/* ⬇️ Place the search input right here */}
      <input
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setErr(""); }}
        placeholder="Search…"
        className="mb-4 w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Search items"
      />

      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}

      {loading ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <ItemRow
              key={i.id}
              item={i}
              onDelete={() => remove(i.id)}
              onLocalUpdate={upsertLocal}
              onCommitRename={(val) => commitRename(i.id, val)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemRow({ item, onDelete, onLocalUpdate, onCommitRename }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.name || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) setValue(item.name || "");
  }, [item.name, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function cancel() {
    setEditing(false);
    setValue(item.name || "");
  }

  async function commit() {
    const next = value.trim();
    setEditing(false);
    if (!next) {
      setValue(item.name || "");
      return;
    }
    if (next !== item.name) {
      await onCommitRename(next);
    }
  }

  return (
    <li className="flex justify-between items-center border-b py-2 px-1 rounded-lg hover:bg-gray-50 transition">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`h-2.5 w-2.5 rounded-full ${item._saving ? "bg-blue-400 animate-pulse" : "bg-gray-300"}`}
          title={item._saving ? "Saving…" : ""}
        />
        <div className="min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") cancel();
              }}
              className="w-full rounded border border-blue-300 bg-white px-2 py-1 text-sm outline-none ring-2 ring-blue-200"
              aria-label={`Rename ${item.name}`}
            />
          ) : (
            <button
              className="max-w-full truncate text-left text-sm rounded px-1 py-0.5 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {item.name || <span className="italic text-gray-400">unnamed</span>}
            </button>
          )}
          {item._error && (
            <div className="mt-1 text-xs text-red-600">{item._error}</div>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="text-red-600 text-sm rounded-lg border border-red-200 bg-red-50 px-2 py-1 hover:bg-red-100 active:scale-[.98]"
      >
        Delete
      </button>
    </li>
  );
}

function EmptyState({ query }) {
  return (
    <div className="mb-2 rounded-xl border border-gray-100 bg-gray-50 py-8 text-center">
      {query?.trim() ? (
        <p className="text-sm text-gray-600">
          No items match <span className="font-medium">“{query}”</span>.
        </p>
      ) : (
        <p className="text-sm text-gray-600">No items yet. Add one to get started.</p>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y divide-gray-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 px-2 py-2">
          <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
          <div className="flex-1 h-4 rounded bg-gray-200/70 animate-pulse" />
          <div className="h-6 w-14 rounded bg-gray-100 animate-pulse" />
        </li>
      ))}
    </ul>
  );
}
