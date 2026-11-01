import { useState } from "react";

export type Profile = { grades: string; budget: string; country: string; course: string };

export function IntakeForm({
  onSubmit,
  loading,
  countries,
  courses,
}: {
  onSubmit: (p: Profile) => void;
  loading: boolean;
  countries: string[];
  courses: string[];
}) {
  const [form, setForm] = useState<Profile>({ grades: "", budget: "", country: "", course: "" });
  
  const inputClass = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer";

  // A reusable dropdown icon
  const Chevron = () => (
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </div>
  );

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="grid gap-4 md:grid-cols-2 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
    >
      {/* 1. GRADES DROPDOWN */}
      <div className="relative">
        <select 
          className={inputClass} 
          value={form.grades} 
          onChange={(e) => setForm({ ...form, grades: e.target.value })}
        >
          <option value="">Any Grades</option>
          <option value="4.0">4.0 GPA (A)</option>
          <option value="3.5">3.5 GPA (B+)</option>
          <option value="3.0">3.0 GPA (B)</option>
          <option value="2.5">2.5 GPA (C+)</option>
          <option value="2.0">2.0 GPA (C)</option>
          <option value="1.5">1.5 GPA (D)</option>
        </select>
        <Chevron />
      </div>

      {/* 2. BUDGET DROPDOWN */}
      <div className="relative">
        <select 
          className={inputClass} 
          value={form.budget} 
          onChange={(e) => setForm({ ...form, budget: e.target.value })}
        >
          <option value="">Any Budget</option>
          <option value="Under $15,000">Under $15,000</option>
          <option value="$15,000 - $25,000">$15,000 - $25,000</option>
          <option value="$25,000 - $35,000">$25,000 - $35,000</option>
          <option value="$35,000+">$35,000+</option>
        </select>
        <Chevron />
      </div>

      {/* 3. COUNTRY DROPDOWN (Dynamic from Database) */}
      <div className="relative">
        <select 
          className={inputClass} 
          value={form.country} 
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        >
          <option value="">Any Country</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Chevron />
      </div>

      {/* 4. COURSE DROPDOWN (Dynamic from Database) */}
      <div className="relative">
        <select 
          className={inputClass} 
          value={form.course} 
          onChange={(e) => setForm({ ...form, course: e.target.value })}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Chevron />
      </div>

      <button disabled={loading} className="md:col-span-2 rounded-full bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 disabled:opacity-50 transition">
        {loading ? "Analyzing Matches..." : "Get Your Matches"}
      </button>
    </form>
  );
}