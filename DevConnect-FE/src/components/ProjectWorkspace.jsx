import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import {
  joinProjectRoom,
  leaveProjectRoom,
  onProjectChatMessage,
  offProjectChatMessage,
  onProjectTaskAdded,
  offProjectTaskAdded,
  onProjectTaskUpdated,
  offProjectTaskUpdated,
  onProjectTaskDeleted,
  offProjectTaskDeleted,
} from "../utils/socketClient";

const TABS = [
  { key: "chat", label: "💬 Group Chat" },
  { key: "tasks", label: "✅ Tasks" },
  { key: "members", label: "👥 Team" },
  { key: "details", label: "📌 Details" },
];

const ProjectWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = useSelector((s) => s.user);
  const onlineSet = useSelector((s) => new Set(s.presence?.onlineUserIds || []));

  const [tab, setTab] = useState("chat");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  const scrollRef = useRef(null);

  const isOwner = useMemo(
    () => project && me && project.createdBy?._id === me._id,
    [project, me]
  );

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${BASE_URL}/projects/${id}/workspace`, {
        withCredentials: true,
      });
      const d = res.data.data;
      setProject(d.project);
      setMembers(d.members || []);
      setTasks(d.tasks || []);
      setMessages(d.messages || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Join socket room + subscribe to live events
  useEffect(() => {
    if (!project) return;
    joinProjectRoom(project._id);

    onProjectChatMessage(({ projectId, message }) => {
      if (projectId !== project._id) return;
      setMessages((prev) =>
        prev.some((m) => m._id === message._id) ? prev : [...prev, message]
      );
    });
    onProjectTaskAdded(({ projectId, task }) => {
      if (projectId !== project._id) return;
      setTasks((prev) =>
        prev.some((t) => t._id === task._id) ? prev : [...prev, task]
      );
    });
    onProjectTaskUpdated(({ projectId, task }) => {
      if (projectId !== project._id) return;
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    });
    onProjectTaskDeleted(({ projectId, taskId }) => {
      if (projectId !== project._id) return;
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    });

    return () => {
      offProjectChatMessage();
      offProjectTaskAdded();
      offProjectTaskUpdated();
      offProjectTaskDeleted();
      leaveProjectRoom(project._id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?._id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (tab === "chat" && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, tab]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/projects/${id}/messages`,
        { text: trimmed },
        { withCredentials: true }
      );
      // Optimistic — but the socket will also deliver the same message; the
      // dedupe on _id in the listener takes care of duplicates.
      setMessages((prev) =>
        prev.some((m) => m._id === res.data.data._id)
          ? prev
          : [...prev, res.data.data]
      );
      setText("");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSending(false);
    }
  };

  const addTask = async (e) => {
    e?.preventDefault();
    const trimmed = newTask.trim();
    if (!trimmed || addingTask) return;
    setAddingTask(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/projects/${id}/tasks`,
        { text: trimmed, assignedTo: newTaskAssignee || null },
        { withCredentials: true }
      );
      setTasks((prev) =>
        prev.some((t) => t._id === res.data.data._id)
          ? prev
          : [...prev, res.data.data]
      );
      setNewTask("");
      setNewTaskAssignee("");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setAddingTask(false);
    }
  };

  const toggleTask = async (task) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/projects/${id}/tasks/${task._id}`,
        { done: !task.done },
        { withCredentials: true }
      );
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data.data : t)));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const deleteTask = async (task) => {
    if (!confirm(`Delete task "${task.text}"?`)) return;
    try {
      await axios.delete(`${BASE_URL}/projects/${id}/tasks/${task._id}`, {
        withCredentials: true,
      });
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-4">
        <div className="card-elevated p-10 max-w-md mx-auto text-center">
          <div className="text-5xl mb-3">🔒</div>
          <h2 className="text-xl font-bold mb-2">Workspace unavailable</h2>
          <p className="text-neutral-600 mb-6">{error}</p>
          <button onClick={() => navigate("/projects")} className="btn-primary">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPct = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <div className="section-container max-w-6xl">
        {/* Header */}
        <div className="mb-6 animate-slide-down">
          <Link
            to="/projects"
            className="text-sm text-neutral-500 hover:text-primary-600"
          >
            ← Back to Projects
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
            <div>
              <span className="badge-primary">🚀 Team Workspace</span>
              <h1 className="text-3xl md:text-4xl font-black text-gradient mt-2">
                {project.title}
              </h1>
              <p className="text-neutral-600 mt-1 max-w-2xl">{project.description}</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex -space-x-2">
                {members.slice(0, 5).map((m) => (
                  <img
                    key={m._id}
                    src={m.photoUrl || "https://placehold.co/40"}
                    alt={m.firstName}
                    title={`${m.firstName} ${m.lastName || ""} (${m.role})`}
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                  />
                ))}
                {members.length > 5 && (
                  <span className="w-9 h-9 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-xs font-bold">
                    +{members.length - 5}
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-500">
                {members.length} of {project.teamSize} on the team
                {project.deadline && (
                  <>
                    {" · "}
                    <span>
                      ⏰ {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Task progress bar */}
          {tasks.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-neutral-500 mb-1">
                <span>
                  {completedCount} of {tasks.length} tasks done
                </span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition ${
                tab === t.key
                  ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "chat" && (
          <div className="card-elevated overflow-hidden flex flex-col h-[60vh]">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-neutral-50/50 to-white"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400">
                  <div className="text-5xl mb-2">💬</div>
                  <p className="font-semibold">Say hi to your team!</p>
                  <p className="text-xs">
                    All accepted members can chat here in real time.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const mine = m.senderId?._id === me?._id;
                  return (
                    <div
                      key={m._id}
                      className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}
                    >
                      <img
                        src={m.senderId?.photoUrl || "https://placehold.co/32"}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover mt-1"
                      />
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          mine
                            ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-br-sm"
                            : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm"
                        }`}
                      >
                        {!mine && (
                          <div className="text-xs font-bold mb-0.5 text-primary-700">
                            {m.senderId?.firstName} {m.senderId?.lastName || ""}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap break-words">
                          {m.text}
                        </div>
                        <div
                          className={`text-[10px] mt-1 ${
                            mine ? "text-white/70" : "text-neutral-400"
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form
              onSubmit={sendMessage}
              className="border-t border-neutral-100 p-3 flex gap-2 bg-white"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message your team..."
                className="flex-1 px-4 py-2.5 rounded-full border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="btn-primary px-5 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {tab === "tasks" && (
          <div className="card-elevated p-6">
            <form onSubmit={addTask} className="flex flex-col md:flex-row gap-2 mb-5">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a task — e.g. 'Wireframe the dashboard'"
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <select
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-neutral-200 outline-none"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.firstName} {m.lastName || ""}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!newTask.trim() || addingTask}
                className="btn-primary px-5 disabled:opacity-50"
              >
                ＋ Add
              </button>
            </form>

            {tasks.length === 0 ? (
              <div className="text-center py-12 text-neutral-400">
                <div className="text-5xl mb-2">📝</div>
                <p>No tasks yet — break the project into pieces and assign them.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li
                    key={t._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                      t.done
                        ? "bg-green-50/50 border-green-100"
                        : "bg-white border-neutral-100 hover:border-primary-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!t.done}
                      onChange={() => toggleTask(t)}
                      className="w-5 h-5 rounded accent-primary-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${
                          t.done
                            ? "line-through text-neutral-400"
                            : "text-neutral-800"
                        }`}
                      >
                        {t.text}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                        {t.assignedTo ? (
                          <span className="flex items-center gap-1">
                            <img
                              src={t.assignedTo.photoUrl || "https://placehold.co/16"}
                              alt=""
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            {t.assignedTo.firstName}
                          </span>
                        ) : (
                          <span>Unassigned</span>
                        )}
                        <span>·</span>
                        <span>by {t.createdBy?.firstName || "someone"}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(t)}
                      className="text-xs text-neutral-400 hover:text-red-500 px-2"
                      title="Delete task"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "members" && (
          <div className="card-elevated p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Team Members ({members.length})
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {members.map((m) => {
                const isOnline = onlineSet.has(m._id);
                return (
                  <li
                    key={m._id}
                    className="flex items-center gap-3 p-3 bg-white border border-neutral-100 rounded-xl"
                  >
                    <div className="relative">
                      <img
                        src={m.photoUrl || "https://placehold.co/48"}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          isOnline ? "bg-green-500" : "bg-neutral-300"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-neutral-900">
                        {m.firstName} {m.lastName || ""}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-2">
                        {m.role === "owner" ? (
                          <span className="text-amber-600 font-semibold">
                            👑 Owner
                          </span>
                        ) : (
                          <span>Member</span>
                        )}
                        <span>·</span>
                        <span>{isOnline ? "Online" : "Offline"}</span>
                      </div>
                    </div>
                    {m._id !== me?._id && (
                      <Link
                        to={`/chat/${m._id}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-semibold"
                      >
                        DM
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            {isOwner && project.interested?.some((i) => i.status === "pending") && (
              <div className="mt-6">
                <h4 className="text-sm font-bold text-neutral-700 mb-2">
                  Pending requests
                </h4>
                <p className="text-xs text-neutral-500 mb-3">
                  Manage applications from the Projects page (review &amp; accept).
                </p>
                <Link to="/projects" className="text-sm text-primary-600 hover:underline">
                  Go review →
                </Link>
              </div>
            )}
          </div>
        )}

        {tab === "details" && (
          <div className="card-elevated p-6 space-y-4">
            <div>
              <div className="text-xs uppercase font-bold text-neutral-500 mb-1">
                Category
              </div>
              <div className="font-semibold">{project.category}</div>
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-neutral-500 mb-1">
                Skills needed
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.skillsNeeded?.length > 0 ? (
                  project.skillsNeeded.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-full font-medium"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-neutral-400 text-sm">None listed</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase font-bold text-neutral-500 mb-1">
                  Team size
                </div>
                <div>{project.teamSize}</div>
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-neutral-500 mb-1">
                  Location
                </div>
                <div>{project.location}</div>
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-neutral-500 mb-1">
                  Deadline
                </div>
                <div>
                  {project.deadline
                    ? new Date(project.deadline).toLocaleDateString()
                    : "—"}
                </div>
              </div>
            </div>
            {project.link && (
              <div>
                <div className="text-xs uppercase font-bold text-neutral-500 mb-1">
                  External link
                </div>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 hover:underline break-all"
                >
                  {project.link}
                </a>
              </div>
            )}
            <div>
              <div className="text-xs uppercase font-bold text-neutral-500 mb-1">
                Posted by
              </div>
              <div className="flex items-center gap-2">
                <img
                  src={project.createdBy?.photoUrl || "https://placehold.co/32"}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-semibold">
                  {project.createdBy?.firstName} {project.createdBy?.lastName || ""}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectWorkspace;
