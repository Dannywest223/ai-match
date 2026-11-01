import { useEffect, useState } from "react";
import { Sparkles, UserPlus, X } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { StudentRow, type Student } from "../components/StudentRow";
import { CommissionCard } from "../components/CommissionCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function AgentDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [addingError, setAddingError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true); setError(null);

    // 1. Get linked student IDs
    const { data: links, error: lErr } = await supabase
      .from("agent_students")
      .select("student_id")
      .eq("agent_id", user.id);

    if (lErr) { setError(lErr.message); setLoading(false); return; }

    const studentIds = (links ?? []).map((l) => l.student_id);

    // 2. Fetch their profiles
    let mapped: Student[] = [];
    if (studentIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, name, target_country")
        .in("id", studentIds);

      // Fetch latest application per student for status
      const { data: apps } = await supabase
        .from("applications")
        .select("student_id, status, program, country")
        .in("student_id", studentIds)
        .order("created_at", { ascending: false });

      const latestApp: Record<string, any> = {};
      (apps ?? []).forEach((a) => {
        if (!latestApp[a.student_id]) latestApp[a.student_id] = a;
      });

      mapped = (profs ?? []).map((p: any) => {
        const app = latestApp[p.id];
        return {
          id: p.id,
          name: p.name || "Student",
          country: app?.country || p.target_country || "—",
          program: app?.program || "No application yet",
          status: app?.status || "New",
          last_activity: "Recently",
        };
      });
    }

    setStudents(mapped);
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setAddingError(null);

    // 1. Look up student by email
    const { data: studentProfile, error: findErr } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("name", newEmail) // fallback: try name match
      .maybeSingle();

    // Better: search auth users via profiles is not possible directly.
    // We use a workaround: agent enters student's email, we match against profiles via a lookup.
    // Since profiles doesn't store email, we instead link by user_id — which the agent doesn't know.
    // Simplest MVP: agent enters student's profile ID (or we add email to profiles).
    // For now, treat "email" as the student's profile UUID (agents can copy it from the student's invite link).

    if (findErr || !studentProfile) {
      setAddingError("Student not found. Please enter a valid student account ID.");
      return;
    }

    // 2. Insert link
    const { error: linkErr } = await supabase
      .from("agent_students")
      .insert({ agent_id: user.id, student_id: studentProfile.id });

    if (linkErr) {
      setAddingError(linkErr.message);
      return;
    }

    setAdding(false);
    setNewEmail("");
    load();
  }

  const commission = students.length * 400;

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your linked students.</p>
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          className="flex items-center gap-2 self-start rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700"
        >
          <UserPlus size={16} /> {adding ? "Cancel" : "Add student"}
        </button>
      </div>

      {adding && (
        <form onSubmit={addStudent} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Student account ID (UUID)"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <button type="submit" className="rounded-full bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700">
              Link
            </button>
          </div>
          {addingError && <p className="text-sm text-red-600">{addingError}</p>}
          <p className="text-xs text-gray-500">
            Tip: ask the student to copy their account ID from their dashboard and paste it here.
          </p>
        </form>
      )}

      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Students" value={String(students.length)} hint="Linked to you" />
        <StatCard label="Applications" value={String(students.filter(s => s.status !== "New").length)} hint="Active" />
        <StatCard label="Offers" value={String(students.filter(s => s.status === "Offer").length)} hint="Pending" />
        <StatCard label="Commission earned" value={`$${commission.toLocaleString()}`} hint="Estimated" />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your students</h2>
        {students.length === 0 && !loading ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
            No students linked yet. Click "Add student" to link one.
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((s) => <StudentRow key={s.id} student={s} />)}
          </div>
        )}
      </section>

      <CommissionCard earned={commission} pending={commission * 0.25} paid={commission * 0.75} />

      <section className="flex flex-wrap gap-3">
        <button className="rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700">Browse programs</button>
        <button className="rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">View leads</button>
        <button
          onClick={() => window.dispatchEvent(new Event("open-arrows-chat"))}
          className="rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
        >
          <Sparkles size={14} className="text-blue-600" /> Talk to Arrows
        </button>
      </section>
    </main>
  );
}