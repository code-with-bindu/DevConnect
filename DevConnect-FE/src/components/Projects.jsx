import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import {
  onProjectActivity,
  offProjectActivity,
} from "../utils/socketClient";

const CATEGORIES = [
  "All",
  "Hackathon",
  "Unstop Competition",
  "Open Source",
  "Internship",
  "Side Project",
  "Startup",
];

const CATEGORY_STYLES = {
  Hackathon: "bg-purple-100 text-purple-700 border-purple-200",
  "Unstop Competition": "bg-amber-100 text-amber-700 border-amber-200",
  "Open Source": "bg-emerald-100 text-emerald-700 border-emerald-200",
  Internship: "bg-blue-100 text-blue-700 border-blue-200",
  "Side Project": "bg-pink-100 text-pink-700 border-pink-200",
  Startup: "bg-rose-100 text-rose-700 border-rose-200",
};

const emptyForm = {
  title: "",
  description: "",
  category: "Hackathon",
  skillsNeeded: "",
  teamSize: 4,
  deadline: "",
  link: "",
  location: "Remote",
};

/** Compute skill match score (0-100) between user skills and project skillsNeeded */
function skillMatchScore(userSkills = [], projectSkills = []) {
  if (!projectSkills.length) return null;
  const uLower = userSkills.map((s) => s.toLowerCase());
  const matched = projectSkills.filter((s) => uLower.includes(s.toLowerCase())).length;
  return Math.round((matched / projectSkills.length) * 100);
}

