import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Bar = { label: string; value: number };

export function PerformanceCard({ universityName }: { universityName: string }) {
  const [data, setData] = useState<Bar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Query all applications for this university (by name)
      const { data: apps } = await supabase
        .from("applications")
        .select("country")
        .eq("university", universityName);

      if (!apps || apps.length === 0) {
        setData([]);
        setLoading(false);
        return;
      }

      // Group by country
      const counts: Record<string, number> = {};
      apps.forEach((a) => {
        const c = a.country || "Unknown";
        counts[c] = (counts[c] || 0) + 1;
      });

      const bars: Bar[] = Object.entries(counts)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      setData(bars);
      setLoading(false);
    }
    load();
  }, [universityName]);

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="text-xl font-semibold mb-4">Applications by country</h2>

      {loading ? (
        <p className="text-sm text-gray-500">Loading analytics...</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">No applications yet. Analytics will appear once students start applying.</p>
      ) : (
        <div className="space-y-3">
          {data.map((d) => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-sm w-24 text-gray-500">{d.label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${(d.value / max) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium w-8 text-right">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}