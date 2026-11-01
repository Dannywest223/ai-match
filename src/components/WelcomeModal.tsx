import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Sparkles, LogIn, UserPlus, LayoutDashboard, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function WelcomeModal() {
  const auth = useAuth();
  const user = auth?.user; // Safe access in case auth is still loading
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 1. Get today's date
    const today = new Date().toDateString(); // e.g., "Sat Nov 01 2026"
    
    // 2. Check localStorage safely
    let lastSeen = null;
    try {
      lastSeen = localStorage.getItem("arrows_last_welcome");
    } catch (e) {
      console.warn("LocalStorage is blocked by the browser.");
    }

    // 3. Show modal if they haven't seen it today
    if (lastSeen !== today) {
      const timer = setTimeout(() => setIsOpen(true), 1200); // 1.2s delay for smooth load
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("arrows_last_welcome", new Date().toDateString());
    } catch (e) {
      // Ignore if browser blocks local storage
    }
  };

  if (!isOpen) return null;

  // Safely get the user's name
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "there";
  
  // Safely get the user's role for the dashboard link
  const role = user?.user_metadata?.role || "student"; 
  const dashboardLink = `/dashboard/${role}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 animate-in zoom-in-95 duration-500 delay-150">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 relative z-0">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-7 w-7" />
          </div>

          {/* ================= LOGGED IN STATE ================= */}
          {user ? (
            <>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white capitalize">
                Welcome back, {userName}!
              </h2>
              <p className="mb-8 text-gray-600 dark:text-gray-400">
                Ready to continue your journey? Check your latest matches and application progress.
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  to={dashboardLink}
                  onClick={handleClose}
                  className="group flex w-full items-center justify-between rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    Go to Dashboard
                  </span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                
                <Link
                  to="/matches"
                  onClick={handleClose}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Find New Matches
                </Link>
              </div>
            </>
          ) : (
            /* ================= GUEST STATE ================= */
            <>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                Welcome to Arrows AI
              </h2>
              <p className="mb-8 text-gray-600 dark:text-gray-400">
                Your intelligent platform for finding the perfect university abroad. 
                Log in to save matches and track your applications.
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  to="/signup"
                  onClick={handleClose}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  <UserPlus className="h-5 w-5" />
                  Create an Account
                </Link>
                
                <Link
                  to="/login"
                  onClick={handleClose}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <LogIn className="h-5 w-5" />
                  Log In
                </Link>
              </div>
            </>
          )}
          
          <button
            onClick={handleClose}
            className="mt-6 w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Maybe later, just browsing
          </button>
        </div>
      </div>
    </div>
  );
}