import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ArrowsChat } from "./components/ArrowsChat";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/Home";
import { Matches } from "./pages/Matches";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { StudentDashboard } from "./pages/StudentDashboard";
import { AgentDashboard } from "./pages/AgentDashboard";
import { UniversityDashboard } from "./pages/UniversityDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col">
        <Navbar />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/agent" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/university" element={<ProtectedRoute><UniversityDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </div>
        <Footer />
        <ArrowsChat />
      </div>
    </AuthProvider>
  );
}