"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface EditModalProps {
  id: number;
  movieTitle: string;
  sceneTitle: string;
  description: string | null;
  onClose: () => void;
}

export default function EditModal({
  id,
  movieTitle,
  sceneTitle,
  description,
  onClose,
}: EditModalProps) {
  const router = useRouter();
  const [form, setForm] = useState({ movieTitle, sceneTitle, description: description ?? "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save.");
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Edit scene</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="edit-movieTitle" className="block text-sm font-medium text-neutral-300 mb-1.5">
              Movie title <span className="text-red-400">*</span>
            </label>
            <input
              id="edit-movieTitle"
              name="movieTitle"
              type="text"
              required
              value={form.movieTitle}
              onChange={handleChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="edit-sceneTitle" className="block text-sm font-medium text-neutral-300 mb-1.5">
              Scene title <span className="text-red-400">*</span>
            </label>
            <input
              id="edit-sceneTitle"
              name="sceneTitle"
              type="text"
              required
              value={form.sceneTitle}
              onChange={handleChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-neutral-300 mb-1.5">
              Description <span className="text-neutral-600">(optional)</span>
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-yellow-400 transition-colors resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-200 text-sm transition-colors px-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
