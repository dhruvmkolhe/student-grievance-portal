import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ComplaintCard from "../components/ComplaintCard";
import GlassCard from "../components/GlassCard";
import Footer from "../components/Footer";
import { SkeletonList } from "../components/SkeletonCard";
import usePageHead from "../usePageHead";
import api from "../api";
import { useAuth } from "../AuthContext";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "in_review", label: "In review" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const ROLE_DASHBOARD_CONFIG = {
  repairman: {
    title: "Maintenance & Work Orders",
    subtitle: "Campus facilities, infrastructure, electrical, plumbing & lab repairs",
    purviewName: "Facilities & Repairs",
    accent: "text-zinc-300",
  },
  proctor: {
    title: "Proctorial & Student Conduct",
    subtitle: "Campus safety, student discipline, anti-ragging & behavioral reports",
    purviewName: "Discipline & Safety",
    accent: "text-amber-400",
  },
  warden: {
    title: "Hostel & Residential Grievances",
    subtitle: "Hostel amenities, cleanliness, room disputes & mess food complaints",
    purviewName: "Hostel & Mess",
    accent: "text-emerald-400",
  },
  hod: {
    title: "Department Grievance Overview",
    subtitle: "Curriculum, teaching, faculty matters & examination disputes",
    purviewName: "Academics & Faculty",
    accent: "text-zinc-200",
  },
  admin: {
    title: "Campus Dean & Admin Console",
    subtitle: "Institute-wide grievance oversight, departmental metrics & resolution tracking",
    purviewName: "Entire Institution",
    accent: "text-zinc-100",
  },
};

export default function StaffDashboard() {
  usePageHead("Staff Console", "Institutional grievance resolution, triage, and department analytics.");
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [onlyPurview, setOnlyPurview] = useState(user?.role !== "admin");
  const [loading, setLoading] = useState(true);

  const roleMeta =
    ROLE_DASHBOARD_CONFIG[user?.role] || ROLE_DASHBOARD_CONFIG.admin;

  useEffect(() => {
    api
      .get("/auth/staff")
      .then((res) => setStaffList(res.data))
      .catch((err) => console.error("Error loading staff list:", err));
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (assignedFilter) params.assigned_to = assignedFilter;
      if (onlyPurview && user?.role !== "admin") params.purview = "true";

      const [complaintsRes, statsRes] = await Promise.all([
        api.get("/complaints", { params }),
        api.get("/complaints/stats/summary", {
          params: onlyPurview && user?.role !== "admin" ? { purview: "true" } : {},
        }),
      ]);

      setComplaints(complaintsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, assignedFilter, onlyPurview]);

  function handleUpdated(updated) {
    setComplaints((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    );
    api.get("/complaints/stats/summary", {
      params: onlyPurview && user?.role !== "admin" ? { purview: "true" } : {},
    }).then((res) => setStats(res.data));
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                Staff Console
              </span>
              <span className="text-zinc-400 dark:text-zinc-600">·</span>
              <span className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${roleMeta.accent}`}>
                {roleMeta.purviewName}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              {roleMeta.title}
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {user?.department ? `${user.department} — ` : ""}
              {roleMeta.subtitle}
            </p>
          </div>

          {user?.role !== "admin" && (
            <div className="flex rounded-md border border-zinc-200 bg-zinc-100 p-1 shadow-inner dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-none transition-colors">
              <button
                type="button"
                onClick={() => setOnlyPurview(true)}
                className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                  onlyPurview
                    ? "bg-white text-zinc-950 shadow-sm shadow-zinc-950/10 dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-none"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                My Purview
              </button>
              <button
                type="button"
                onClick={() => setOnlyPurview(false)}
                className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                  !onlyPurview
                    ? "bg-white text-zinc-950 shadow-sm shadow-zinc-950/10 dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-none"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                All Campus
              </button>
            </div>
          )}
        </div>

        {stats && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none transition-all duration-150">
              <p className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                {stats.total}
              </p>
              <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                Total grievances
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none transition-all duration-150">
              <p className="font-mono text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
                {stats.byStatus.find((s) => s.status === "submitted")?.c || 0}
              </p>
              <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                Awaiting review
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none transition-all duration-150">
              <p className="font-mono text-2xl font-semibold text-amber-500 dark:text-amber-300">
                {stats.byStatus.find((s) => s.status === "in_review")?.c || 0}
              </p>
              <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                In progress
              </p>
            </div>

            <div className="rounded-lg border border-zinc-200/80 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md hover:shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none transition-all duration-150">
              <p className="font-mono text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {stats.byStatus.find((s) => s.status === "resolved")?.c || 0}
              </p>
              <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-300">
                Resolved
              </p>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`rounded border px-2.5 py-1 text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? "border-zinc-400 bg-zinc-100 text-zinc-900 shadow-sm shadow-zinc-900/10 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-none"
                    : "border-zinc-200/80 bg-white text-zinc-600 shadow-sm shadow-zinc-900/5 hover:border-zinc-300 hover:shadow hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-950 dark:text-zinc-400 dark:shadow-none dark:hover:border-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="rounded border border-zinc-300/80 bg-white px-2.5 py-1 text-xs text-zinc-800 shadow-sm shadow-zinc-900/5 outline-none focus:border-zinc-500 focus:shadow dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:focus:border-zinc-600 dark:shadow-none transition-all"
            >
              <option value="" className="bg-white dark:bg-zinc-900">All Assignments</option>
              <option value="me" className="bg-white dark:bg-zinc-900">Assigned to Me</option>
              <option value="unassigned" className="bg-white dark:bg-zinc-900">Unassigned Only</option>
            </select>

            <button
              onClick={() => {
                setStatusFilter("");
                setCategoryFilter("");
                setAssignedFilter("");
              }}
              className="font-mono text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Complaints list */}
        <div className="mt-4 space-y-2.5">
          {loading && <SkeletonList count={4} />}

          {!loading && complaints.length === 0 && (
            <div className="rounded-lg border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No complaints found</p>
              <p className="mt-1 text-xs text-zinc-500">
                {onlyPurview
                  ? "No tickets currently open in your purview. Switch to All Campus to view other departments."
                  : "No complaints match the active filter criteria."}
              </p>
            </div>
          )}

          {complaints.map((c) => (
            <ComplaintCard
              key={c.id}
              complaint={c}
              isStaff
              currentUser={user}
              staffList={staffList}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
