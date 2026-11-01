import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Institution = { Institution_ID: string; Institution_Name: string; Country: string };

export function AdminDataTab() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [subTab, setSubTab] = useState<"institution" | "program" | "requirement" | "fee" | "scholarship" | "visa">("institution");

  async function loadAll() {
    const [iRes, pRes] = await Promise.all([
      supabase.from("institutions").select("*"),
      supabase.from("program").select("*"),
    ]);

    const mappedInstitutions: Institution[] = (iRes.data ?? []).map((row: any) => ({
      Institution_ID: row["Institution_ID"],
      Institution_Name: row["Institution_Name"],
      Country: row["Country/Region"] || row.Country || "",
    }));

    setInstitutions(mappedInstitutions);
    setPrograms(pRes.data ?? []);
  }

  useEffect(() => { loadAll(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { key: "institution", label: "Institutions" },
          { key: "program", label: "Programs" },
          { key: "requirement", label: "Requirements" },
          { key: "fee", label: "Fees" },
          { key: "scholarship", label: "Scholarships" },
          { key: "visa", label: "Visa" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              subTab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "institution" && <InstitutionForm onSaved={loadAll} />}
      {subTab === "program" && <ProgramForm institutions={institutions} onSaved={loadAll} />}
      {subTab === "requirement" && <RequirementForm programs={programs} />}
      {subTab === "fee" && <FeeForm programs={programs} />}
      {subTab === "scholarship" && <ScholarshipForm institutions={institutions} />}
      {subTab === "visa" && <VisaForm />}
    </div>
  );
}

/* ---------------- INSTITUTION ---------------- */
function InstitutionForm({ onSaved }: { onSaved: () => void }) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("Private University");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true); setError(null);
    const { error } = await supabase.from("institutions").insert({
      "Institution_ID": id,
      "Institution_Name": name,
      "Country/Region": country,
      "City/State": city,
      "Institution_Type": type,
      "Ownership": "Private",
      "Official_Website_URL": website,
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setId(""); setName(""); setCountry(""); setCity(""); setWebsite("");
    onSaved();
  }

  const input = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-3">
      <h3 className="font-semibold text-lg">Add new institution</h3>
      <input className={input} placeholder="Institution ID (e.g. HARV_012)" value={id} onChange={(e) => setId(e.target.value)} />
      <input className={input} placeholder="Institution Name (e.g. Harvard University)" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input className={input} placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <input className={input} placeholder="City / State" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
          <option>Private University</option><option>Public University</option><option>College</option>
        </select>
        <input className={input} placeholder="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={save} disabled={saving || !id || !name} className="rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-medium disabled:opacity-50">
        {saving ? "Saving..." : "Add Institution"}
      </button>
    </div>
  );
}

/* ---------------- PROGRAM ---------------- */
function ProgramForm({ institutions, onSaved }: { institutions: Institution[]; onSaved: () => void }) {
  const [instId, setInstId] = useState("");
  const [progId, setProgId] = useState("");
  const [title, setTitle] = useState("");
  const [award, setAward] = useState("Bachelor's Degree");
  const [level, setLevel] = useState("Undergraduate");
  const [duration, setDuration] = useState("4 years");
  const [intakes, setIntakes] = useState("September");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true); setError(null);
    const { error } = await supabase.from("program").insert({
      "Institution_ID": instId,
      "Program_ID": progId,
      "Course/Program_Title": title,
      "Award/Qualification": award,
      "Course_Level": level,
      "Duration": duration,
      "Start_Months/Intakes": intakes,
      "Campus/Location": institutions.find(i => i.Institution_ID === instId)?.Country || "",
      "Short_Description_30_60_words": desc,
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setProgId(""); setTitle(""); setDesc("");
    onSaved();
  }

  const input = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-3">
      <h3 className="font-semibold text-lg">Add new program</h3>
      <select className={input} value={instId} onChange={(e) => setInstId(e.target.value)}>
        <option value="">Select Institution</option>
        {institutions.map((i) => <option key={i.Institution_ID} value={i.Institution_ID}>{i.Institution_Name}</option>)}
      </select>
      <input className={input} placeholder="Program ID (e.g. HARV_012_CS_BS_001)" value={progId} onChange={(e) => setProgId(e.target.value)} />
      <input className={input} placeholder="Course Title (e.g. Computer Science BSc)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input className={input} placeholder="Award" value={award} onChange={(e) => setAward(e.target.value)} />
        <select className={input} value={level} onChange={(e) => setLevel(e.target.value)}>
          <option>Undergraduate</option><option>Postgraduate</option><option>PhD</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className={input} placeholder="Duration" value={duration} onChange={(e) => setDuration(e.target.value)} />
        <input className={input} placeholder="Intakes" value={intakes} onChange={(e) => setIntakes(e.target.value)} />
      </div>
      <textarea className={input} placeholder="Short description" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={save} disabled={saving || !instId || !progId || !title} className="rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-medium disabled:opacity-50">
        {saving ? "Saving..." : "Add Program"}
      </button>
    </div>
  );
}

