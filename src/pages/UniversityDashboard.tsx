import { useEffect, useState } from "react";
import { Plus, Sparkles, ShieldCheck } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { ApplicantRow, type Applicant } from "../components/ApplicantRow";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function UniversityDashboard() {
  const { user, profile } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State (Full Details)
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Undergraduate");
  const [duration, setDuration] = useState("4 years");
  const [seats, setSeats] = useState("50");
  const [fee, setFee] = useState("20000");
  const [currency, setCurrency] = useState("USD");
  const [desc, setDesc] = useState("");
  const [reqSummary, setReqSummary] = useState("");
  const [ielts, setIelts] = useState("6.0");

  async function load() {
    if (!user) return;
    setLoading(true); setError(null);

    // 1. Load programs this university created
    const { data: links } = await supabase
      .from("university_links")
      .select("program_id")
      .eq("uni_id", user.id);
    
    const progIds = (links ?? []).map(l => l.program_id);
    
    if (progIds.length > 0) {
      const { data: p } = await supabase
        .from("program")
        .select("*")
        .in("Program_ID", progIds);
      setPrograms(p ?? []);
    } else {
      setPrograms([]);
    }

    // 2. Load applications (for demo, just fetch all)
    const { data: apps } = await supabase
      .from("applications")
      .select("id, student_id, university, program, country, status")
      .order("created_at", { ascending: false })
      .limit(10);

    // 3. Fetch student names
    const studentIds = (apps ?? []).map((a) => a.student_id).filter(Boolean);
    let profileMap: Record<string, string> = {};
    if (studentIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, name").in("id", studentIds);
      (profs ?? []).forEach((p: any) => { profileMap[p.id] = p.name || "Student"; });
    }

    setApplicants((apps ?? []).map((a: any) => ({
      id: String(a.id), name: profileMap[a.student_id] || "Student",
      program: a.program, country: a.country, status: a.status,
    })));
    
    setLoading(false);
  }

  useEffect(() => { load(); }, [user]);

  async function postProgram(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true); setError(null);

    // Generate a unique program ID
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5);
    const progId = `${profile?.name?.replace(/[^a-zA-Z0-9]/g, "").slice(0,5) || "UNI"}_${cleanName}_${Date.now()}`;

    // 1. Insert into main program table
    const { error: progErr } = await supabase.from("program").insert({
      "Institution_ID": profile?.name || "NEW_UNI", // Ideally the university's ID, but using name for now
      "Program_ID": progId,
      "Course/Program_Title": name,
      "Course_Level": level,
      "Duration": duration,
      "Campus/Location": "On Campus",
      "Short_Description_30_60_words": desc,
    });

    if (progErr) { setError(progErr.message); setSaving(false); return; }

    // 2. Insert requirement
    await supabase.from("requirements").insert({
      "Program_ID": progId,
      "Academic_Requirement_Summary": reqSummary || "Standard entry requirements apply",
      "Minimum_GPA/Grade": "2.5",
      "English_Test_Accepted": "IELTS / TOEFL",
      "IELTS_Minimum": parseFloat(ielts) || 6.0,
    });

    // 3. Insert fee
    await supabase.from("fees").insert({
      "Program_ID": progId,
      "Tuition_Fee_Amount": parseFloat(fee) || 0,
      "Currency": currency,
      "Fee_Basis": "Annual tuition",
    });

    // 4. Link the program to this university
    await supabase.from("university_links").insert({
      uni_id: user.id,
      program_id: progId,
    });

    setSaving(false);
    setAdding(false);
    setName(""); setDesc(""); setReqSummary(""); // Reset
    load();
  }

  async function updateStatus(applicant: Applicant, status: string) {
    const { error } = await supabase.from("applications").update({ status }).eq("id", applicant.id);
    if (error) { alert(error.message); return; }
    load();
  }

  const input = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">University Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage programs and applications.</p>
        </div>
        <button onClick={() => setAdding((a) => !a)} className="flex items-center gap-2 self-start rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> {adding ? "Cancel" : "Post program"}
        </button>
      </div>

      {/* FULL PROGRAM FORM */}
      {adding && (
        <form onSubmit={postProgram} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ShieldCheck className="text-blue-600" size={20} /> Create New Program
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Program Title</label>
              <input className={input} placeholder="e.g. BSc Computer Science" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Level</label>
              <select className={input} value={level} onChange={(e) => setLevel(e.target.value)}>
                <option>Undergraduate</option><option>Postgraduate</option><option>PhD</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration</label>
              <input className={input} placeholder="e.g. 4 years" value={duration} onChange={(e) => setDuration(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Seats Available</label>
              <input className={input} type="number" placeholder="e.g. 50" value={seats} onChange={(e) => setSeats(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Tuition Fee</label>
              <input className={input} type="number" placeholder="e.g. 20000" value={fee} onChange={(e) => setFee(e.target.value)} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Currency</label>
              <select className={input} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option>USD</option><option>GBP</option><option>EUR</option><option>MYR</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Short Description</label>
              <textarea className={input} rows={2} placeholder="Covers programming, algorithms, systems..." value={desc} onChange={(e) => setDesc(e.target.value)} required />
            </div>
            <div className="sm:col-span-2 border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Entry Requirement Summary</label>
              <input className={input} placeholder="e.g. High School Diploma with strong grades" value={reqSummary} onChange={(e) => setReqSummary(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Minimum IELTS</label>
              <input className={input} placeholder="e.g. 6.0" value={ielts} onChange={(e) => setIelts(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={saving} className="w-full rounded-full bg-blue-600 text-white py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mt-4">
            {saving ? "Posting to Database..." : "Post Program & Requirements"}
          </button>
        </form>
      )}

      {error && !adding && <p className="text-sm text-red-600">Error: {error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Applications" value={String(applicants.length)} hint="Incoming" />
        <StatCard label="Offers sent" value={String(applicants.filter(a => a.status === "Offer").length)} hint="Accepted" />
        <StatCard label="Programs" value={String(programs.length)} hint="Active listings" />
        <StatCard label="Avg. match" value="84%" hint="Coming soon" />
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Incoming applications</h2>
        {applicants.length === 0 && !loading ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
            No applications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {applicants.map((a) => (
              <ApplicantRow key={a.id} applicant={a} onAccept={() => updateStatus(a, "Offer")} onRequestDocs={() => updateStatus(a, "Under review")} onReject={() => updateStatus(a, "Rejected")} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Your programs</h2>
        {programs.length === 0 && !loading ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
            No programs yet. Click "Post program" to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((p) => (
              <div key={p.Program_ID} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div>
                  <p className="font-semibold">{p["Course/Program_Title"]}</p>
                  <p className="text-sm text-gray-500">{p.Course_Level} · {p.Duration}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-wrap gap-3">
        <button className="rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700">View leads</button>
        <button className="rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Recruitment report</button>
        <button onClick={() => window.dispatchEvent(new Event("open-arrows-chat"))} className="rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2">
          <Sparkles size={14} className="text-blue-600" /> Talk to Arrows
        </button>
      </section>
    </main>
  );
}