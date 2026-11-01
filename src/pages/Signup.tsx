import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type Role } from "../context/AuthContext";

const ROLES: { key: Role; label: string }[] = [
  { key: "student", label: "I'm a Student" },
  { key: "agent", label: "I'm an Agent" },
  { key: "university", label: "I'm a University" },
];

export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error } = await signUp(email, password, role, name);
    setBusy(false);
    if (error) { setError(error); return; }
    navigate("/login");
  }

  const input = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <main className="max-w-md mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">Create your account</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Start your Arrows journey.</p>

      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r.key)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                role === r.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <input className={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={input} type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button disabled={busy} className="w-full rounded-full bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-50">
          {busy ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
      </p>
    </main>
  );
}
