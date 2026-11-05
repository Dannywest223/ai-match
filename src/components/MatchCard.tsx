import { ScoreRing } from "./ScoreRing";
import { MapPin, Clock, FileText, CheckCircle2, DollarSign, Calendar, BookOpen, GraduationCap } from "lucide-react";

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
  level?: string; // NEW: Added level to the type
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
  
  // Helper to map the raw DB level to the clean UG/PG/Diploma format
  const getMappedLevel = (rawLevel?: string) => {
    if (!rawLevel) return null;
    const l = rawLevel.toLowerCase();
    if (["undergraduate", "bachelor", "associate"].includes(l)) return "Undergraduate";
    if (["postgraduate", "master", "doctorate", "specialist"].includes(l)) return "Postgraduate";
    if (l === "diploma") return "Diploma";
    return rawLevel; // Fallback to original string
  };

  const displayLevel = getMappedLevel(match.level);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-5">
        <ScoreRing score={match.score} />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">
            {match.university}
          </h3>
          <p className="text-blue-600 dark:text-blue-400 font-medium mt-1 text-lg">
            {match.program}
          </p>

          {/* NEW: Course Level Badge */}
          {displayLevel && (
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                <GraduationCap size={14} className="shrink-0" />
                {displayLevel}
              </span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><MapPin size={16} /> {match.campus || match.country}</span>
            <span className="flex items-center gap-1.5"><Clock size={16} /> {match.duration || "N/A"}</span>
            <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-200"><DollarSign size={16} /> {match.tuition}</span>
            <span className="flex items-center gap-1.5 font-medium text-green-600 dark:text-green-400"><Calendar size={16} /> {match.intake}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {match.tags && match.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {match.tags.map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {match.description && (
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {match.description}
          </p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-950 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-2.5 md:col-span-2">
          <GraduationCap size={18} className="text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Academic Requirement</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{match.academicReq}</p>
            {match.minGpa && <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">Minimum Grade: {match.minGpa}</p>}
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <BookOpen size={18} className="text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">English Tests Accepted</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">{match.englishTest}</p>
            <div className="flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300 mt-1">
              {match.ielts && <span>IELTS: {match.ielts}</span>}
              {match.toefl && <span>TOEFL: {match.toefl}</span>}
              {match.pte && <span>PTE: {match.pte}</span>}
              {match.duolingo && <span>Duolingo: {match.duolingo}</span>}
            </div>
          </div>
        </div>

        {match.prerequisites && match.prerequisites !== "None" && match.prerequisites !== "N/A" && (
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-gray-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prerequisites</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{match.prerequisites}</p>
            </div>
          </div>
        )}

        {match.documents && match.documents !== "N/A" && (
          <div className="flex items-start gap-2.5 md:col-span-2 pt-3 border-t border-gray-200 dark:border-gray-800">
            <FileText size={18} className="text-gray-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Required Documents</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{match.documents}</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2.5 md:col-span-2 pt-3 border-t border-gray-200 dark:border-gray-800">
          <CheckCircle2 size={18} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong className="text-blue-900 dark:text-blue-100 block mb-0.5">Why this match</strong> 
            {match.reason || "This program aligns with your preferences."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button
          onClick={() => onApply?.(match)}
          className="rounded-full bg-blue-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-blue-700 transition"
        >
          Apply Now
        </button>
        <button
          onClick={() => onSave?.(match)}
          className="rounded-full border border-gray-300 dark:border-gray-700 px-6 py-2.5 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
}