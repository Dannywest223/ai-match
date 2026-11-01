import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const opts = [
    { key: "light", icon: Sun },
    { key: "dark", icon: Moon },
    { key: "system", icon: Monitor },
  ] as const;

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-300 dark:border-gray-700 p-1">
      {opts.map(({ key, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setTheme(key)}
          className={`p-1.5 rounded-full ${
            theme === key
              ? "bg-blue-600 text-white"
              : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
