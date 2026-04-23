import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dismissToast } from "../utils/toastSlice";
import { useNavigate } from "react-router-dom";

const COLORS = {
  info: "from-primary-500 to-accent-500",
  success: "from-emerald-500 to-teal-500",
  warning: "from-amber-500 to-orange-500",
  error: "from-rose-500 to-red-500",
};

const Toast = ({ toast }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => dispatch(dismissToast(toast.id)), 6000);
    return () => clearTimeout(t);
  }, [toast.id, dispatch]);

  const handleClick = () => {
    if (toast.to) navigate(toast.to);
    dispatch(dismissToast(toast.id));
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl shadow-2xl bg-white border border-white/40 max-w-sm w-full animate-slide-up`}
    >
      <div
        className={`absolute inset-0 opacity-10 bg-gradient-to-br ${COLORS[toast.level || "info"]}`}
      />
      <div className="relative p-4 flex items-start gap-3">
        {toast.photoUrl ? (
          <img
            src={toast.photoUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow"
          />
        ) : (
          <div className="text-2xl">{toast.icon || "🔔"}</div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-neutral-900 truncate">
            {toast.title}
          </div>
          {toast.body && (
            <div className="text-xs text-neutral-600 mt-0.5 line-clamp-2">
              {toast.body}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch(dismissToast(toast.id));
          }}
          className="text-neutral-300 hover:text-neutral-600"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div
        className={`h-1 bg-gradient-to-r ${COLORS[toast.level || "info"]} animate-[shrink_6s_linear_forwards]`}
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
};

const Toaster = () => {
  const items = useSelector((s) => s.toast.items);
  if (!items?.length) return null;
  return (
    <div className="fixed top-24 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {items.map((t) => (
          <Toast key={t.id} toast={t} />
        ))}
      </div>
    </div>
  );
};

export default Toaster;
