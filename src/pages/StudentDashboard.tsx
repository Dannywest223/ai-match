import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { ApplicationRow, type Application } from "../components/ApplicationRow";
import { DocumentCard, type Doc } from "../components/DocumentCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

const DEFAULT_DOCS = ["Academic transcript", "Passport", "Bank statement", "English test (IELTS/TOEFL)", "Recommendation letter"];

export function StudentDashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentName, setAgentName] = useState<string | null>(null);

  // Profile Modal State
  const [showProfile, setShowProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    if (!user) return;
    
    const { data: apps } = await supabase
      .from("applications")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
    setApplications((apps ?? []) as Application[]);

    let { data: dbDocs } = await supabase
      .from("documents")
      .select("*")
      .eq("student_id", user.id);
    
    if (!dbDocs || dbDocs.length === 0) {
      const toInsert = DEFAULT_DOCS.map(name => ({ student_id: user.id, name, status: "pending" }));
      const { data: newDocs } = await supabase.from("documents").insert(toInsert).select();
      dbDocs = newDocs;
    }
    setDocs((dbDocs ?? []) as Doc[]);
    setLoading(false);
  }

  async function loadAgent() {
    if (!user) return;
    const { data: link } = await supabase
      .from("agent_students")
      .select("agent_id")
      .eq("student_id", user.id)
      .maybeSingle();

    if (link?.agent_id) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", link.agent_id)
        .maybeSingle();
      setAgentName(prof?.name || "Your agent");
    }
  }

  useEffect(() => {
    loadData();
    loadAgent();
  }, [user]);

  function handleUpload(id: string | number) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.png";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      const filePath = `${user.id}/${id}-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (upErr) {
        alert("Upload failed: " + upErr.message);
        return;
      }

      const { error } = await supabase
        .from("documents")
        .update({ status: "uploaded", file_path: filePath })
        .eq("id", id);

      if (!error) {
        setDocs(docs.map(d => d.id === id ? { ...d, status: "uploaded", file_path: filePath } : d));
      }
    };
    input.click();
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: editName, target_country: editCountry })
      .eq("id", user.id);
    
    setSaving(false);
    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      await refreshProfile();
      setShowProfile(false);
    }
  }

  function openProfileModal() {
    setEditName(profile?.name || "");
    setEditCountry(profile?.target_country || "");
    setShowProfile(true);
  }

  const uploaded = docs.filter((d) => d.status === "uploaded").length;
  const offers = applications.filter((a) => a.status === "Offer").length;
  const avgScore = applications.length > 0 
    ? Math.round(applications.reduce((sum, app: any) => sum + (app.match_score || 0), 0) / applications.length) 
    : 0;

  if (loading) return <div className="p-12 text-center text-gray-500">Loading your dashboard...</div>;

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 space-y-10 relative">
      <div>
        <h1 className="text-3xl font-bold">Hi {profile?.name || "there"} 👋</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {profile?.target_country ? `Targeting: ${profile.target_country}` : "Here's your study-abroad journey at a glance."}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Your account ID: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{user?.id}</code>
        </p>
      </div>

      {agentName && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-4 py-3">
          <p className="text-sm">
            🤝 You're connected with <strong>{agentName}</strong> — your recruitment agent.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Applications" value={String(applications.length)} hint={offers ? `${offers} offers` : "No offers yet"} />
        <StatCard label="Offers" value={String(offers)} hint={offers ? "Respond soon" : "Keep applying"} />
        <StatCard label="Documents" value={`${uploaded}/${docs.length}`} hint={`${docs.length - uploaded} pending`} />
        <StatCard 
          label="Avg. match score" 
          value={applications.length > 0 ? `${avgScore}%` : "—"} 
          hint={applications.length > 0 ? "Across your applications" : "Apply to a match first"} 
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your applications</h2>
          <Link to="/matches" className="text-sm text-blue-600 hover:underline">Get more matches</Link>
        </div>
        {applications.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500">No applications yet.</p>
            <Link to="/matches" className="inline-block mt-3 rounded-full bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700">
              Get your matches
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((a) => <ApplicationRow key={a.id} app={a} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {docs.map((d) => <DocumentCard key={d.id} doc={d} onUpload={handleUpload} />)}
        </div>
      </section>

      <VisaAndScholarshipSection targetCountry={profile?.target_country || ""} />

      <section className="flex flex-wrap gap-3">
        <Link to="/matches" className="rounded-full bg-blue-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-blue-700">
          Get more matches
        </Link>
        
        <button 
          onClick={openProfileModal}
          className="rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Complete profile
        </button>

        <button 
          onClick={() => window.dispatchEvent(new Event("open-arrows-chat"))}
          className="rounded-full border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition"
        >
          <Sparkles size={14} className="text-blue-600" />
          Talk to Arrows
        </button>
      </section>

      {showProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-800 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Complete Profile</h2>
            <p className="text-sm text-gray-500 mb-6">Update your details so universities can find you.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Target Country</label>
                <input 
                  type="text" 
                  placeholder="e.g. Canada, UK, Germany, Malaysia, Spain, USA, Thailand"
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowProfile(false)}
                  className="flex-1 rounded-full border border-gray-300 dark:border-gray-700 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex-1 rounded-full bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ============================================================
   Visa & Scholarship Section
   ============================================================ */
function VisaAndScholarshipSection({ targetCountry }: { targetCountry: string }) {
  const [visaSteps, setVisaSteps] = useState<any[]>([]);
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const map: Record<string, string> = {
        "united kingdom": "UK", "uk": "UK",
        "united states": "USA", "usa": "USA", "us": "USA", "united states of america": "USA",
        "canada": "Canada", "malaysia": "Malaysia",
        "thailand": "Thailand", "spain": "Spain",
      };
      const normalized = map[targetCountry.toLowerCase().trim()] || targetCountry || "Canada";

      const [visaRes, schRes] = await Promise.all([
        supabase.from("visa_requirements").select("*").eq("country", normalized).order("step_order"),
        supabase.from("scholarships").select("*").eq("country", normalized),
      ]);

      setVisaSteps(visaRes.data || []);
      setScholarships(schRes.data || []);
      setLoading(false);
    }
    load();
  }, [targetCountry]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
        <p className="text-sm text-gray-500">Loading visa & scholarships...</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="text-xl font-semibold mb-4">Visa & funding</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Visa checklist — {targetCountry || "Canada"}
          </h3>
          {visaSteps.length === 0 ? (
            <p className="text-sm text-gray-500">
              No visa data for this country yet. Update your target country or check back soon.
            </p>
          ) : (
            <ol className="space-y-3">
              {visaSteps.map((step, i) => (
                <li key={step.id} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{step.step_title}</p>
                    <p className="text-xs text-gray-500">{step.step_description}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Scholarships matched — {scholarships.length}
          </h3>
          {scholarships.length === 0 ? (
            <p className="text-sm text-gray-500">
              No scholarships found for this country yet.
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {scholarships.map((s) => (
                <div key={s.id} className="p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.university}</p>
                  <p className="text-xs mt-1"><strong>Amount:</strong> {s.amount}</p>
                  <p className="text-xs"><strong>Deadline:</strong> {s.deadline}</p>
                  {s.url && s.url !== "Not verified" && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      Learn more ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}