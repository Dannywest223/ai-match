import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  ArrowLeft, Heart, Building2, FileText, DollarSign, Calendar, 
  MapPin, CheckCircle2, Award, ArrowRight, ExternalLink, Globe, GraduationCap
} from "lucide-react";

const normalize = (val: any) => String(val || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

const uniImages: Record<string, { hero: string | null, side1: string | null, side2: string | null }> = {
  "Campbellsville University": {
    hero: "https://commons.wikimedia.org/wiki/Special:FilePath/Campbellsville%20Universtiy%20Campus.jpg?width=1200",
    side1: "https://commons.wikimedia.org/wiki/Special:FilePath/Administration%20Building%2C%20Campbellsville%20University.jpg?width=600",
    side2: "https://commons.wikimedia.org/wiki/Special:FilePath/CU%20School%20of%20Chiropractic.jpg?width=600"
  },
  "Coventry University": {
    hero: "https://commons.wikimedia.org/wiki/Special:FilePath/Coventry%20University.JPG?width=1200",
    side1: "https://commons.wikimedia.org/wiki/Special:FilePath/Coventry%20University%20Library%20-%20geograph.org.uk%20-%207120782.jpg?width=600",
    side2: "https://commons.wikimedia.org/wiki/Special:FilePath/Edible%20Garden%20Coventry%20University.jpg?width=600"
  },
  "INTI International University": {
    hero: "https://commons.wikimedia.org/wiki/Special:FilePath/INTI%20Nilai%20bridge.png?width=1200",
    side1: "https://commons.wikimedia.org/wiki/Special:FilePath/INTI%20Nilai%20Student%20Centre.png?width=600",
    side2: "https://commons.wikimedia.org/wiki/Special:FilePath/Cmglee%20Inti%20College%20Penang.jpg?width=600"
  },
  "La Salle Campus Barcelona - Ramon Llull University": {
    hero: "https://commons.wikimedia.org/wiki/Special:FilePath/053%20La%20Salle%2C%20Universitat%20Ramon%20Llull%2C%20c.%20Llu%C3%A7an%C3%A8s%2043-49%20%28Barcelona%29.jpg?width=1200",
    side1: "https://commons.wikimedia.org/wiki/Special:FilePath/Edificillu%C3%A7anes.jpg?width=600",
    side2: "https://commons.wikimedia.org/wiki/Special:FilePath/Roc%C3%B2drom%20del%20campus.jpg?width=600"
  },
  "LaSalle College Vancouver": { hero: null, side1: null, side2: null },
  "Shinawatra University": {
    hero: "https://commons.wikimedia.org/wiki/Special:FilePath/SIU%20campus.jpg?width=1200",
    side1: "https://commons.wikimedia.org/wiki/Special:FilePath/Shinawatra%20University%20%28SIU%29%20out-door%20skylink.jpg?width=600",
    side2: "https://commons.wikimedia.org/wiki/Special:FilePath/Shinawatra%20Library.jpg?width=600"
  },
  "Universiti Teknikal Malaysia Melaka": {
    hero: "https://commons.wikimedia.org/wiki/Special:FilePath/Malaysia%20Melaka%20Technical%20University%20technology%20campus.jpg?width=1200",
    side1: "https://commons.wikimedia.org/wiki/Special:FilePath/UTeM%20Technology%20Campus.jpg?width=600",
    side2: "https://commons.wikimedia.org/wiki/Special:FilePath/UTeM%20Main%20Campus%20.jpg?width=600"
  },
  "Universiti Teknologi Malaysia": {
    hero: "https://commons.wikimedia.org/wiki/Special:FilePath/Universiti%20Teknologi%20Malaysia.jpg?width=1200",
    side1: "https://commons.wikimedia.org/wiki/Special:FilePath/Universiti%20Teknologi%20Malaysia%20%28Entrance%29.jpg?width=600",
    side2: "https://commons.wikimedia.org/wiki/Special:FilePath/Kuala%20Lumpur%20Malaysia%20UTM-Campus-Kuala-Lumpur-01.jpg?width=600"
  }
};

export function ProgramDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [scholarships, setScholarships] = useState<any[]>([]);
  const [similarPrograms, setSimilarPrograms] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDetails() {
      const [progRes, instRes, reqRes, feeRes] = await Promise.all([
        supabase.from("program").select("*").limit(2000),
        supabase.from("institutions").select("*"),
        supabase.from("requirements").select("*").limit(2000),
        supabase.from("fees").select("*").limit(2000),
      ]);

      const prog = (progRes.data || []).find(
        (p) => String(p.id ?? p["Program_ID"]) === String(id)
      );
      if (!prog) { setLoading(false); return; }

      const inst = (instRes.data || []).find(
        (i) => normalize(i["Institution_ID"]) === normalize(prog["Institution_ID"])
      );
      const req = (reqRes.data || []).find(
        (r) => normalize(r["Program_ID"]) === normalize(prog["Program_ID"])
      );
      const fee = (feeRes.data || []).find(
        (f) => normalize(f["Program_ID"]) === normalize(prog["Program_ID"])
      );

      if (inst?.["Institution_Name"]) {
        const { data: scholData } = await supabase
          .from("scholarships")
          .select("*")
          .ilike("institution_name", `%${inst["Institution_Name"]}%`);
        
        if (scholData) setScholarships(scholData);
      }

      const sameUniPrograms = (progRes.data || []).filter(
        p => normalize(p["Institution_ID"]) === normalize(prog["Institution_ID"]) && 
             String(p.id ?? p["Program_ID"]) !== String(id)
      ).slice(0, 4);
      setSimilarPrograms(sameUniPrograms);

      setData({ prog, inst, req, fee });
      setLoading(false);
    }
    fetchDetails();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading details...</div>;
  if (!data) return <div className="p-10 text-center text-gray-500">Program not found.</div>;

  const { prog, inst, req, fee } = data;
  
  const tuition = fee
    ? `${fee["Currency"] || "$"}${Number(fee["Tuition_Fee_Amount"] || 0).toLocaleString()}/yr`
    : "N/A";
  
  const universityName = inst?.["Institution_Name"] || "Partner University";
  const country = inst?.["Country/Region"] || "International";
  const city = inst?.["City/State"] || "";

  const dbImages = uniImages[universityName];
  const fallbackImages = {
    hero: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200",
    side1: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600",
    side2: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=600"
  };

  const images = {
    hero: dbImages?.hero || fallbackImages.hero,
    side1: dbImages?.side1 || fallbackImages.side1,
    side2: dbImages?.side2 || fallbackImages.side2,
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col min-h-screen">
      
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 font-medium transition-colors w-fit shrink-0">
        <ArrowLeft size={18} /> Back to Search
      </button>

      {/* Image Gallery */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 shrink-0">
        <div className="md:col-span-2 relative rounded-2xl overflow-hidden h-[300px] md:h-[400px] group">
          <img src={images.hero} alt={universityName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = fallbackImages.hero; }} />
          <button className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-blue-700 transition z-10">
            View Photos
          </button>
        </div>
        <div className="hidden md:flex flex-col gap-3 h-[400px]">
          <div className="h-1/2 rounded-2xl overflow-hidden">
            <img src={images.side1} alt="Campus 2" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = fallbackImages.side1; }} />
          </div>
          <div className="h-1/2 rounded-2xl overflow-hidden">
            <img src={images.side2} alt="Campus 3" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = fallbackImages.side2; }} />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="w-full block shrink-0 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">{prog["Course/Program_Title"]}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-2"><Building2 size={20} /> {universityName}</span>
          <span className="text-gray-400 hidden sm:block">•</span>
          <span className="flex items-center gap-2"><MapPin size={20} /> {city ? `${city}, ` : ""}{country}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="w-full block shrink-0 border-b border-gray-200 dark:border-gray-800 mb-8">
        <div className="flex gap-8">
          {["Overview", "Admission Requirements", "Scholarships", "Similar Programs"].map((tab) => {
            const isActive = activeTab === tab.toLowerCase().replace(" ", "-");
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
                className={`pb-4 text-lg font-medium border-b-[3px] transition-colors whitespace-nowrap ${
                  isActive ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="w-full block shrink-0 bg-blue-50/50 dark:bg-gray-900/50 p-6 md:p-8 rounded-3xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <div className="p-2 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg">
                <Building2 size={28} />
              </div>
              Program Summary
            </h2>
            <div className="flex gap-3">
              <button className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition">Apply Now</button>
              <button className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"><Heart size={20} /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {prog["Short_Description_30_60_words"] || `The ${prog["Course/Program_Title"]} program at ${universityName} emphasizes the ability of developing and adapting critical skills for real-world applications.`}
              </p>
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Intakes</p>
                  <p className="text-gray-900 dark:text-white font-medium">{prog["Start_Months/Intakes"] || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Campus</p>
                  <p className="text-gray-900 dark:text-white font-medium">{prog["Campus/Location"] || "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
                <FileText className="text-gray-400 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">{prog["Course_Level"] || "Bachelor's Degree"}</p>
                  <p className="text-gray-500 text-sm">Program Level</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
                <Calendar className="text-gray-400 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">{prog["Duration"] || "N/A"}</p>
                  <p className="text-gray-500 text-sm">Duration</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
                <DollarSign className="text-gray-400 mt-1" size={24} />
                <div>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">{tuition}</p>
                  <p className="text-gray-500 text-sm">Tuition Fee</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admission Requirements Tab */}
      {activeTab === "admission-requirements" && (
        <div className="w-full block shrink-0 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Admission Requirements</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Academic Requirement</h3>
                <p className="text-gray-600 dark:text-gray-400">{req?.["Academic_Requirement_Summary"] || "Contact university for details."}</p>
                {req?.["Minimum_GPA/Grade"] && <p className="text-sm mt-1 text-gray-500">Minimum Grade: {req["Minimum_GPA/Grade"]}</p>}
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">English Language Requirements</h3>
                <p className="text-gray-600 dark:text-gray-400">Accepted Tests: {req?.["English_Test_Accepted"] || "IELTS / TOEFL"}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  {req?.["IELTS_Minimum"] && <span>IELTS: {req["IELTS_Minimum"]}</span>}
                  {req?.["TOEFL_iBT_Minimum"] && <span>TOEFL: {req["TOEFL_iBT_Minimum"]}</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="text-green-500 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Required Documents</h3>
                <p className="text-gray-600 dark:text-gray-400">{req?.["Documents_Required"] || "Transcripts, Passport, CV"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scholarships Tab (Detailed Layout) */}
      {activeTab === "scholarships" && (
        <div className="w-full block shrink-0 space-y-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="text-yellow-500" /> Available Scholarships
          </h2>
          
          {scholarships.length > 0 ? (
            scholarships.map((s) => (
              <div key={s.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{s.scholarship_name}</h3>
                    <p className="text-gray-500 flex items-center gap-2"><Building2 size={16} /> {s.institution_name}</p>
                  </div>
                  {s.auto_applied && (
                    <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-2 border border-green-200">
                      <CheckCircle2 size={16} /> Auto Applied
                    </span>
                  )}
                </div>

                {/* Grid Facts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Amount</p>
                    <p className="font-semibold text-green-600 text-lg">{s.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Deadline</p>
                    <p className="font-medium text-gray-900 dark:text-white">{s.deadline}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                    <p className="font-medium text-gray-900 dark:text-white">{s.last_updated || "N/A"}</p>
                  </div>
                </div>

                {/* Rich Text Sections */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Overview</h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{s.description}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Eligibility Criteria</h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{s.eligibility}</p>
                  </div>

                  {s.renewal_requirements && (
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Renewal Requirements</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{s.renewal_requirements}</p>
                    </div>
                  )}

                  {s.application_process && (
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Application Process</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{s.application_process}</p>
                    </div>
                  )}
                </div>

                {/* Footer Tags */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <Globe className="text-blue-500 mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Eligible Nationalities</p>
                      <p className="text-sm text-gray-500">{s.eligible_nationalities || "All nationalities"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <GraduationCap className="text-purple-500 mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Eligible Program Levels</p>
                      <p className="text-sm text-gray-500">{s.eligible_levels || "All program levels"}</p>
                    </div>
                  </div>
                </div>

                {/* Source Link */}
                {s.source_url && (
                  <div className="mt-6">
                    <a 
                      href={s.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Official Source <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center">
              <Award className="text-gray-300 mx-auto mb-4" size={48} />
              <p className="text-gray-500 text-lg">No specific scholarships listed for this university yet. Check back soon!</p>
            </div>
          )}
        </div>
      )}

      {/* Similar Programs Tab */}
      {activeTab === "similar-programs" && (
        <div className="w-full block shrink-0">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Other programs at {universityName}</h2>
          {similarPrograms.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {similarPrograms.map((p) => (
                <Link key={p.id} to={`/program/${p.id || p["Program_ID"]}`} className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:shadow-md transition group bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition mb-1">{p["Course/Program_Title"]}</h3>
                  <p className="text-gray-500 text-sm">{p["Course_Level"]} • {p["Duration"]}</p>
                  <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                    View Details <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No other programs found for this university.</p>
          )}
        </div>
      )}
    </div>
  );
}