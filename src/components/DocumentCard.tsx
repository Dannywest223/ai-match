import { Upload, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export type Doc = { 
  id: string | number; 
  name: string; 
  status: "uploaded" | "pending";
  file_path?: string | null;
};

export function DocumentCard({ doc, onUpload }: { doc: Doc; onUpload: (id: string | number) => void }) {
  const [opening, setOpening] = useState(false);
  const uploaded = doc.status === "uploaded";

  async function viewFile() {
    if (!doc.file_path) return;
    setOpening(true);
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 60); // valid for 60 seconds
    setOpening(false);
    if (error || !data) {
      alert("Could not open file: " + error?.message);
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        {uploaded ? (
          <CheckCircle2 className="text-green-600" size={20} />
        ) : (
          <Clock className="text-amber-500" size={20} />
        )}
        <div>
          <p className="text-sm font-medium">{doc.name}</p>
          <p className="text-xs text-gray-500 capitalize">{doc.status}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {uploaded && doc.file_path && (
          <button
            onClick={viewFile}
            disabled={opening}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
          >
            <ExternalLink size={14} />
            {opening ? "Opening..." : "View"}
          </button>
        )}
        <button
          onClick={() => onUpload(doc.id)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Upload size={14} />
          {uploaded ? "Replace" : "Upload"}
        </button>
      </div>
    </div>
  );
}