import { StatusBadge } from "./StatusBadge";

export type Application = {
  id: string | number;
  university: string;
  program: string;
  country: string;
  status: string;
  next_step: string | null;
  match_score?: number;
};

export function ApplicationRow({ app }: { app: Application }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div>
        <p className="font-semibold">{app.university}</p>
        <p className="text-sm text-gray-500">{app.program} · {app.country}</p>
        <p className="text-xs text-gray-500 mt-1">Next: {app.next_step ?? "—"}</p>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={app.status} />
        <button className="text-sm px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
          View
        </button>
      </div>
    </div>
  );
}