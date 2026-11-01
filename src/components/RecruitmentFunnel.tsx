import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Funnel = { applied: number; reviewed: number; offers: number; rejected: number };

export function RecruitmentFunnel({ universityName }: { universityName: string }) {
  const [funnel, setFunnel] = useState<Funnel>({ applied: 0, reviewed: 0, offers: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: apps } = await supabase
        .from("applications")
        .select("status")
        .eq("university", universityName);

      if (!apps) { setLoading(false); return; }

      const f: Funnel = { applied: 0, reviewed: 0, offers: 0, rejected: 0 };
      apps.forEach((a) => {
        const s = (a.status || "").toLowerCase();
        if (s === "draft" || s === "submitted") f.applied++;
        else if (s === "under review") f.reviewed++;
        else if (s === "offer") f.offers++;
        else if (s === "rejected") f.rejected++;
      });
      setFunnel(f);
      setLoading(false);
    }
    load();
  }, [universityName]);

  if (loading) return <p className="text-sm text-gray-500">Loading funnel...</p>;

  const stages = [
    { label: "Applied", value: funnel.applied, color: "bg-blue-500" },
    { label: "Under Review", value: funnel.reviewed, color: "bg-amber-500" },
    { label: "Offers", value: funnel.offers, color: "bg-green-500" },
    { label: "Rejected", value: funnel.rejected, color: "bg-red-500" },
  ];
  const total = stages.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="text-xl font-semibold mb-4">Recruitment funnel</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((s) => (
          <div key={s.label} className="p-3 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.value / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}