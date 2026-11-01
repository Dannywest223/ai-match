import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 font-bold text-lg mb-3">
            <GraduationCap className="text-blue-600" />
            Arrows Education
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            The AI-driven decision engine for international education.
          </p>
        </div>
        <div>
          <p className="font-semibold text-sm mb-3">Platform</p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link to="/matches" className="hover:text-blue-600">Get Matches</Link></li>
            <li><Link to="/dashboard/student" className="hover:text-blue-600">Student</Link></li>
            <li><Link to="/dashboard/agent" className="hover:text-blue-600">Agent</Link></li>
            <li><Link to="/dashboard/university" className="hover:text-blue-600">University</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-sm mb-3">Legal</p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
            <li><a href="#" className="hover:text-blue-600">Terms</a></li>
            <li><a href="#" className="hover:text-blue-600">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Arrows Education. All rights reserved.
      </div>
    </footer>
  );
}