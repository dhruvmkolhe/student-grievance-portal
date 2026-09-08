import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import GlassCard from "../components/GlassCard";
import Footer from "../components/Footer";
import usePageHead from "../usePageHead";
import api from "../api";

const CATEGORIES = [
  "Academic & Curriculum",
  "Faculty & Teaching",
  "Campus Facilities & Maintenance",
  "Hostel & Mess",
  "Discipline & Safety",
  "Exam & Results",
  "Fees & Accounts",
  "Other",
];

export default function ComplaintForm() {
  usePageHead("Submit Grievance", "File a formal institutional grievance or maintenance work order.");
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0],
    description: "",
    department: "",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => payload.append(k, v));
      if (file) payload.append("attachment", file);

      await api.post("/complaints", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/dashboard", { state: { submitted: true, ticketTitle: form.title } });
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit complaint");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            New Grievance
          </span>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Submit a ticket
          </h1>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            Your complaint will be routed to the appropriate department or authority.
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200/80 bg-white p-6 shadow-md shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none transition-all duration-150">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Title / Subject
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm shadow-zinc-950/5 placeholder-zinc-400 outline-none transition-all focus:border-zinc-500 focus:shadow focus:shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:shadow-none dark:focus:border-zinc-500"
                placeholder="Brief summary of the issue"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm shadow-zinc-950/5 outline-none transition-all focus:border-zinc-500 focus:shadow dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:shadow-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-zinc-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Department or Location (optional)
                </label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="mt-1.5 w-full rounded-md border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm shadow-zinc-950/5 placeholder-zinc-400 outline-none transition-all focus:border-zinc-500 focus:shadow focus:shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:shadow-none dark:focus:border-zinc-500"
                  placeholder="e.g. Block C, Room 302"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Detailed description
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5 w-full rounded-md border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm shadow-zinc-950/5 placeholder-zinc-400 outline-none transition-all focus:border-zinc-500 focus:shadow focus:shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder-zinc-500 dark:shadow-none dark:focus:border-zinc-500"
                placeholder="Include specific dates, location, and details so staff can resolve it quickly…"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Supporting document / image (optional, max 5MB)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1.5 block w-full text-xs text-zinc-600 file:mr-3 file:rounded file:border file:border-zinc-200/80 file:bg-zinc-50 file:px-3 file:py-1.5 file:text-xs file:text-zinc-800 file:shadow-sm file:shadow-zinc-950/5 hover:file:bg-zinc-100 hover:file:shadow dark:text-zinc-400 dark:file:border-zinc-800 dark:file:bg-zinc-950 dark:file:text-zinc-200 dark:file:shadow-none dark:file:hover:bg-zinc-800"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
              >
                {error}
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white shadow-sm shadow-zinc-950/10 transition-all hover:bg-zinc-800 hover:shadow-md active:shadow-none dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:active:bg-zinc-200 dark:shadow-none disabled:opacity-50"
              >
                {loading ? "Submitting…" : "Submit grievance"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="rounded-md border border-zinc-200/80 bg-white px-3.5 py-2 text-xs font-medium text-zinc-600 shadow-sm shadow-zinc-950/5 transition-all hover:border-zinc-300 hover:shadow hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:shadow-none dark:hover:border-zinc-700 dark:hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
