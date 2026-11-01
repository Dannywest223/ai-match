import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard/student", label: "I'm a Student" },
  { to: "/dashboard/agent", label: "I'm an Agent" },
  { to: "/dashboard/university", label: "I'm a University" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* --- UPDATED LOGO SECTION --- */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg" onClick={() => setOpen(false)}>
          <img 
            src="/logo.jpeg" 
            alt="Arrows Logo" 
            className="h-8 w-8 rounded-md object-cover" 
          />
          Arrows
        </Link>

        <nav className="hidden md:flex gap-6 text-sm">
          {links.map((l) => (
            <Link 
              key={l.to} 
              to={l.to} 
              className={`hover:text-blue-600 ${location.pathname === l.to ? "text-blue-600 font-medium" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden sm:inline text-xs text-gray-500">{user.email}</span>
              <button 
                onClick={handleLogout} 
                className="text-sm px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Log out
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="hidden sm:inline-block rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
            >
              Log in
            </Link>
          )}
          <button 
            onClick={() => setOpen((o) => !o)} 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" 
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4 space-y-3">
          {links.map((l) => (
            <Link 
              key={l.to} 
              to={l.to} 
              onClick={() => setOpen(false)} 
              className={`block text-sm py-2 hover:text-blue-600 ${location.pathname === l.to ? "text-blue-600 font-medium" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button 
              onClick={handleLogout} 
              className="block w-full text-center text-sm py-2 rounded-full border border-gray-300 dark:border-gray-700"
            >
              Log out
            </button>
          ) : (
            <Link 
              to="/login" 
              onClick={() => setOpen(false)} 
              className="block text-center rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium"
            >
              Log in
            </Link>
          )}
        </div>
      )}
    </header>
  );
}