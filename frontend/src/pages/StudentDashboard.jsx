import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import ComplaintCard from "../components/ComplaintCard";
import GlassCard from "../components/GlassCard";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import { SkeletonList } from "../components/SkeletonCard";
import usePageHead from "../usePageHead";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function StudentDashboard() {
  usePageHead("Student Dashboard", "Track grievance resolution status and official administrative responses.");
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState(
    location.state?.submitted
      ? `Grievance "${location.state.ticketTitle || ""}" submitted successfully. Assigned department staff will review it.`
      : ""
  );
  const { user } = useAuth();

  useEffect(() => {
    api
      .get("/complaints")
      .then((res) => {
        setComplaints(res.data);
      })
      .catch((err) => {
        console.error("Error loading complaints:", err);
        setError("Unable to load grievances. Please try again or refresh.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const counts = {
    total: complaints.length,
    submitted: complaints.filter((c) => c.status === "submitted").length,
    inReview: complaints.filter((c) => c.status === "in_review").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Student Dashboard
            </span>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Complaints & Grievances
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Track status, responses, and updates for {user.name}
            </p>
          </div>
          <Link
            to="/new"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-zinc-950/10 hover:bg-zinc-800 hover:shadow active:shadow-none dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:active:bg-zinc-200 dark:shadow-none transition-all"
          >
            + New complaint
          </Link>
        </div>

        {/* Minimalist Metrics - Eye-friendly colors with comfortable dark-mode contrast */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "Total Filed",
              value: counts.total,
              color: "text-zinc-900 dark:text-zinc-100",
            },
            {
              label: "Submitted",
              value: counts.submitted,
              color: "text-sky-600 dark:text-sky-400",
            },
            {
              label: "In Review",
              value: counts.inReview,
              color: "text-amber-500 dark:text-amber-300",
            },
            {
              label: "Resolved",
              value: counts.resolved,
              color: "text-emerald-600 dark:text-emerald-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none transition-all duration-150"
            >
              <p className={`font-mono text-2xl font-semibold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Filed Grievances ({complaints.length})
            </h2>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {loading && <SkeletonList count={3} />}

          {!loading && complaints.length === 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No grievances filed</p>
              <p className="mt-1 text-xs text-zinc-500">
                When you face any issue on campus, click "+ New complaint" to file a ticket.
              </p>
            </div>
          )}

          {complaints.map((c) => (
            <ComplaintCard key={c.id} complaint={c} isHod={false} />
          ))}
        </div>
      </main>

      {/* Mobile Sticky Quick Action Floating CTA */}
      <div className="fixed bottom-6 right-6 z-30 sm:hidden">
        <Link
          to="/new"
          className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-3 text-xs font-semibold text-white shadow-xl shadow-zinc-950/25 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white transition-all"
          aria-label="File new complaint"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>New Ticket</span>
        </Link>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}

      <Footer />
    </div>
  );
}
