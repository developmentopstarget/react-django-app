import { useEffect, useState } from 'react';
import { auth } from './api';
import Login from './Login';

export default function AuthGate({ children }) {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    auth.me().then(u => { if (mounted) setMe(u); }).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!me?.isAuthenticated && !me?.username) return <Login onAuthed={() => window.location.reload()} />;
  return <>{children}</>;
}