/* ---------------- REQUIREMENT ---------------- */
function RequirementForm({ programs }: { programs: any[] }) {
  const [progId, setProgId] = useState("");
  const [academic, setAcademic] = useState("");
  const [gpa, setGpa] = useState("2.5");
  const [englishTest, setEnglishTest] = useState("IELTS");
  const [ielts, setIelts] = useState("6.0");
  const [docs, setDocs] = useState("Transcripts, Passport");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function save() {
    setSaving(true); setError(null); setSuccess(false);
    const { error } = await supabase.from("requirements").insert({
      "Program_ID": progId,
      "Academic_Requirement_Summary": academic,
      "Minimum_GPA/Grade": gpa,
      "Subject_Prerequisites": "",
      "English_Test_Accepted": englishTest,
      "IELTS_Minimum": parseFloat(ielts) || 0,
      "TOEFL_iBT_Minimum": 0,
      "PTE_Minimum": 0,
      "Duolingo_Minimum": 0,
      "Documents_Required": docs,
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setSuccess(true); setAcademic(""); setProgId("");
  }

  const input = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-3">
      <h3 className="font-semibold text-lg">Add requirement</h3>
      <select className={input} value={progId} onChange={(e) => setProgId(e.target.value)}>
        <option value="">Select Program</option>
        {programs.map((p) => <option key={p.Program_ID} value={p.Program_ID}>{p["Course/Program_Title"]} ({p.Program_ID})</option>)}
      </select>
      <textarea className={input} placeholder="Academic requirement summary" value={academic} onChange={(e) => setAcademic(e.target.value)} rows={2} />
      <div className="grid grid-cols-3 gap-3">
        <input className={input} placeholder="Min GPA" value={gpa} onChange={(e) => setGpa(e.target.value)} />
        <input className={input} placeholder="English test" value={englishTest} onChange={(e) => setEnglishTest(e.target.value)} />
        <input className={input} placeholder="IELTS min" value={ielts} onChange={(e) => setIelts(e.target.value)} />
      </div>
      <textarea className={input} placeholder="Required documents" value={docs} onChange={(e) => setDocs(e.target.value)} rows={2} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Requirement saved ✓</p>}
      <button onClick={save} disabled={saving || !progId || !academic} className="rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-medium disabled:opacity-50">
        {saving ? "Saving..." : "Add Requirement"}
      </button>
    </div>
  );
}

/* ---------------- FEE ---------------- */
function FeeForm({ programs }: { programs: any[] }) {
  const [progId, setProgId] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true); setError(null);
    const { error } = await supabase.from("fees").insert({
      "Program_ID": progId,
      "Tuition_Fee_Amount": parseFloat(amount) || 0,
      "Currency": currency,
      "Fee_Basis": "Annual tuition",
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setProgId(""); setAmount("");
  }

  const input = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-3">
      <h3 className="font-semibold text-lg">Add fee</h3>
      <select className={input} value={progId} onChange={(e) => setProgId(e.target.value)}>
        <option value="">Select Program</option>
        {programs.map((p) => <option key={p.Program_ID} value={p.Program_ID}>{p["Course/Program_Title"]} ({p.Program_ID})</option>)}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input className={input} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <select className={input} value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option>USD</option><option>GBP</option><option>EUR</option><option>MYR</option><option>THB</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={save} disabled={saving || !progId || !amount} className="rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-medium disabled:opacity-50">
        {saving ? "Saving..." : "Add Fee"}
      </button>
    </div>
  );
}

/* ---------------- SCHOLARSHIP ---------------- */
function ScholarshipForm({ institutions }: { institutions: Institution[] }) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [uni, setUni] = useState("");
  const [amount, setAmount] = useState("");
  const [elig, setElig] = useState("");
  const [deadline, setDeadline] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true); setError(null);
    const { error } = await supabase.from("scholarships").insert({
      name, country, university: uni, amount, eligibility: elig, deadline, url,
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setName(""); setUni(""); setAmount(""); setElig(""); setDeadline(""); setUrl("");
  }

  const input = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-3">
      <h3 className="font-semibold text-lg">Add scholarship</h3>
      <input className={input} placeholder="Scholarship name" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <input className={input} placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <select className={input} value={uni} onChange={(e) => setUni(e.target.value)}>
          <option value="">Select University</option>
          {institutions.map((i) => <option key={i.Institution_ID} value={i.Institution_Name}>{i.Institution_Name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className={input} placeholder="Amount (e.g. £2,000)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input className={input} placeholder="Deadline (e.g. 31 May 2025)" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>
      <textarea className={input} placeholder="Eligibility" value={elig} onChange={(e) => setElig(e.target.value)} rows={2} />
      <input className={input} placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button onClick={save} disabled={saving || !name || !uni || !amount} className="rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-medium disabled:opacity-50">
        {saving ? "Saving..." : "Add Scholarship"}
      </button>
    </div>
  );
}

/* ---------------- VISA (NEW) ---------------- */
function VisaForm() {
  const [country, setCountry] = useState("");
  const [stepOrder, setStepOrder] = useState("1");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  async function save() {
    setSaving(true); setError(null); setSuccess(false);
    const { error } = await supabase.from("visa_requirements").insert({
      country,
      step_order: parseInt(stepOrder) || 1,
      step_title: title,
      step_description: description,
    });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
    setCountry(""); setStepOrder("1"); setTitle(""); setDescription("");
  }

  const input = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 space-y-3">
      <h3 className="font-semibold text-lg">Add visa requirement</h3>
      <p className="text-xs text-gray-500">
        Each row is one step in the visa process. Add all steps for a country by saving them one by one.
      </p>
      <input className={input} placeholder="Country (e.g. Canada, UK, USA, Spain)" value={country} onChange={(e) => setCountry(e.target.value)} />
      <div className="grid grid-cols-3 gap-3">
        <input className={input} type="number" placeholder="Step number" value={stepOrder} onChange={(e) => setStepOrder(e.target.value)} />
        <input className={`${input} col-span-2`} placeholder="Step title (e.g. Apply for Study Permit)" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <textarea className={input} placeholder="Step description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Visa step saved ✓</p>}
      <button onClick={save} disabled={saving || !country || !title} className="rounded-full bg-blue-600 text-white px-6 py-2 text-sm font-medium disabled:opacity-50">
        {saving ? "Saving..." : "Add Visa Step"}
      </button>
    </div>
  );
}