const Projects = () => {
  const me = useSelector((s) => s.user);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tab, setTab] = useState("All"); // All | Mine | Joined
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [activity, setActivity] = useState([]); // last few real-time events

  // Quick Apply modal state
  const [applyProject, setApplyProject] = useState(null); // project being applied to
  const [pitch, setPitch] = useState("");
  const [applying, setApplying] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (q.trim()) params.q = q.trim();
      if (category !== "All") params.category = category;
      if (tab === "Mine") params.mine = "true";
      const res = await axios.get(`${BASE_URL}/projects`, {
        params,
        withCredentials: true,
      });
      setProjects(res?.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, tab]);

  // Real-time activity ticker + auto-refresh of project list
  useEffect(() => {
    const handler = (evt) => {
      setActivity((prev) => [evt, ...prev].slice(0, 8));
      // If a brand new project was created OR someone applied, refresh quietly
      if (evt.kind === "created" || evt.kind === "applied") {
        fetchProjects();
      }
    };
    onProjectActivity(handler);
    return () => offProjectActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, tab]);

  const visible = useMemo(() => {
    if (tab !== "Joined") return projects;
    return projects.filter((p) =>
      p.interested?.some((i) => i.user?._id === me?._id)
    );
  }, [tab, projects, me]);

  const submitCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    try {
      setCreating(true);
      const res = await axios.post(
        `${BASE_URL}/projects`,
        { ...form },
        { withCredentials: true }
      );
      setProjects((prev) => [res.data.data, ...prev]);
      setForm(emptyForm);
      setShowCreate(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setCreating(false);
    }
  };

  const toggleInterest = async (project) => {
    try {
      setBusyId(project._id);
      const res = await axios.post(
        `${BASE_URL}/projects/${project._id}/interest`,
        {},
        { withCredentials: true }
      );
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? res.data.data : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusyId(null);
    }
  };

  const applyWithPitch = async () => {
    if (!applyProject) return;
    try {
      setApplying(true);
      const res = await axios.post(
        `${BASE_URL}/projects/${applyProject._id}/interest`,
        { message: pitch.trim() },
        { withCredentials: true }
      );
      setProjects((prev) =>
        prev.map((p) => (p._id === applyProject._id ? res.data.data : p))
      );
      setApplyProject(null);
      setPitch("");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setApplying(false);
    }
  };

  const decideInterest = async (project, userId, decision) => {
    try {
      setBusyId(project._id + userId);
      const res = await axios.post(
        `${BASE_URL}/projects/${project._id}/interest/${userId}/${decision}`,
        {},
        { withCredentials: true }
      );
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? res.data.data : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusyId(null);
    }
  };

  const deleteProject = async (project) => {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      setBusyId(project._id);
      await axios.delete(`${BASE_URL}/projects/${project._id}`, {
        withCredentials: true,
      });
      setProjects((prev) => prev.filter((p) => p._id !== project._id));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-50 py-12 pt-32 px-4">
      <div className="section-container">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-down">
          <span className="badge-primary">🚀 Collaboration Hub</span>
          <h1 className="text-5xl md:text-6xl font-black text-gradient mt-4 mb-3">
            Projects & Hackathons
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Find teammates for Unstop competitions, hackathons, open-source projects, and
            startup ideas — or post your own and recruit a team.
          </p>
        </div>

        {/* Live activity ticker */}
        {activity.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6 bg-white/70 backdrop-blur border border-white/40 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-accent-50">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary-700">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
              <span className="text-xs text-neutral-500">Real-time activity</span>
            </div>
            <ul className="divide-y divide-neutral-100 max-h-44 overflow-y-auto">
              {activity.map((evt, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-2 text-sm animate-slide-down">
                  {evt.by?.photoUrl ? (
                    <img src={evt.by.photoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <span className="text-lg">{evt.kind === "created" ? "🚀" : "🤝"}</span>
                  )}
                  <span className="flex-1 text-neutral-700 truncate">
                    <span className="font-semibold">{evt.by?.firstName || "Someone"}</span>{" "}
                    {evt.kind === "created" ? "posted" : "applied to"}{" "}
                    <span className="font-semibold text-neutral-900">"{evt.title}"</span>
                  </span>
                  <span className="text-xs text-neutral-400">just now</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Search + create */}
        <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition" />
            <div className="relative flex items-center bg-white rounded-2xl shadow-md border border-white/40 overflow-hidden">
              <div className="pl-4 text-primary-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchProjects()}
                placeholder="Search by title, description, or skill..."
                className="flex-1 py-3 px-3 bg-transparent focus:outline-none"
              />
              <button onClick={fetchProjects} className="m-1.5 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl">
                Search
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary whitespace-nowrap flex items-center gap-2"
          >
            <span className="text-xl">＋</span> Post a Project
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto mb-4 flex justify-center gap-2">
          {["All", "Mine", "Joined"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition ${
                tab === t
                  ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {t === "All" ? "🌍 Browse All" : t === "Mine" ? "👤 My Projects" : "✨ Joined"}
            </button>
          ))}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition ${
                category === c
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="card-elevated p-8 text-center max-w-md mx-auto">
            <div className="text-5xl mb-3">⚠️</div>
            <p className="text-neutral-700">{error}</p>
            <button onClick={fetchProjects} className="btn-primary mt-4">Retry</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="card-elevated p-10 text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">No projects yet</h2>
            <p className="text-neutral-600 mb-6">
              {tab === "Mine"
                ? "You haven't posted any projects. Be the first to recruit a team!"
                : tab === "Joined"
                ? "You haven't expressed interest in any projects yet."
                : "Try a different filter or post the first project."}
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Post a Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((p) => {
              const isOwner = p.createdBy?._id === me?._id;
              const myInterest = p.interested?.find((i) => i.user?._id === me?._id);
              const acceptedCount = p.interested?.filter(
                (i) => i.status === "accepted"
              ).length || 0;
              const deadlineSoon =
                p.deadline && new Date(p.deadline) - new Date() < 7 * 24 * 3600 * 1000;

              const score = skillMatchScore(me?.skills, p.skillsNeeded);

              return (
                <div key={p._id} className="card-elevated p-6 hover-lift animate-pop-in flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        CATEGORY_STYLES[p.category] || "bg-neutral-100 text-neutral-700 border-neutral-200"
                      }`}
                    >
                      {p.category}
                    </span>
                    <div className="flex items-center gap-2">
                      {score !== null && !isOwner && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            score >= 70
                              ? "bg-green-100 text-green-700 border-green-200"
                              : score >= 40
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-neutral-100 text-neutral-500 border-neutral-200"
                          }`}
                          title={`Your skills match ${score}% of what this project needs`}
                        >
                          {score >= 70 ? "🔥" : score >= 40 ? "✨" : "💡"} {score}% match
                        </span>
                      )}
                      {p.deadline && (
                        <span className={`text-xs font-semibold ${deadlineSoon ? "text-red-600" : "text-neutral-500"}`}>
                          ⏰ {new Date(p.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-neutral-900 leading-snug mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-3 mb-4">{p.description}</p>

                  {p.skillsNeeded?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {p.skillsNeeded.slice(0, 6).map((s, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-neutral-500 grid grid-cols-2 gap-2 mb-4">
                    <div>👥 Team of {p.teamSize}</div>
                    <div>📍 {p.location}</div>
                    <div>✨ {p.interested?.length || 0} interested</div>
                    <div>✅ {acceptedCount} on team</div>
                  </div>

                  {p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary-600 hover:underline mb-4 truncate"
                    >
                      🔗 {p.link}
                    </a>
                  )}

                  {/* Workspace entry — visible to owner + accepted members */}
                  {(isOwner || myInterest?.status === "accepted") && (
                    <Link
                      to={`/projects/${p._id}/workspace`}
                      className="mb-3 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 hover:from-primary-100 hover:to-accent-100 transition group"
                    >
                      <span className="text-xs font-bold text-primary-700">
                        🚀 Open Team Workspace
                      </span>
                      <span className="text-xs text-primary-600 group-hover:translate-x-0.5 transition-transform">
                        chat · tasks · members →
                      </span>
                    </Link>
                  )}

                  <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center gap-2">
                    <img
                      src={p.createdBy?.photoUrl || "https://placehold.co/40"}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="text-xs flex-1">
                      <div className="font-semibold text-neutral-800">
                        {p.createdBy?.firstName} {p.createdBy?.lastName || ""}
                      </div>
                      <div className="text-neutral-500">Posted by</div>
                    </div>
                    {isOwner ? (
                      <button
                        onClick={() => deleteProject(p)}
                        disabled={busyId === p._id}
                        className="text-xs px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-semibold border border-red-200"
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!myInterest) {
                            setApplyProject(p);
                            setPitch("");
                          } else {
                            toggleInterest(p);
                          }
                        }}
                        disabled={busyId === p._id}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                          myInterest
                            ? myInterest.status === "accepted"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : myInterest.status === "rejected"
                              ? "bg-neutral-100 text-neutral-500 border border-neutral-200"
                              : "bg-amber-100 text-amber-700 border border-amber-200"
                            : "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                        }`}
                      >
                        {myInterest
                          ? myInterest.status === "accepted"
                            ? "✓ On the Team"
                            : myInterest.status === "rejected"
                            ? "✗ Declined"
                            : "⏳ Withdraw"
                          : "🤝 Quick Apply"}
                      </button>
                    )}
                  </div>

                  {/* Owner inbox: review interested users */}
                  {isOwner && p.interested?.length > 0 && (
                    <details className="mt-3 text-xs">
                      <summary className="cursor-pointer font-semibold text-neutral-700 hover:text-primary-600">
                        📥 {p.interested.length} interested — review
                      </summary>
                      <ul className="mt-2 space-y-2">
                        {p.interested.map((i) => (
                          <li key={i.user?._id} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                            <img src={i.user?.photoUrl || "https://placehold.co/32"} alt="" className="w-7 h-7 rounded-full object-cover" />
                            <Link to={`/chat/${i.user?._id}`} className="flex-1 font-semibold hover:underline">
                              {i.user?.firstName} {i.user?.lastName || ""}
                            </Link>
                            {i.status === "pending" ? (
                              <>
                                <button
                                  onClick={() => decideInterest(p, i.user._id, "accepted")}
                                  disabled={busyId === p._id + i.user?._id}
                                  className="px-2 py-1 bg-green-500 text-white rounded font-semibold"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => decideInterest(p, i.user._id, "rejected")}
                                  disabled={busyId === p._id + i.user?._id}
                                  className="px-2 py-1 bg-neutral-300 text-neutral-700 rounded font-semibold"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className={`px-2 py-1 rounded font-semibold ${i.status === "accepted" ? "bg-green-100 text-green-700" : "bg-neutral-200 text-neutral-600"}`}>
                                {i.status}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Apply modal */}
      {applyProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">🤝 Quick Apply</h2>
                <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">
                  {applyProject.title}
                </p>
              </div>
              <button
                onClick={() => { setApplyProject(null); setPitch(""); }}
                className="text-2xl text-neutral-400 hover:text-neutral-600 leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Skill match reminder */}
              {(() => {
                const s = skillMatchScore(me?.skills, applyProject.skillsNeeded);
                return s !== null ? (
                  <div className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold border ${
                    s >= 70 ? "bg-green-50 border-green-200 text-green-700"
                    : s >= 40 ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-neutral-50 border-neutral-200 text-neutral-600"
                  }`}>
                    <span className="text-2xl">{s >= 70 ? "🔥" : s >= 40 ? "✨" : "💡"}</span>
                    <div>
                      <div>Your skills match <strong>{s}%</strong> of what's needed</div>
                      {applyProject.skillsNeeded?.length > 0 && (
                        <div className="font-normal text-xs mt-0.5 opacity-80">
                          Needed: {applyProject.skillsNeeded.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">
                  Your personal pitch <span className="font-normal text-neutral-400">(optional)</span>
                </label>
                <textarea
                  rows={5}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder="Tell the owner why you'd be a great fit — your relevant experience, what you'd bring to the team, or anything that makes you stand out..."
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none text-sm"
                />
                <div className="text-xs text-neutral-400 mt-1 text-right">{pitch.length}/500 chars</div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={applyWithPitch}
                  disabled={applying}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold shadow hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {applying ? "Sending..." : "🚀 Send Application"}
                </button>
                <button
                  onClick={() => { setApplyProject(null); setPitch(""); }}
                  className="px-5 py-3 rounded-xl border border-neutral-200 text-neutral-600 font-semibold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gradient">Post a New Project</h2>
              <button onClick={() => setShowCreate(false)} className="text-2xl text-neutral-400 hover:text-neutral-600">×</button>
            </div>
            <form onSubmit={submitCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Building an AI study buddy for Unstop Hackfest 2026"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What are you building? What problem does it solve? What's the timeline?"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Team size</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.teamSize}
                    onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Remote / Bengaluru / Hybrid"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Skills needed (comma separated)</label>
                <input
                  value={form.skillsNeeded}
                  onChange={(e) => setForm({ ...form, skillsNeeded: e.target.value })}
                  placeholder="React, Node.js, MongoDB, ML"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Link (optional)</label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://unstop.com/competitions/..."
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 disabled:opacity-60">
                  {creating ? "Posting..." : "🚀 Post Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
