import { useEffect, useMemo, useState } from "react";
import { IntakeForm, type Profile } from "../components/IntakeForm";
import { MatchCard, type Match } from "../components/MatchCard";
import { MatchFilters, type Filters } from "../components/MatchFilters";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { ApplyModal } from "../components/ApplyModal";

function getNumericFee(tuitionStr: string) {
  const num = parseInt(tuitionStr.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 999999 : num;
}

const normalize = (val: any) => String(val || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

export function Matches() {
  const { user } = useAuth();
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [allInstitutions, setAllInstitutions] = useState<any[]>([]);
  const [allRequirements, setAllRequirements] = useState<any[]>([]);
  const [allFees, setAllFees] = useState<any[]>([]);
  
  const [countriesList, setCountriesList] = useState<string[]>([]);
  const [coursesList, setCoursesList] = useState<string[]>([]);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ country: "All", budget: "All", intake: "All", tags: [] });
  const [saved, setSaved] = useState<Set<string | number>>(new Set());
  const [applied, setApplied] = useState<Set<string | number>>(new Set());
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    async function fetchInitialData() {
      const [progRes, instRes, reqRes, feeRes] = await Promise.all([
        supabase.from("program").select("*").limit(2000),
        supabase.from("institutions").select("*"),
        supabase.from("requirements").select("*").limit(2000),
        supabase.from("fees").select("*").limit(2000)
      ]);

      if (progRes.error) { setError(progRes.error.message); setLoading(false); return; }

      const progs = progRes.data || [];
      const insts = instRes.data || [];
      const reqs = reqRes.data || [];
      const fees = feeRes.data || [];
      
      setAllPrograms(progs);
      setAllInstitutions(insts);
      setAllRequirements(reqs);
      setAllFees(fees);

      const uniqueCountries = Array.from(new Set(insts.map(i => i["Country/Region"]).filter(Boolean))).sort() as string[];
      setCountriesList(uniqueCountries);

      const uniqueCourses = Array.from(new Set(progs.map(p => p["Course/Program_Title"]).filter(Boolean))).sort() as string[];
      setCoursesList(uniqueCourses);

      setLoading(false);
    }
    fetchInitialData();
  }, []);

  async function handleSubmit(profile: Profile) {
    setLoading(true);
    setError(null);

    try {
      const searchProgram = profile.course.toLowerCase().trim();
      const searchCountry = profile.country.toLowerCase().trim();
      const studentGPA = parseFloat(profile.grades) || 0;

      const scoreProgram = (prog: any) => {
        const progId = normalize(prog["Program_ID"]);
        const instId = normalize(prog["Institution_ID"]);

        const inst = allInstitutions.find(i => normalize(i["Institution_ID"]) === instId);
        
        const req = allRequirements.find(r => normalize(r["Program_ID"]) === progId);
        const fee = allFees.find(f => normalize(f["Program_ID"]) === progId);
        
        const academicReq = req ? (req["Academic_Requirement_Summary"] || "Contact university") : "Contact university";
        const minGpa = req ? (req["Minimum_GPA/Grade"] || "") : "";
        const prereqs = req ? (req["Subject_Prerequisites"] || "") : "";
        const englishTest = req ? (req["English_Test_Accepted"] || "IELTS / TOEFL") : "IELTS / TOEFL";
        const ielts = req ? (req["IELTS_Minimum"] || "") : "";
        const toefl = req ? (req["TOEFL_iBT_Minimum"] || "") : "";
        const pte = req ? (req["PTE_Minimum"] || "") : "";
        const duolingo = req ? (req["Duolingo_Minimum"] || "") : "";
        const documents = req ? (req["Documents_Required"] || "Transcripts, Passport") : "Transcripts, Passport";

        const realFee = fee ? parseInt(fee["Tuition_Fee_Amount"], 10) : 0;
        const currency = fee ? (fee["Currency"] || "$") : "$";
        const feeString = realFee > 0 ? `${currency}${realFee.toLocaleString()}/yr` : "N/A";

        let score = 75; 
        let reasons = [];

        if (studentGPA > 0 && minGpa) {
          const reqGradeMatch = String(minGpa).match(/\d+(\.\d+)?/);
          const reqGrade = reqGradeMatch ? parseFloat(reqGradeMatch[0]) : 0;
          const isPercentage = String(minGpa).includes("%");
          const studentGradeToCompare = isPercentage ? (studentGPA * 25) : studentGPA;

          if (studentGradeToCompare >= reqGrade) {
            score += 15;
            reasons.push(`Your grades meet the ${minGpa} requirement.`);
          } else {
            score -= 50;
          }
        }

        if (profile.budget && fee) {
          if (profile.budget === "Under $15,000" && realFee <= 15000) score += 10;
          else if (profile.budget === "$15,000 - $25,000" && realFee > 15000 && realFee <= 25000) score += 10;
          else if (profile.budget === "$25,000 - $35,000" && realFee > 25000 && realFee <= 35000) score += 10;
          else if (profile.budget === "$35,000+" && realFee > 35000) score += 10;
          else score -= 50;
        }

        // Build tag list from program flags
        const tags: string[] = [];
        if (prog["loan_available"]) tags.push("Loan Available");
        if (prog["fast_acceptance"]) tags.push("Fast Acceptance");
        if (prog["high_job_demand"]) tags.push("High Job Demand");
        if (prog["incentivized"]) tags.push("Incentivized");
        if (prog["instant_offer"]) tags.push("Instant Offer");
        if (prog["instant_submission"]) tags.push("Instant Submission");
        if (prog["no_uk_interview"]) tags.push("No UK Interview");
        if (prog["popular"]) tags.push("Popular");
        if (prog["prime"]) tags.push("Prime");
        if (prog["top"]) tags.push("Top");

        return {
          id: prog.id || prog["Program_ID"] || Math.random().toString(),
          university: inst ? inst["Institution_Name"] : "Partner University",
          program: prog["Course/Program_Title"] || "Degree Program",
          country: inst ? inst["Country/Region"] : "International",
          score: Math.min(score, 99),
          reason: reasons.join(" ") || "This program aligns with your preferences.",
          intake: prog["Start_Months/Intakes"] || "Sep 2025",
          tuition: feeString,
          description: prog["Short_Description_30_60_words"] || "",
          campus: prog["Campus/Location"] || "",
          duration: prog["Duration"] || "",
          website: inst ? inst["Official_Website_URL"] : "",
          academicReq: academicReq,
          minGpa: minGpa,
          prerequisites: prereqs,
          englishTest: englishTest,
          ielts: ielts,
          toefl: toefl,
          pte: pte,
          duolingo: duolingo,
          documents: documents,
          tags: tags,
        };
      };

      let filtered = allPrograms;
      if (searchProgram) {
        filtered = filtered.filter(p => (p["Course/Program_Title"] || "").toLowerCase().includes(searchProgram));
      }
      if (searchCountry) {
        filtered = filtered.filter(p => {
          const inst = allInstitutions.find(i => normalize(i["Institution_ID"]) === normalize(p["Institution_ID"]));
          return inst && (inst["Country/Region"] || "").toLowerCase().includes(searchCountry);
        });
      }

      let formatted = filtered.map(scoreProgram).filter(p => p.score > 0);

      if (formatted.length === 0) {
        let fallback = allPrograms;
        if (searchProgram) {
          fallback = fallback.filter(p => (p["Course/Program_Title"] || "").toLowerCase().includes(searchProgram));
        }
        if (fallback.length === 0) {
          fallback = allPrograms.slice(0, 10);
        }

        const fallbackFormatted = fallback.map(scoreProgram).sort((a, b) => b.score - a.score).slice(0, 5);
        setError(`We couldn't find an exact match for your strict criteria. However, here are some similar top programs.`);
        setMatches(fallbackFormatted);
      } else {
        const sorted = formatted.sort((a, b) => b.score - a.score);
        setMatches(sorted);
      }

    } catch (err: any) {
      setError("Something went wrong while fetching matches.");
    } finally {
      setLoading(false);
    }
  }

  async function applyMatch(m: Match) {
    if (!user) { alert("Please log in first."); return; }
    setSelectedMatch(m);
  }

  const finalFiltered = useMemo(() => {
    return matches.filter((m) => {
      if (filters.country !== "All" && m.country !== filters.country) return false;
      if (filters.intake !== "All" && m.intake !== filters.intake) return false;
      if (filters.budget !== "All") {
        const fee = getNumericFee(m.tuition);
        if (filters.budget === "Under $20k" && fee >= 20000) return false;
        if (filters.budget === "$20k–$30k" && (fee < 20000 || fee > 30000)) return false;
        if (filters.budget === "$30k+" && fee <= 30000) return false;
      }
      // Tag filter: every selected tag must be present on the program
      if (filters.tags.length > 0) {
        if (!m.tags) return false;
        for (const t of filters.tags) {
          if (!m.tags.includes(t)) return false;
        }
      }
      return true;
    });
  }, [matches, filters]);

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Get your matches</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Browse all available programs or search for your dream course.</p>

      <IntakeForm onSubmit={handleSubmit} loading={loading} countries={countriesList} courses={coursesList} />

      {error && <p className="mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">{error}</p>}

      {loading && <p className="text-center py-10 text-gray-500">Analyzing 350+ programs...</p>}

      {!loading && matches.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your matches ({finalFiltered.length})</h2>
          </div>

          <MatchFilters filters={filters} onChange={setFilters} />

          {finalFiltered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No matches for these filters. Try widening them.</div>
          ) : (
            <div className="space-y-4">
              {finalFiltered.map((m) => (
                <div key={m.id}>
                  <MatchCard match={m} onApply={applyMatch} onSave={(mm) => setSaved((s) => new Set(s).add(mm.id))} />
                  <div className="flex gap-3 mt-1 pl-1">
                    {saved.has(m.id) && <p className="text-xs text-green-600">Saved ✓</p>}
                    {applied.has(m.id) && <p className="text-xs text-blue-600">Application started ✓</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedMatch && (
        <ApplyModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSuccess={() => {
            setApplied((s) => new Set(s).add(selectedMatch.id));
            setSelectedMatch(null);
          }}
        />
      )}
    </main>
  );
}