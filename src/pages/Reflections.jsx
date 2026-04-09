import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { PenLine, Trophy, ShieldAlert, ArrowUpRight, BookOpen, Notebook } from "lucide-react";

const PROMPTS = [
  {
    key:         "content",
    label:       "What did I work on?",
    placeholder: "Describe the tasks, features, or problems you tackled this week…",
    icon:        <PenLine size={18} />,
  },
  {
    key:         "achievements",
    label:       "What went well?",
    placeholder: "Wins, breakthroughs, moments you're proud of…",
    icon:        <Trophy size={18} />,
  },
  {
    key:         "challenges",
    label:       "What was difficult?",
    placeholder: "Blockers, confusing concepts, things that took longer than expected…",
    icon:        <ShieldAlert size={18} />,
  },
  {
    key:         "next_steps",
    label:       "What's next?",
    placeholder: "Goals for next week, things to follow up on, skills to explore…",
    icon:        <ArrowUpRight size={18} />,
  },
];

// ── AutoTextarea ──────────────────────────────────────────────────

function AutoTextarea({ value, onChange, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = ref.current.scrollHeight + "px";
  }, [value]); // re-run every time value changes

  return (
    <textarea
      ref={ref}
      className="journal-textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
    />
  );
}

// ── InternshipPicker ──────────────────────────────────────────────

