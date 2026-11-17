import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { 
  FileText, CheckCircle2, AlertCircle, Save, 
  UploadCloud, Info, File, Trash2 
} from "lucide-react";

// Standard required documents
const REQUIRED_DOCUMENTS = [
  { id: "passport", label: "Passport", description: "Photo page only. Must clearly show your name and expiry date.", maxSize: "5MB" },
  { id: "transcript", label: "Academic Transcripts", description: "High school or university transcripts. Must be in English or officially translated.", maxSize: "10MB" },
  { id: "english_test", label: "English Proficiency Test", description: "IELTS, TOEFL, PTE, or Duolingo certificate.", maxSize: "5MB" },
  { id: "cv", label: "Resume / CV", description: "Updated CV highlighting your academic and work experience.", maxSize: "2MB" },
  { id: "sop", label: "Statement of Purpose", description: "A 1-2 page essay explaining why you want to study this program.", maxSize: "2MB" },
];

export function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<any>({
    first_name: "", middle_name: "", last_name: "", date_of_birth: "",
    first_language: "", citizenship: "", passport_number: "", passport_expiry: "",
    passport_birthplace: "", marital_status: "Single", gender: "Male",
    street_address: "", city: "", country: "", province: "", postal_code: "",
    phone_number: "", email: "", visa_refused: false, visa_details: "",
    edu_country: "", edu_level: "", edu_grading_scheme: "", edu_grade_scale: "",
    edu_grade_average: "", english_exam: "IELTS", exam_date: "",
    listening_score: "", reading_score: "", writing_score: "", speaking_score: "",
    documents: {}, // Required docs
    additional_documents: [] // Extra uploaded docs
  });

  useEffect(() => {
    if (!user) return;
    const userId = user.id; // Capture user.id to satisfy TypeScript

    async function fetchProfile() {
      const { data, error } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        const formattedData = { ...data };
        if (formattedData.date_of_birth) formattedData.date_of_birth = formattedData.date_of_birth.split("T")[0];
        if (formattedData.passport_expiry) formattedData.passport_expiry = formattedData.passport_expiry.split("T")[0];
        if (formattedData.exam_date) formattedData.exam_date = formattedData.exam_date.split("T")[0];
        
        if (!formattedData.documents || Array.isArray(formattedData.documents)) {
          formattedData.documents = {};
        }
        if (!formattedData.additional_documents) {
          formattedData.additional_documents = [];
        }
        
        setFormData({ ...formData, ...formattedData });
      } else if (!error || error.code === "PGRST116") {
        setFormData((prev: any) => ({ ...prev, email: user.email || "" }));
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // --- REQUIRED DOCUMENT UPLOAD ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const userId = user.id;

    const maxSizeMB = parseInt(REQUIRED_DOCUMENTS.find(d => d.id === docId)?.maxSize || "10");
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File is too large. Maximum size for this document is ${maxSizeMB}MB.`);
      return;
    }

    setUploadingDoc(docId);
    const filePath = `${userId}/${docId}-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("student-documents")
      .upload(filePath, file);

    if (uploadError) {
      alert("Error uploading: " + uploadError.message);
      setUploadingDoc(null);
      return;
    }

    const { data: urlData } = supabase.storage.from("student-documents").getPublicUrl(filePath);

    if (urlData?.publicUrl) {
      setFormData((prev: any) => ({
        ...prev,
        documents: { ...prev.documents, [docId]: { name: file.name, url: urlData.publicUrl } }
      }));
    }
    setUploadingDoc(null);
  };

  // --- ADDITIONAL DOCUMENT UPLOAD ---
  const handleExtraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    const userId = user.id;

    setUploadingDoc("extra");
    const newDocs = [...(formData.additional_documents || [])];

    for (const file of Array.from(files)) {
      if (file.size > 20 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 20MB.`);
        continue;
      }

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const filePath = `${userId}/extra-${Date.now()}-${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("student-documents")
        .upload(filePath, file);

      if (uploadError) {
        alert("Error uploading " + file.name);
        continue;
      }

      const { data: urlData } = supabase.storage.from("student-documents").getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        newDocs.push({ name: file.name, url: urlData.publicUrl });
      }
    }

    setFormData((prev: any) => ({ ...prev, additional_documents: newDocs }));
    setUploadingDoc(null);
  };

  const removeDocument = (docId: string) => {
    const newDocs = { ...formData.documents };
    delete newDocs[docId];
    setFormData({ ...formData, documents: newDocs });
  };

  const removeExtraDocument = (index: number) => {
    const newDocs = [...formData.additional_documents];
    newDocs.splice(index, 1);
    setFormData({ ...formData, additional_documents: newDocs });
  };

  const handleSave = async () => {
    if (!user) return;
    const userId = user.id;
    setSaving(true);
    
    const dataToSave = { ...formData, id: userId };
    if (!dataToSave.date_of_birth) dataToSave.date_of_birth = null;
    if (!dataToSave.passport_expiry) dataToSave.passport_expiry = null;
    if (!dataToSave.exam_date) dataToSave.exam_date = null;

    const { error } = await supabase
      .from("student_profiles")
      .upsert(dataToSave, { onConflict: "id" });

    setSaving(false);
    if (error) {
      alert("Error saving profile: " + error.message);
    } else {
      setSuccessMsg("Profile saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Profile</h1>
          <p className="text-gray-500">Manage your study abroad journey</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <FileText size={18} /> Preferences
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-4 text-sm font-medium text-gray-600 dark:text-gray-300 overflow-x-auto pb-2 gap-4">
          <button onClick={() => setActiveTab("personal")} className={`flex items-center gap-2 ${activeTab === 'personal' ? 'text-blue-600 underline decoration-2 underline-offset-4' : ''}`}>
            <AlertCircle size={18} className="text-orange-500" /> Personal Information
          </button>
          <button onClick={() => setActiveTab("education")} className={`flex items-center gap-2 ${activeTab === 'education' ? 'text-blue-600 underline decoration-2 underline-offset-4' : ''}`}>
            <AlertCircle size={18} className="text-orange-500" /> Education Details
          </button>
          <button onClick={() => setActiveTab("tests")} className={`flex items-center gap-2 ${activeTab === 'tests' ? 'text-blue-600 underline decoration-2 underline-offset-4' : ''}`}>
            <CheckCircle2 size={18} className="text-green-500" /> Test Scores
          </button>
          <button onClick={() => setActiveTab("additional")} className={`flex items-center gap-2 ${activeTab === 'additional' ? 'text-blue-600 underline decoration-2 underline-offset-4' : ''}`}>
            <Info size={18} /> Additional Details
          </button>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: activeTab === 'personal' ? '25%' : activeTab === 'education' ? '50%' : activeTab === 'tests' ? '75%' : '100%' }}></div>
        </div>
      </div>

      {/* Smart Vault */}
      {activeTab === "personal" && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Smart Document Vault</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Please upload the required documents below. 
            <span className="font-semibold text-orange-500 ml-1">Tip: Name your files clearly (e.g., transcript.pdf, passport.pdf) before uploading.</span>
          </p>
          
          <div className="space-y-4">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const uploadedDoc = formData.documents?.[doc.id];
              const isUploading = uploadingDoc === doc.id;

              return (
                <div key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {doc.label}
                      {uploadedDoc && <CheckCircle2 size={16} className="text-green-500" />}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                    <p className="text-xs text-orange-500 font-medium mt-1">Max size: {doc.maxSize}</p>
                  </div>

                  <div className="shrink-0 min-w-[200px]">
                    {uploadedDoc ? (
                      <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 pl-3">
                        <a href={uploadedDoc.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 truncate mr-2 hover:underline flex items-center gap-2">
                          <File size={16} /> {uploadedDoc.name}
                        </a>
                        <button onClick={() => removeDocument(doc.id)} className="text-gray-400 hover:text-red-500 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input 
                          type="file" 
                          id={`file-${doc.id}`}
                          className="hidden" 
                          accept=".pdf,.jpg,.jpeg,.png" 
                          onChange={(e) => handleFileUpload(e, doc.id)}
                          disabled={isUploading}
                        />
                        <label 
                          htmlFor={`file-${doc.id}`}
                          className={`flex items-center justify-center gap-2 w-full px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            isUploading 
                              ? "border-gray-300 text-gray-400 animate-pulse" 
                              : "border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900/20"
                          }`}
                        >
                          <UploadCloud size={18} />
                          {isUploading ? "Uploading..." : "Upload File"}
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {activeTab === "personal" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
              <p className="text-sm text-gray-500">(As indicated on the student's passport)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input type="text" name="first_name" value={formData.first_name || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Middle Name</label>
                <input type="text" name="middle_name" value={formData.middle_name || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input type="text" name="last_name" value={formData.last_name || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">First Language *</label>
                <input type="text" name="first_language" value={formData.first_language || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country of Citizenship *</label>
                <input type="text" name="citizenship" value={formData.citizenship || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Passport Number *</label>
                <input type="text" name="passport_number" value={formData.passport_number || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Passport Expiry Date *</label>
                <input type="date" name="passport_expiry" value={formData.passport_expiry || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Passport Place of Birth</label>
                <input type="text" name="passport_birthplace" value={formData.passport_birthplace || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Marital Status *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2"><input type="radio" name="marital_status" value="Single" checked={formData.marital_status === "Single"} onChange={handleChange} /> Single</label>
                    <label className="flex items-center gap-2"><input type="radio" name="marital_status" value="Married" checked={formData.marital_status === "Married"} onChange={handleChange} /> Married</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gender *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2"><input type="radio" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleChange} /> Male</label>
                    <label className="flex items-center gap-2"><input type="radio" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleChange} /> Female</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input type="text" name="street_address" value={formData.street_address || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <input type="text" name="city" value={formData.city || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country *</label>
                <input type="text" name="country" value={formData.country || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Province/State *</label>
                <input type="text" name="province" value={formData.province || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal/Zip Code</label>
                <input type="text" name="postal_code" value={formData.postal_code || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input type="text" name="phone_number" value={formData.phone_number || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" name="email" value={formData.email || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-800 cursor-not-allowed" readOnly />
                <p className="text-xs text-green-600 mt-1 font-medium">Verified</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "education" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education Details</h2>
              <p className="text-sm text-gray-500">Please enter details for the highest level of education you have completed</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Country of Education *</label>
                <input type="text" name="edu_country" value={formData.edu_country || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Highest Level of Education *</label>
                <input type="text" name="edu_level" value={formData.edu_level || ""} onChange={handleChange} placeholder="Grade 12 / High School" className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grading Scheme *</label>
                <input type="text" name="edu_grading_scheme" value={formData.edu_grading_scheme || ""} onChange={handleChange} placeholder="Other" className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grade Scale (out of) *</label>
                <input type="text" name="edu_grade_scale" value={formData.edu_grade_scale || ""} onChange={handleChange} placeholder="100" className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grade Average *</label>
                <input type="text" name="edu_grade_average" value={formData.edu_grade_average || ""} onChange={handleChange} placeholder="85" className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "tests" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test Scores</h2>
            <div className="p-4 bg-blue-50 dark:bg-gray-900 rounded-xl border border-blue-100 dark:border-gray-800 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="radio" defaultChecked className="mt-1" />
                <span className="text-sm text-gray-700 dark:text-gray-300">I have or will have proof of language proficiency before I apply.</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">English exam type *</label>
                <select name="english_exam" value={formData.english_exam || "IELTS"} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="PTE">PTE</option>
                  <option value="Duolingo">Duolingo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Exam *</label>
                <input type="date" name="exam_date" value={formData.exam_date || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Listening *</label>
                <input type="text" name="listening_score" value={formData.listening_score || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reading *</label>
                <input type="text" name="reading_score" value={formData.reading_score || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Writing *</label>
                <input type="text" name="writing_score" value={formData.writing_score || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Speaking *</label>
                <input type="text" name="speaking_score" value={formData.speaking_score || ""} onChange={handleChange} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "additional" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Background Information</h2>
              <p className="text-sm text-gray-500 mb-4">Have you been refused a visa from Canada, the USA, the United Kingdom, New Zealand, Australia or Ireland? *</p>
              
              <div className="flex gap-6 mb-4">
                <label className="flex items-center gap-2"><input type="radio" name="visa_refused" checked={formData.visa_refused === true} onChange={() => setFormData({...formData, visa_refused: true})} /> Yes</label>
                <label className="flex items-center gap-2"><input type="radio" name="visa_refused" checked={formData.visa_refused === false} onChange={() => setFormData({...formData, visa_refused: false})} /> No</label>
              </div>

              {formData.visa_refused && (
                <div>
                  <label className="block text-sm font-medium mb-1">Please provide more details *</label>
                  <textarea name="visa_details" value={formData.visa_details || ""} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                </div>
              )}
            </div>

            {/* Supporting Documents Upload */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Supporting Documents</h2>
              <p className="text-sm text-gray-500 mb-4">Upload any additional documents here (e.g., recommendation letters, awards, etc.).</p>
              
              <div className="bg-blue-50 dark:bg-gray-900 border border-blue-100 dark:border-gray-800 p-4 rounded-xl mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium flex items-center gap-2">
                  <Info size={16} /> Please rename your files clearly before uploading (e.g., Recommendation_Letter.pdf, Award_Certificate.pdf).
                </p>
              </div>

              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer flex flex-col items-center justify-center"
                onClick={() => extraFileInputRef.current?.click()}
              >
                <UploadCloud size={32} className={`mb-2 ${uploadingDoc === "extra" ? 'text-gray-400 animate-pulse' : 'text-blue-500'}`} />
                <p className="font-medium text-gray-900 dark:text-white">
                  {uploadingDoc === "extra" ? "Uploading..." : "Click to add more files"}
                </p>
                <input 
                  type="file" 
                  multiple 
                  ref={extraFileInputRef} 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleExtraUpload}
                />
              </div>

              {formData.additional_documents && formData.additional_documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.additional_documents.map((doc: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <File size={16} className="text-blue-500 shrink-0" />
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm text-gray-700 dark:text-gray-300 truncate hover:underline">
                          {doc.name}
                        </a>
                      </div>
                      <button onClick={() => removeExtraDocument(i)} className="text-gray-400 hover:text-red-500 shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-4">
          {successMsg && <p className="text-green-600 font-medium text-sm">{successMsg}</p>}
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}