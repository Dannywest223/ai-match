import { Link } from "react-router-dom";
import { MapPin, Bookmark, ArrowRight, GraduationCap } from "lucide-react";

export type Match = {
  id: string | number;
  university: string;
  program: string;
  country: string;
  score: number;
  reason: string;
  intake: string;
  tuition: string;
  description?: string;
  academicReq?: string;
  minGpa?: string;
  prerequisites?: string;
  englishTest?: string;
  ielts?: string;
  toefl?: string;
  pte?: string;
  duolingo?: string;
  documents?: string;
  campus?: string;
  duration?: string;
  website?: string;
  tags?: string[];
  level?: string;
};

export function MatchCard({
  match,
  onApply,
  onSave,
}: {
  match: Match;
  onApply?: (m: Match) => void;
  onSave?: (m: Match) => void;
}) {
  const getMappedLevel = (rawLevel?: string) => {
    if (!rawLevel) return null;
    const l = rawLevel.toLowerCase();
    if (["undergraduate", "bachelor", "associate"].includes(l)) return "Undergraduate";
    if (["postgraduate", "master", "doctorate", "specialist"].includes(l)) return "Postgraduate";
    if (l === "diploma") return "Diploma";
    return rawLevel;
  };

  const displayLevel = getMappedLevel(match.level);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    return "text-orange-500";
  };
  const getScoreBg = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    return "bg-orange-500";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Success Chance Bar */}
      <div className="bg-blue-50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <div>
          <p className="text-xs font-bold text-blue-900 dark:text-blue-300 tracking-wider">SUCCESS CHANCE</p>
          <p className={`text-sm font-semibold ${getScoreColor(match.score)}`}>
            {match.score >= 85 ? "Great Match" : match.score >= 70 ? "Good Match" : "Challenging Match"}
          </p>
        </div>
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${getScoreBg(match.score)}`} style={{ width: `${match.score}%` }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 mb-1">
          {match.program}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
          {match.university}
        </p>
        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
          <MapPin size={14} /> {match.campus ? `${match.campus}, ` : ""}{match.country}
        </p>

        {displayLevel && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 w-fit">
            <GraduationCap size={12} /> {displayLevel}
          </span>
        )}

        <p className="text-xs text-gray-500 mt-2 mb-3">
          {match.duration || "N/A"} • {match.intake}
        </p>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-auto">
          <p className="text-xs text-gray-500 uppercase">Tuition</p>
          <p className="font-semibold text-gray-900 dark:text-white">{match.tuition}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <button
          onClick={() => onSave?.(match)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          aria-label="Save"
        >
          <Bookmark size={18} />
        </button>
        <Link
          to={`/program/${match.id}`}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Details
        </Link>
        <button
          onClick={() => onApply?.(match)}
          className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}