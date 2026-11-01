import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, LogIn, UserPlus, LayoutDashboard, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function WelcomeModal() {
  const auth = useAuth();
  const user = auth?.user; 
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString(); 
    let lastSeen = null;
    
    try {
      lastSeen = localStorage.getItem("arrows_last_welcome");
    } catch (e) {}

    if (lastSeen !== today) {
      const timer = setTimeout(() => setIsOpen(true), 1000); 
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("arrows_last_welcome", new Date().toDateString());
    } catch (e) {}
  };

  if (!isOpen) return null;

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "there";
  const role = user?.user_metadata?.role || "student"; 
  const dashboardLink = `/dashboard/${role}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#09090b]/80 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Premium Glow & Gradient Container */}
      <div className="relative w-full max-w-[500px] overflow-hidden rounded-[2rem] p-[1px] bg-gradient-to-b from-blue-500/50 via-gray-200/20 to-transparent dark:from-blue-500/50 dark:via-gray-800/50 dark:to-transparent shadow-[0_0_80px_-20px_rgba(59,130,246,0.5)] animate-in zoom-in-95 duration-500 delay-100">
        
        {/* Inner Modal Background */}
        <div className="relative flex flex-col rounded-[calc(2rem-1px)] bg-white dark:bg-[#0c0c0f] px-8 py-10 sm:px-12 sm:py-14 overflow-hidden">
          
          {/* Background Gradients inside the modal */}
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-600/20 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 z-20 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800/50 dark:hover:text-gray-200 transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative z-10 text-center">
            
            <h2 className="mb-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {user ? (
                <>Welcome back, <span className="capitalize text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">{userName}</span>!</>
              ) : (
                <>Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Arrows AI</span></>
              )}
            </h2>
            
            <p className="mb-10 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
              {user 
                ? "Ready to continue your journey? Check your latest matches and application progress."
                : "Your intelligent platform for finding the perfect university abroad. Log in to save matches and track your applications."
              }
            </p>

            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  <Link
                    to={dashboardLink}
                    onClick={handleClose}
                    className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.8)] active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-3">
                      <LayoutDashboard className="h-5 w-5" />
                      Go to Dashboard
                    </span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  
                  <Link
                    to="/matches"
                    onClick={handleClose}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/50 px-6 py-4 text-base font-bold text-gray-900 transition-all hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white dark:hover:bg-gray-800 active:scale-[0.98]"
                  >
                    Find New Matches
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    onClick={handleClose}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.8)] active:scale-[0.98]"
                  >
                    <UserPlus className="h-5 w-5" />
                    Create a Free Account
                  </Link>
                  
                  <Link
                    to="/login"
                    onClick={handleClose}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white/50 px-6 py-4 text-base font-bold text-gray-900 transition-all hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900/50 dark:text-white dark:hover:bg-gray-800 active:scale-[0.98]"
                  >
                    <LogIn className="h-5 w-5" />
                    Log In
                  </Link>
                </>
              )}
            </div>
            
            <button
              onClick={handleClose}
              className="mt-8 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              Maybe later, just browsing
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}