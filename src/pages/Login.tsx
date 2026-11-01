import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error } = await signIn(email, password);
    setBusy(false);
    if (error) { setError(error); return; }
    navigate("/dashboard/student");
  }

  const input = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <main className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Log in to your Arrows account.</p>

      <form onSubmit={submit} className="space-y-4">
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full rounded-full bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-50">
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        No account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
      </p>
    </main>
  );
}
