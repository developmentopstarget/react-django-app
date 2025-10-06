import { useEffect, useState } from "react";

export default function ItemPage() {
  const API = `${import.meta.env.VITE_API_URL}/api/items/`;
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");

  async function load() {
    const res = await fetch(API);
    setItems(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    load();
  }

  async function remove(id) {
    await fetch(`${API}${id}/`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mt-8 w-full max-w-md bg-white rounded-2xl shadow p-4">
      <h2 className="text-xl font-semibold mb-3">Items</h2>

      <form onSubmit={create} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New item"
          className="flex-1 border rounded-lg p-2"
        />
        <button className="bg-blue-600 text-white px-4 rounded-lg">Add</button>
      </form>

      <ul className="space-y-2">
        {items.map(i => (
          <li key={i.id} className="flex justify-between items-center border-b py-1">
            <span>{i.name}</span>
            <button
              onClick={() => remove(i.id)}
              className="text-red-500 hover:underline text-sm"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
