import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import ThemeToggle from "./ThemeToggle";

const ROLE_META = {
  student: {
    label: "Student",
    scope: "Individual Grievance Tracking",
    badge: "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300",
    dot: "bg-zinc-400",
  },
  repairman: {
    label: "Maintenance",
    scope: "Facilities, Electrical & Plumbing",
    badge: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  proctor: {
    label: "Proctor",
    scope: "Campus Safety & Student Conduct",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  warden: {
    label: "Hostel Warden",
    scope: "Hostel Amenities & Mess Dining",
    badge: "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-300",
    dot: "bg-cyan-500",
  },
  hod: {
    label: "Head of Dept",
    scope: "Academic & Curriculum Affairs",
    badge: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  admin: {
    label: "Dean / Admin",
    scope: "Institute-Wide Executive Oversight",
    badge: "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300",
    dot: "bg-purple-500",
  },
};

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const roleInfo = (user && ROLE_META[user.role]) || {
    label: user?.role || "User",
    scope: "Portal Access",
    badge: "border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
    dot: "bg-zinc-400",
  };

  const isStudent = user?.role === "student";
  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md shadow-sm shadow-zinc-950/5 transition-colors duration-150 dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:shadow-none">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand + Navigation */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            title="Redressal Grievance Portal"
          >
            {/* Custom Shield Emblem Mark */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-950/10 transition-colors dark:bg-zinc-100 dark:text-zinc-950 dark:ring-white/20">
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Redressal
              </span>
              <span className="hidden font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 sm:inline">
                portal
              </span>
            </div>
          </Link>

          {/* Institutional Campus Pill */}
          <div className="hidden items-center gap-1.5 border-l border-zinc-200 pl-4 dark:border-zinc-800 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              Parul University
            </span>
          </div>

          {/* Navigation Links */}
          {user && (
            <nav className="hidden items-center gap-1 sm:flex">
              {isStudent ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      location.pathname === "/dashboard"
                        ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200"
                    }`}
                  >
                    Grievances
                  </Link>
                  <Link
                    to="/new"
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      location.pathname === "/new"
                        ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200"
                    }`}
                  >
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New complaint
                  </Link>
                </>
              ) : (
                <Link
                  to="/staff"
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    location.pathname === "/staff" || location.pathname === "/hod"
                      ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-900 dark:text-white"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-200"
                  }`}
                >
                  Grievance Queue
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right: Controls & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {user && (
            <>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

              {/* User Profile Pill & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="group flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white p-1 pl-1 pr-2.5 shadow-sm shadow-zinc-950/5 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:shadow focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-none dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                  aria-expanded={dropdownOpen}
                  aria-label="User profile menu"
                >
                  {/* Initials Avatar */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white ring-1 ring-zinc-950/10 dark:bg-zinc-100 dark:text-zinc-950 dark:ring-white/20">
                    {initials}
                  </div>

                  {/* Name & Role */}
                  <div className="hidden text-left sm:block">
                    <p className="max-w-[120px] truncate text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {user.name}
                    </p>
                    <p className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                      {roleInfo.label}
                    </p>
                  </div>

                  {/* Chevron Icon */}
                  <svg
                    className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-150 dark:text-zinc-500 ${
                      dropdownOpen ? "rotate-180 text-zinc-700 dark:text-zinc-200" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Floating Dropdown Menu */}
                {dropdownOpen && (
                  <div className="seamless-dropdown absolute right-0 top-full mt-2 w-72 rounded-xl border border-zinc-200/80 bg-white p-2 shadow-2xl shadow-zinc-950/15 ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/60 dark:ring-white/5 z-50">
                    {/* User Header Summary */}
                    <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-950/60">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 font-mono text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {user.name}
                          </p>
                          <p className="truncate font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-zinc-200/80 pt-2.5 dark:border-zinc-800">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium ${roleInfo.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${roleInfo.dot}`} />
                          {roleInfo.label}
                        </span>
                        {user.department && (
                          <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                            · {user.department}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                        {roleInfo.scope}
                      </p>
                    </div>

                    {/* Mobile Navigation Links */}
                    <div className="mt-1 border-t border-zinc-100 pt-1 dark:border-zinc-800 sm:hidden">
                      {isStudent ? (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                          >
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/new"
                            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                          >
                            <span>Submit Grievance</span>
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/staff"
                          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                        >
                          <span>Staff Grievance Queue</span>
                        </Link>
                      )}
                    </div>

                    {/* Sign Out Action */}
                    <div className="mt-1 border-t border-zinc-100 pt-1 dark:border-zinc-800">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign out of portal
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Sign Out Ghost Icon Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 sm:inline-flex"
                title="Sign out"
                aria-label="Sign out"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
