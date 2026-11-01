export type Program = {
  id: string;
  name: string;
  level: string;
  seats: number;
  applications: number;
  status: "Active" | "Paused";
};

export function ProgramRow({ program }: { program: Program }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div>
        <p className="font-semibold">{program.name}</p>
        <p className="text-sm text-gray-500">{program.level} · {program.seats} seats · {program.applications} applications</p>
      </div>
      <span
        className={`text-xs font-medium px-2.5 py-1 rounded-full self-start ${
          program.status === "Active"
            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        }`}
      >
        {program.status}
      </span>
    </div>
  );
}
