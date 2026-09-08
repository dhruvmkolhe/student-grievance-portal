import { useState } from "react";
import GlassCard from "./GlassCard";
import StatusBadge from "./StatusBadge";
import api, { getAttachmentUrl } from "../api";

const STATUS_OPTIONS = ["submitted", "in_review", "resolved", "rejected"];

function formatDate(iso) {
  if (!iso) return "";
  const isoFormatted = iso.includes("T") ? iso : iso.replace(" ", "T");
  const parsed = new Date(isoFormatted.endsWith("Z") ? isoFormatted : isoFormatted + "Z");
  if (isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ROLE_LABELS = {
  hod: "HOD",
  proctor: "Proctor",
  repairman: "Maintenance",
  warden: "Warden",
  admin: "Dean / Admin",
};

export default function ComplaintCard({
  complaint,
  isHod,
  isStaff,
  currentUser,
  staffList = [],
  onUpdated,
}) {
  const staffMode = isStaff || isHod;
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(complaint.status);
  const [response, setResponse] = useState(complaint.hod_response || "");
  const [assignedTo, setAssignedTo] = useState(complaint.assigned_to || "");
  const [saving, setSaving] = useState(false);

  async function handleSave(statusOverride = null, assignOverride = undefined) {
    setSaving(true);
    const newStatus = statusOverride || status;
    const newAssigned = assignOverride !== undefined ? assignOverride : assignedTo;
    try {
      const { data } = await api.patch(`/complaints/${complaint.id}`, {
        status: newStatus,
        response: response,
        assigned_to: newAssigned,
      });
      if (statusOverride) setStatus(statusOverride);
      if (assignOverride !== undefined) setAssignedTo(assignOverride);
      onUpdated?.(data);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleClaim() {
    setAssignedTo(currentUser?.id || "me");
    setStatus("in_review");
    handleSave("in_review", "me");
  }

  function handleQuickResolve() {
    setStatus("resolved");
    handleSave("resolved");
  }

  return (
    <GlassCard className="p-4 transition-all duration-150 hover:border-zinc-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:hover:border-zinc-700 dark:hover:shadow-none">
      <div
        className="flex cursor-pointer items-start justify-between gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              {complaint.category}
            </span>
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-400">
              #{complaint.id.slice(0, 8)}
            </span>
            {complaint.assigned_to_name && (
              <span className="rounded border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300">
                Assigned: {complaint.assigned_to_name}
              </span>
            )}
          </div>
          <h3 className="mt-1.5 truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {complaint.title}
          </h3>
          {staffMode && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {complaint.student_name} ({complaint.student_email})
              {complaint.department && ` · ${complaint.department}`}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={complaint.status} />
            <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-400">
              {formatDate(complaint.created_at)}
            </span>
          </div>
          <svg
            className={`h-4 w-4 text-zinc-400 transition-transform duration-200 dark:text-zinc-400 ${
              expanded ? "rotate-180 text-zinc-700 dark:text-zinc-200" : ""
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
        </div>
      </div>

      {expanded && (
        <div className="seamless-accordion mt-3.5 space-y-3.5 border-t border-zinc-200 dark:border-zinc-800/80 pt-3.5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
              Details
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
              {complaint.description}
            </p>
          </div>

          {complaint.attachment_path && (
            <div>
              <a
                href={getAttachmentUrl(complaint.attachment_path)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              >
                View attached file ↗
              </a>
            </div>
          )}

          {complaint.hod_response && !staffMode && (
            <div className="rounded-md border-l-2 border-zinc-600 border-y border-r border-zinc-200 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-950/70 dark:border-l-zinc-500">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-300">
                  Official Response
                </span>
                {complaint.responder_role && (
                  <span className="rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 font-mono text-[9px] uppercase text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                    {ROLE_LABELS[complaint.responder_role] || complaint.responder_role}
                  </span>
                )}
                {complaint.responder_name && (
                  <span className="text-xs text-zinc-500">
                    · {complaint.responder_name}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                {complaint.hod_response}
              </p>
            </div>
          )}

          {staffMode && (
            <div className="space-y-3 rounded-md border border-zinc-200 bg-zinc-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Update status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-600"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-white dark:bg-zinc-900">
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Assign ticket
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:focus:border-zinc-600"
                  >
                    <option value="" className="bg-white dark:bg-zinc-900">-- Unassigned --</option>
                    {currentUser && (
                      <option value="me" className="bg-white dark:bg-zinc-900">
                        Assign to me ({currentUser.name})
                      </option>
                    )}
                    {staffList
                      .filter((s) => s.id !== currentUser?.id)
                      .map((s) => (
                        <option key={s.id} value={s.id} className="bg-white dark:bg-zinc-900">
                          {s.name} ({ROLE_LABELS[s.role] || s.role})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Response / resolution notes
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:placeholder-zinc-600 dark:focus:border-zinc-600"
                  placeholder="Notes on resolution or action taken…"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:active:bg-zinc-200 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  {status !== "resolved" && (
                    <button
                      type="button"
                      onClick={handleQuickResolve}
                      disabled={saving}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>

                {!complaint.assigned_to && (
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={saving}
                    className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-200 disabled:opacity-50"
                  >
                    Claim ticket
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
