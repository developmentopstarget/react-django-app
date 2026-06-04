import { auth } from './api';

export default function LogoutButton() {
  async function handle() {
    try { await auth.logout(); } finally { window.location.reload(); }
  }
  return <button className="text-sm underline" onClick={handle}>Logout</button>;
}
