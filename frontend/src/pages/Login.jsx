import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import usePageHead from "../usePageHead";

const DEMO_ACCOUNTS = [
  { role: "Student", email: "student@test.edu" },
  { role: "Maintenance", email: "repairman@test.edu" },
  { role: "Proctor", email: "proctor@test.edu" },
  { role: "Warden", email: "warden@test.edu" },
  { role: "HOD", email: "hod@test.edu" },
  { role: "Dean / Admin", email: "admin@test.edu" },
];

export default function Login() {
  usePageHead("Sign In", "Sign in to Redressal Institutional Grievance Portal.");
  const [form, setForm] = useState({ email: "", password: "" });
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
      const { data } = await api.post("/auth/login", form);
      login(data.user, data.token);
      navigate(data.user.role === "student" ? "/dashboard" : "/staff");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(email) {
    setForm({ email, password: "Password123!" });
  }

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <main className="w-full max-w-[360px]">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-950 transition-colors">
            R
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Sign in to Redressal
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Institutional grievance tracking portal
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200/80 bg-white p-6 shadow-xl shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none transition-all duration-150">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Email address
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
              </div>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-md border border-zinc-300/80 bg-white px-3 py-2 pr-9 text-sm text-zinc-900 shadow-sm shadow-zinc-950/5 placeholder-zinc-400 outline-none transition-all focus:border-zinc-500 focus:shadow focus:shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:shadow-none dark:focus:border-zinc-500"
                  placeholder="••••••••"
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
              {loading ? "Authenticating…" : "Continue"}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800/80 pt-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Demo accounts
            </p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc.email)}
                  className="rounded border border-zinc-200/80 bg-zinc-50 px-2 py-1 text-center font-mono text-[10px] text-zinc-600 shadow-sm shadow-zinc-950/5 transition-all hover:border-zinc-300 hover:bg-white hover:shadow hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400 dark:shadow-none dark:hover:border-zinc-700 dark:hover:text-zinc-200"
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white underline underline-offset-4">
            Register
          </Link>
        </p>
      </main>
    </div>
    <Footer />
  </div>
  );
}
