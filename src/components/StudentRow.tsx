import { StatusBadge } from "./StatusBadge";

export type Student = {
  id: string | number;
  name: string;
  country: string | null;
  program: string | null;
  status: string;
  last_activity: string | null;
};

export function StudentRow({ student }: { student: Student }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">
          {student.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold">{student.name}</p>
          <p className="text-sm text-gray-500">{student.program ?? "—"} · {student.country ?? "—"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={student.status} />
        <span className="text-xs text-gray-500 hidden sm:block">{student.last_activity ?? ""}</span>
        <button className="text-sm px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
          View
        </button>
      </div>
    </div>
  );
}
