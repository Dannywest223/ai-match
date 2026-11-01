import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth, type Role } from "../context/AuthContext";
import { StatCard } from "../components/StatCard";
import { Users, FileText, DollarSign, ShieldAlert, Database } from "lucide-react";
import { AdminDataTab } from "../components/AdminDataTab";

type Profile = { id: string; role: Role; name: string | null; target_country: string | null };
type Application = { id: number; student_id: string; university: string; program: string; country: string; status: string; match_score: number };

export function AdminDashboard() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<"users" | "apps" | "fin" | "data">("users");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pRes, aRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("applications").select("*").order("created_at", { ascending: false }),
      ]);
      setProfiles((pRes.data ?? []) as Profile[]);
      setApplications((aRes.data ?? []) as Application[]);
      setLoading(false);
    }
    load();
  }, []);

  if (profile?.role !== "admin") {
    return (
      <main className="max-w-md mx-auto px-6 py-24 text-center">
        <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold mb-2">Admin access only</h1>
        <p className="text-sm text-gray-500">You do not have permission to view this page.</p>
      </main>
    );
  }

  if (loading) return <div className="p-12 text-center text-gray-500">Loading admin data...</div>;

  const totalUsers = profiles.length;
  const students = profiles.filter(p => p.role === "student").length;
  const agents = profiles.filter(p => p.role === "agent").length;
  const unis = profiles.filter(p => p.role === "university").length;
  const totalApps = applications.length;
  const offers = applications.filter(a => a.status === "Offer").length;

  async function updateRole(id: string, newRole: Role) {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    if (error) { alert(error.message); return; }
    setProfiles(profiles.map(p => p.id === id ? { ...p, role: newRole } : p));
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Internal dashboard — users, applications, and data management.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={String(totalUsers)} hint={`${students} students, ${agents} agents, ${unis} unis`} />
        <StatCard label="Applications" value={String(totalApps)} hint="All time" />
        <StatCard label="Offers sent" value={String(offers)} hint="Accepted" />
        <StatCard label="Revenue (mock)" value="$0" hint="Payments not wired yet" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 ${
            tab === "users" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
          }`}
        >
          <Users size={16} /> Users
        </button>
        <button
          onClick={() => setTab("apps")}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 ${
            tab === "apps" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
          }`}
        >
          <FileText size={16} /> Applications
        </button>
        <button
          onClick={() => setTab("fin")}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 ${
            tab === "fin" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
          }`}
        >
          <DollarSign size={16} /> Financials
        </button>
        <button
          onClick={() => setTab("data")}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 ${
            tab === "data" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
          }`}
        >
          <Database size={16} /> Data
        </button>
      </div>

      {/* USERS TAB */}
      {tab === "users" && (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Target</th>
                <th className="text-left px-4 py-3 font-medium">Change role</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="px-4 py-3">{p.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      p.role === "admin" ? "bg-red-100 text-red-700" :
                      p.role === "agent" ? "bg-purple-100 text-purple-700" :
                      p.role === "university" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.target_country || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={p.role}
                      onChange={(e) => updateRole(p.id, e.target.value as Role)}
                      className="text-xs rounded border border-gray-300 dark:border-gray-700 bg-transparent px-2 py-1"
                    >
                      <option value="student">student</option>
                      <option value="agent">agent</option>
                      <option value="university">university</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* APPS TAB */}
      {tab === "apps" && (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left px-4 py-3 font-medium">University</th>
                <th className="text-left px-4 py-3 font-medium">Program</th>
                <th className="text-left px-4 py-3 font-medium">Country</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No applications yet.
                  </td>
                </tr>
              ) : applications.map((a) => (
                <tr key={a.id} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="px-4 py-3">{a.university}</td>
                  <td className="px-4 py-3 text-gray-500">{a.program}</td>
                  <td className="px-4 py-3">{a.country}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{a.match_score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* FINANCIALS TAB */}
      {tab === "fin" && (
        <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-xl font-semibold mb-3">Financials</h2>
          <p className="text-sm text-gray-500">
            Payments are not yet wired. Once Stripe/Paystack is integrated, this tab will show:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-3 space-y-1">
            <li>Application fees collected per student</li>
            <li>University commissions per accepted offer</li>
            <li>Agent payouts (referral rewards)</li>
            <li>Refunds & wallet balances</li>
          </ul>
        </section>
      )}

      {/* DATA TAB */}
      {tab === "data" && <AdminDataTab />}
    </main>
  );
}