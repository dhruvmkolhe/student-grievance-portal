import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import usePageHead from "../usePageHead";
import { useAuth } from "../AuthContext";

export default function NotFound() {
  usePageHead("Page Not Found", "The requested page does not exist on the Redressal portal.");
  const { user } = useAuth();

  const destination = user ? (user.role === "student" ? "/dashboard" : "/staff") : "/login";

  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <main className="w-full max-w-md text-center">
          {/* Brand mark with 404 badge */}
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-xl shadow-zinc-950/10 dark:bg-zinc-100 dark:text-zinc-950">
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <span className="mt-6 inline-block font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Error 404
          </span>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            Route Not Found
          </h1>

          <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
            The link you followed doesn't exist, was deleted, or belongs to a restricted portal purview.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              to={destination}
              className="w-full sm:w-auto rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm shadow-zinc-950/10 hover:bg-zinc-800 active:shadow-none dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white transition-all"
            >
              Return to Portal
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto rounded-md border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 shadow-sm hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-zinc-100 transition-all"
            >
              Sign In Screen
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
