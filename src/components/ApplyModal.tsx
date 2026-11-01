"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import type { Match } from "./MatchCard";

export function ApplyModal({
  match,
  onClose,
  onSuccess,
}: {
  match: Match;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [essay, setEssay] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles((f) => [...f, ...Array.from(e.target.files!)]);
    }
  }

  async function submit() {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create application row
      const { data: app, error: appError } = await supabase
        .from("applications")
        .insert({
          student_id: user.id,
          university: match.university,
          program: match.program,
          country: match.country,
          status: "Submitted",
          next_step: "Await review",
          match_score: match.score,
        })
        .select()
        .single();

      if (appError) throw appError;

      // 2. Upload files
      for (const file of files) {
        const filePath = `${user.id}/${app.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (upErr) throw upErr;

        // 3. Save document metadata
        await supabase.from("documents").insert({
          student_id: user.id,
          application_id: app.id,
          name: file.name,
          file_path: filePath,
          status: "uploaded",
          verified: false,
        });
      }

      // 4. Save essay as a note (could be its own table later)
      if (essay) {
        await supabase.from("applications").update({
          next_step: `Essay submitted: ${essay.slice(0, 100)}...`,
        }).eq("id", app.id);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-1">Apply to {match.university}</h2>
        <p className="text-sm text-gray-500 mb-4">{match.program}</p>

        <div className="space-y-3">
          <input className={input} placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className={input} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <textarea
            className={`${input} h-24`}
            placeholder="Short essay / personal statement"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
          />

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Upload documents</label>
            <input type="file" multiple accept=".pdf,.jpg,.png" onChange={addFiles} className="text-sm" />
            <div className="mt-2 space-y-1">
              {files.map((f, i) => (
                <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                  <span>{f.name}</span>
                  <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-red-600">Remove</button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 rounded-full border py-2 text-sm">Cancel</button>
            <button
              onClick={submit}
              disabled={loading || !fullName}
              className="flex-1 rounded-full bg-blue-600 text-white py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}