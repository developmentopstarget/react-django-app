import { useEffect, useState } from 'react';
import { auth } from './api';

export default function Login({ onAuthed }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { auth.csrf().catch(() => {}); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const me = await auth.login(username, password);
      onAuthed?.(me);
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border rounded-xl p-2" placeholder="Username"
               value={username} onChange={e => setUsername(e.target.value)} />
        <input className="w-full border rounded-xl p-2" placeholder="Password" type="password"
               value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} className="w-full bg-black text-white rounded-xl p-2">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
