import { StatusBadge } from "./StatusBadge";

export type Applicant = {
  id: string | number; // Updated to accept numbers from Supabase
  name: string;
  program: string;
  country: string;
  status: string;
};

export function ApplicantRow({
  applicant,
  onAccept,
  onRequestDocs,
  onReject,
}: {
  applicant: Applicant;
  onAccept?: (a: Applicant) => void;
  onRequestDocs?: (a: Applicant) => void;
  onReject?: (a: Applicant) => void;
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold">
          {applicant.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold">{applicant.name}</p>
          <p className="text-sm text-gray-500">{applicant.program} · {applicant.country}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={applicant.status} />
        <button
          onClick={() => onAccept?.(applicant)}
          className="text-sm px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700"
        >
          Accept
        </button>
        <button
          onClick={() => onRequestDocs?.(applicant)}
          className="text-sm px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Request docs
        </button>
        <button
          onClick={() => onReject?.(applicant)}
          className="text-sm px-3 py-1.5 rounded-full border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
        >
          Reject
        </button>
      </div>
    </div>
  );
}