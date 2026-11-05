export type Filters = { 
  country: string; 
  budget: string; 
  intake: string;
  level: string; // NEW: Added level filter
  tags: string[];
};

const COUNTRIES = ["All", "Canada", "UK", "Germany", "Australia", "USA", "Malaysia", "Thailand", "Spain"];
const BUDGETS = ["All", "Under $20k", "$20k–$30k", "$30k+"];
const INTAKES = ["All", "Jan 2025", "Sep 2025"];
const LEVELS = ["All", "UG", "PG", "Diploma"]; // NEW: Added levels
const TAGS = [
  "Loan Available", "Fast Acceptance", "High Job Demand", "Incentivized",
  "Instant Offer", "Instant Submission", "No UK Interview", "Popular",
  "Prime", "Top"
];

export function MatchFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const Chip = ({ active, children, onClick }: any) => (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );

  function toggleTag(tag: string) {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onChange({ ...filters, tags: next });
  }

  return (
    <div className="space-y-3 mb-6">
      
      {/* NEW: Program Level Row */}
      <div className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <Chip key={l} active={filters.level === l} onClick={() => onChange({ ...filters, level: l })}>{l}</Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {COUNTRIES.map((c) => (
          <Chip key={c} active={filters.country === c} onClick={() => onChange({ ...filters, country: c })}>{c}</Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {BUDGETS.map((b) => (
          <Chip key={b} active={filters.budget === b} onClick={() => onChange({ ...filters, budget: b })}>{b}</Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {INTAKES.map((i) => (
          <Chip key={i} active={filters.intake === i} onClick={() => onChange({ ...filters, intake: i })}>{i}</Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        {TAGS.map((t) => (
          <Chip key={t} active={filters.tags.includes(t)} onClick={() => toggleTag(t)}>{t}</Chip>
        ))}
      </div>
    </div>
  );
}