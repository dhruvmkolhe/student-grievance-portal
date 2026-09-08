import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import usePageHead from "../usePageHead";

const ROLES = [
  { id: "student", label: "Student", desc: "File & track grievances" },
  { id: "hod", label: "HOD", desc: "Academics & faculty" },
  { id: "proctor", label: "Proctor", desc: "Discipline & safety" },
  { id: "repairman", label: "Maintenance", desc: "Facilities & repairs" },
  { id: "warden", label: "Warden", desc: "Hostel & mess" },
  { id: "admin", label: "Dean / Admin", desc: "Campus oversight" },
];

function getDepartmentConfig(role) {
  switch (role) {
    case "repairman":
      return { label: "Specialization / Trade", placeholder: "e.g. Electrical, Plumbing, HVAC" };
    case "warden":
      return { label: "Hostel Block / Wing", placeholder: "e.g. Block B, Wing A" };
    case "proctor":
      return { label: "Disciplinary Wing", placeholder: "e.g. Proctorial Board" };
    case "admin":
      return { label: "Administrative Office", placeholder: "e.g. Office of the Dean" };
    case "hod":
    case "student":
    default:
      return { label: "Department", placeholder: "e.g. Computer Science & Engineering" };
  }
}

export default function Register() {
  usePageHead("Create Account", "Register for institutional student grievance and complaint resolution access.");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    staffSecret: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.user, data.token);
      navigate(data.user.role === "student" ? "/dashboard" : "/staff");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const deptConfig = getDepartmentConfig(form.role);

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <main className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-950 transition-colors">
            R
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Create an account
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Select your campus role to register
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-xl shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none transition-all duration-150">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Choose role
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ROLES.map((r) => {
                  const active = form.role === r.id;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setForm({ ...form, role: r.id })}
                      className={`flex flex-col items-start rounded-md border p-2.5 text-left transition-all ${
                        active
                          ? "border-zinc-900 bg-zinc-100 text-zinc-900 shadow-sm shadow-zinc-950/10 dark:border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-none"
                          : "border-zinc-200/80 bg-white text-zinc-600 shadow-sm shadow-zinc-950/5 hover:border-zinc-300 hover:shadow hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:shadow-none dark:hover:border-zinc-700 dark:hover:text-zinc-200"
                      }`}
                    >
                      <span className="font-mono text-xs font-medium">
                        {r.label}
                      </span>
                      <span className="mt-0.5 text-[10px] leading-tight text-zinc-500">
                        {r.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Full name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm shadow-zinc-950/5 placeholder-zinc-400 outline-none transition-all focus:border-zinc-500 focus:shadow focus:shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:shadow-none dark:focus:border-zinc-500"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Institutional email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm shadow-zinc-950/5 placeholder-zinc-400 outline-none transition-all focus:border-zinc-500 focus:shadow focus:shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:shadow-none dark:focus:border-zinc-500"
                placeholder="name@parul.edu.in"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {deptConfig.label}
              </label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm shadow-zinc-950/5 placeholder-zinc-400 outline-none transition-all focus:border-zinc-500 focus:shadow focus:shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:shadow-none dark:focus:border-zinc-500"
                placeholder={deptConfig.placeholder}
              />
            </div>

            {form.role !== "student" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-amber-800 dark:text-amber-400">
                    Staff Passcode *
                  </label>
                  <span className="text-[10px] text-zinc-400">Required for faculty & staff</span>
                </div>
                <input
                  type="password"
                  required
                  value={form.staffSecret}
                  onChange={(e) => setForm({ ...form, staffSecret: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-amber-300 bg-amber-50/40 px-3 py-2 text-sm text-zinc-900 shadow-sm placeholder-zinc-400 outline-none transition-all focus:border-amber-500 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-zinc-100 dark:placeholder-zinc-500"
                  placeholder="Enter staff authorization passcode"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-md border border-zinc-300/80 bg-white px-3 py-2 pr-9 text-sm text-zinc-900 shadow-sm shadow-zinc-950/5 placeholder-zinc-400 outline-none transition-all focus:border-zinc-500 focus:shadow focus:shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:shadow-none dark:focus:border-zinc-500"
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-zinc-900 py-2 text-sm font-medium text-white shadow-sm shadow-zinc-950/10 transition-all hover:bg-zinc-800 hover:shadow-md active:shadow-none dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:active:bg-zinc-200 dark:shadow-none disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Already registered?{" "}
          <Link to="/login" className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </main>
    </div>
    <Footer />
  </div>
  );
}