function InternshipPicker({ onPick }) {
  const [internships, setInternships] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("internships")
        .select("id, title, company")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setInternships(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <motion.div
      className="tasks-page"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="page-header">
        <p className="page-breadcrumb">InternSync / Reflections</p>
        <h1 className="page-title">Reflections</h1>
        <p className="page-subtitle">Choose an internship to open your journal.</p>
      </div>

      {loading && (
        <div className="internship-list">
          {[1, 2].map(i => <div key={i} className="internship-skeleton" />)}
        </div>
      )}

      {!loading && internships.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon"><Notebook size={40} color="var(--text-tertiary)" /></span>
          <p className="empty-title">No internships yet</p>
          <p className="empty-sub">Add an internship from the Tasks page first.</p>
        </div>
      )}

      {!loading && (
        <div className="internship-list">
          {internships.map(int => (
            <button
              key={int.id}
              className="internship-item"
              onClick={() => onPick(int)}
            >
              <span className="internship-item-icon"><BookOpen size={18} color="var(--cyan)" /></span>
              <div className="internship-item-text">
                <span className="internship-item-title">{int.title}</span>
                <span className="internship-item-company">{int.company}</span>
              </div>
              <span style={{ color: "var(--text-tertiary)", fontSize: "0.8rem" }}>Open →</span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── JournalPage ───────────────────────────────────────────────────

function JournalPage({ internship, onBack }) {
  // All past reflection entries for this internship
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  // The current draft being written

  const [draft, setDraft] = useState({
    content:     "",
    achievements: "",
    challenges:  "",
    next_steps:  "",
  });

  // Which past entry is being viewed (null = write new)
  const [viewing,  setViewing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false); // brief ✓ flash
  const [error, setError] = useState("");

  // ── Fetch past reflections ──────────────────────────────────────
  async function fetchEntries() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("reflections")
      .select("*")
      .eq("internship_id", internship.id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }); // newest first
    setEntries(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchEntries(); }, [internship.id]);

  // ── Update one field in the draft ─────────────────────────────
 
  function setField(key, value) {
    setDraft(prev => ({ ...prev, [key]: value }));
  }

  // ── Save to Supabase ──────────────────────────────────────────

  async function handleSave() {
  const hasContent = Object.values(draft).some((v) => v.trim());
  if (!hasContent) {
    console.log("Nothing to save");
    return;
  }

  setSaving(true);
  setError("");

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("AUTH USER:", user);
    console.log("AUTH USER ERROR:", userError);

    if (userError) {
      console.error("Error while getting logged-in user:", userError);
      setError(userError.message);
      setSaving(false);
      return;
    }

    if (!user) {
      console.error("No logged-in user found");
      setError("You must be logged in to save a reflection.");
      setSaving(false);
      return;
    }

    const payload = {
      internship_id: internship.id,
      user_id: user.id,
      content: draft.content.trim() || null,
      achievements: draft.achievements.trim() || null,
      challenges: draft.challenges.trim() || null,
      next_steps: draft.next_steps.trim() || null,
    };

    console.log("REFLECTION PAYLOAD TO INSERT:", payload);

    const { data, error } = await supabase
      .from("reflections")
      .insert(payload)
      .select();

    console.log("REFLECTION INSERT RESPONSE DATA:", data);
    console.log("REFLECTION INSERT RESPONSE ERROR:", error);

    if (error) {
      console.error("Supabase insert error:", error);
      setError(error.message || "Couldn't save reflection.");
      setSaving(false);
      return;
    }

    console.log("Reflection saved successfully");

    setDraft({
      content: "",
      achievements: "",
      challenges: "",
      next_steps: "",
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    fetchEntries();
  } catch (err) {
    console.error("Unexpected error in handleSave:", err);
    setError(err.message || "Something went wrong.");
  } finally {
    setSaving(false);
  }
}

  // ── Format date for display ───────────────────────────────────
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  // ── Is the draft empty? ───────────────────────────────────────
  const isEmpty = !Object.values(draft).some(v => v.trim());

  return (
    <div className="tasks-page">

      {/* Header */}
      <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="page-breadcrumb">
          {/* Clicking the breadcrumb goes back to internship picker */}
          <button className="journal-back-btn" onClick={onBack}>
            ← Reflections
          </button>
          {" / "}{internship.title}
        </p>
        <h1 className="page-title">My Journal</h1>
        <p className="page-subtitle">{internship.company}</p>
      </motion.div>

      <div className="journal-layout">

        {/* ── LEFT: Past entries list ─────────────────────── */}
        <motion.div
          className="journal-sidebar"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="journal-sidebar-heading">Past Entries</p>

          {loading && [1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: 56, marginBottom: "0.5rem" }} />
          ))}

          {!loading && entries.length === 0 && (
            <p className="journal-empty-hint">
              Your entries will appear here after you write your first one.
            </p>
          )}

        
          {entries.map(entry => (
            <button
              key={entry.id}
              className={`journal-entry-item ${viewing?.id === entry.id ? "journal-entry-item--active" : ""}`}
              onClick={() => setViewing(viewing?.id === entry.id ? null : entry)}
            >
              <span className="journal-entry-date">{fmtDate(entry.created_at)}</span>
              {/* Show a snippet of the first non-empty field */}
              <span className="journal-entry-preview">
                {(entry.content || entry.achievements || entry.challenges || entry.next_steps || "—")
                  .slice(0, 60)}…
              </span>
            </button>
          ))}

          {/* "New entry" button when viewing a past one */}
          {viewing && (
            <button
              className="btn-new-internship"
              style={{ marginTop: "0.75rem" }}
              onClick={() => setViewing(null)}
            >
              + New Entry
            </button>
          )}
        </motion.div>

        {/* ── RIGHT: Write area or read view ─────────────── */}
        <AnimatePresence mode="wait">

          {/* ── Read view: past entry ── */}
          {viewing && (
            <motion.div
              key={viewing.id}
              className="journal-paper"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Paper header */}
              <div className="journal-paper-header">
                <span className="journal-paper-date">{fmtDate(viewing.created_at)}</span>
                <span className="journal-paper-tag">{internship.title}</span>
              </div>

              {/* Read-only fields — only show fields that have content */}
              {PROMPTS.map(p => viewing[p.key] ? (
                <div key={p.key} className="journal-read-block">
                  <p className="journal-read-label">
                    {p.icon} {p.label}
                  </p>
                  <p className="journal-read-text">{viewing[p.key]}</p>
                </div>
              ) : null)}
            </motion.div>
          )}

          {/* ── Write view: new entry ── */}
          {!viewing && (
            <motion.div
              key="write"
              className="journal-paper"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Paper header — today's date */}
              <div className="journal-paper-header">
                <span className="journal-paper-date">{fmtDate(new Date().toISOString())}</span>
                <span className="journal-paper-tag">{internship.title}</span>
              </div>

              {/* Ruled lines decoration */}
              <div className="journal-lines" aria-hidden="true">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="journal-line" />
                ))}
              </div>

              {/* Each prompt section */}
              {PROMPTS.map((p, i) => (
                <motion.div
                  key={p.key}
                  className="journal-field"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <label className="journal-field-label">
                    <span className="journal-field-icon">{p.icon}</span>
                    {p.label}
                    <span className="journal-optional">optional</span>
                  </label>
                  <AutoTextarea
                    value={draft[p.key]}
                    onChange={e => setField(p.key, e.target.value)}
                    placeholder={p.placeholder}
                  />
                </motion.div>
              ))}

              {/* Save button */}
              <div className="journal-actions">
                <motion.button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={saving || isEmpty}
                  whileHover={{ scale: isEmpty ? 1 : 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    opacity: isEmpty ? 0.45 : 1,
                    cursor:  isEmpty ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Saving…" : saved ? "Saved ✓" : "Save Entry"}
                </motion.button>
                {!isEmpty && (
                  <button
                    className="btn-secondary"
                    onClick={() => setDraft({ content: "", achievements: "", challenges: "", next_steps: "" })}
                  >
                    Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────

export default function Reflections() {
  const [selectedInternship, setSelectedInternship] = useState(null);

  if (!selectedInternship) {
    return <InternshipPicker onPick={setSelectedInternship} />;
  }

  return (
    <JournalPage
      internship={selectedInternship}
      onBack={() => setSelectedInternship(null)}
    />
  );
}