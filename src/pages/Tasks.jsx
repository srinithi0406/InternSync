import { useState, useEffect, useRef } from "react";
import { supabase } from "../services/supabase";
import { motion, AnimatePresence } from "framer-motion";

// ── Constants ─────────────────────────────────────────────────────
const DIFFICULTIES = [
  { label: "Easy",   value: "easy",   color: "#00FF87" },
  { label: "Medium", value: "medium", color: "#F59E0B" },
  { label: "Hard",   value: "hard",   color: "#FF5F57" },
];

const STATUSES = [
  { label: "In Progress", value: "in_progress", color: "#F59E0B" },
  { label: "Completed",   value: "completed",   color: "#00FF87" },
  { label: "Blocked",     value: "blocked",     color: "#FF5F57" },
];

const FILTERS = [
  { label: "All",         value: "all"         },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed",   value: "completed"   },
  { label: "Blocked",     value: "blocked"     },
];

// Default skill suggestions shown in the dropdown
const DEFAULT_SKILLS = [
  "React", "CSS", "JavaScript", "TypeScript", "Node.js",
  "Git", "REST API", "SQL", "Debugging", "UI Design",
  "Figma", "Tailwind", "Next.js", "Python", "Testing",
];

// ── Field wrapper ─────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

// ── SkillInput ────────────────────────────────────────────────────
// 📚 This is a self-contained component that manages its own
//    local input state, but reports the final tags array upward
//    via the `onChange` prop (lifting state up pattern).
//
//    How it works:
//    1. User types in the input → filters DEFAULT_SKILLS for matches
//    2. Dropdown shows matching suggestions
//    3. Clicking a suggestion OR pressing Enter adds it as a tag
//    4. Tags render as removable pills above the input
//    5. Parent receives the updated array via onChange(newTags)
function SkillInput({ tags, onChange }) {
  const [input,    setInput]    = useState("");
  const [open,     setOpen]     = useState(false);
  const wrapRef = useRef(null);

  // Filter suggestions: matches input text, not already added
  const suggestions = DEFAULT_SKILLS.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  );

  // Add a skill tag (from suggestion click or Enter key)
  function addTag(skill) {
    const clean = skill.trim();
    if (!clean || tags.includes(clean)) return;
    onChange([...tags, clean]);
    setInput("");
    setOpen(false);
  }

  // Remove a tag by value
  function removeTag(skill) {
    onChange(tags.filter(t => t !== skill));
  }

  // Handle keyboard: Enter to add custom, Backspace to remove last
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault(); // don't submit the form
      if (input.trim()) addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
    if (e.key === "Escape") setOpen(false);
  }

  // Close dropdown when clicking outside the component
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="skill-input-wrap" ref={wrapRef}>

      {/* Tag pills + text input in one box */}
      <div className="skill-input-box">
        {/* Existing tags */}
        {tags.map(tag => (
          <span key={tag} className="skill-input-tag">
            {tag}
            <button
              type="button"
              className="skill-input-tag-remove"
              onClick={() => removeTag(tag)}
            >×</button>
          </span>
        ))}

        {/* Text input */}
        <input
          className="skill-input-field"
          type="text"
          placeholder={tags.length === 0 ? "Type a skill or pick below…" : "Add more…"}
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Dropdown suggestions */}
      <AnimatePresence>
        {open && (input.length > 0 ? suggestions : DEFAULT_SKILLS.filter(s => !tags.includes(s))).length > 0 && (
          <motion.div
            className="skill-dropdown"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {(input.length > 0 ? suggestions : DEFAULT_SKILLS.filter(s => !tags.includes(s))).map(s => (
              <button
                key={s}
                type="button"
                className="skill-dropdown-item"
                onMouseDown={e => { e.preventDefault(); addTag(s); }}
              >
                {s}
              </button>
            ))}

            {/* If user typed something not in defaults, show "Add custom" option */}
            {input.trim() && !DEFAULT_SKILLS.map(x => x.toLowerCase()).includes(input.trim().toLowerCase()) && (
              <button
                type="button"
                className="skill-dropdown-item skill-dropdown-custom"
                onMouseDown={e => { e.preventDefault(); addTag(input); }}
              >
                + Add "{input.trim()}"
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────
function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{   opacity: 0, y: 16, scale: 0.95  }}
          transition={{ duration: 0.3 }}
        >
          <span className="toast-icon">✓</span>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── TaskCard ──────────────────────────────────────────────────────
function TaskCard({ task, index, onDelete, onEdit, internshipTitle }) {
  const [hovered, setHovered] = useState(false);
  const status = STATUSES.find(s => s.value === task.status);
  const diff   = DIFFICULTIES.find(d => d.value === task.difficulty);

  return (
    <motion.div
      className={`task-card ${hovered ? "task-card--hovered" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="card-top-line"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      {internshipTitle && (
        <span className="card-internship-label">{internshipTitle}</span>
      )}

      <div className="card-header">
        <span className="card-title">{task.title}</span>
        <span className="card-hours">{task.hours_spent}h</span>
      </div>

      {task.description && (
        <p className="card-desc">{task.description}</p>
      )}

      {task.skills?.length > 0 && (
        <div className="card-skills">
          {task.skills.map(s => (
            <span key={s} className="skill-tag">{s}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div className="card-badges">
          {diff && (
            <span className="badge-diff"
              style={{ color: diff.color, background: `${diff.color}10`, borderColor: `${diff.color}28` }}>
              {diff.label}
            </span>
          )}
          {status && (
            <span className="badge-status" style={{ color: status.color }}>
              <span className="status-dot" style={{ background: status.color, boxShadow: `0 0 5px ${status.color}` }} />
              {status.label}
            </span>
          )}
        </div>
        <div className="card-meta">
          <span className="card-date">{task.date}</span>
          <button
            className={`btn-update ${hovered ? "btn-update--visible" : ""}`}
            onClick={() => onEdit(task)}
          >
            edit
          </button>
          <button
            className={`btn-delete ${hovered ? "btn-delete--visible" : ""}`}
            onClick={() => onDelete(task.id)}
          >
            delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
//  ADD TASK MODAL — 3 steps
// ════════════════════════════════════════════════════════════════
function Modal({ onClose, onSaved }) {
  const [step,   setStep]   = useState("pick");

  const [internships,        setInternships]        = useState([]);
  const [internshipsLoading, setInternshipsLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState(null);

  const [intTitle,     setIntTitle]     = useState("");
  const [intCompany,   setIntCompany]   = useState("");
  const [intStartDate, setIntStartDate] = useState("");
  const [intEndDate,   setIntEndDate]   = useState("");

  const [title,  setTitle]  = useState("");
  const [desc,   setDesc]   = useState("");
  const [date,   setDate]   = useState("");
  const [hours,  setHours]  = useState("");
  const [diff,   setDiff]   = useState("medium");
  const [status, setStatus] = useState("in_progress");
  const [skills, setSkills] = useState([]);   // ← skill tags array

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

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
      setInternshipsLoading(false);
    }
    load();
  }, []);

  const canSave = title.trim() && date && hours;

  async function createInternship() {
    if (!intTitle.trim() || !intCompany.trim()) return;
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: err } = await supabase
      .from("internships")
      .insert({ title: intTitle.trim(), company: intCompany.trim(), start_date: intStartDate || null, end_date: intEndDate || null, user_id: user.id })
      .select().single();
    setSaving(false);
    if (err) { setError("Couldn't create internship. Try again."); return; }
    setSelectedInternship(data);
    setStep("task");
  }

  async function saveTask() {
    if (!selectedInternship) return;
    setSaving(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    const { error: err } = await supabase.from("tasks").insert({
      title:         title.trim(),
      description:   desc.trim(),
      date,
      hours_spent:   Number(hours),
      difficulty:    diff,
      status,
      skills,                          // ← saved to skills text[] column
      internship_id: selectedInternship.id,
      user_id:       user.id,
    });
    setSaving(false);
    if (err) { setError("Couldn't save task. Try again."); return; }
    onSaved();
    onClose();
  }

  const stepIndex  = step === "pick" ? 1 : step === "new" ? 2 : 3;
  const totalSteps = 3;

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="modal"
        initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <p className="modal-step-label">Step {stepIndex} of {totalSteps}</p>
            <h2 className="modal-title">
              {step === "pick" && "Choose Internship"}
              {step === "new"  && "New Internship"}
              {step === "task" && "Log a Task"}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Progress bar */}
        <div className="modal-progress-track">
          <motion.div className="modal-progress-fill"
            animate={{ width: `${(stepIndex / totalSteps) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }} />
        </div>

        {/* Body */}
        <div className="modal-body">
          <AnimatePresence mode="wait">

            {/* Step 1 — Pick internship */}
            {step === "pick" && (
              <motion.div key="pick" className="modal-step"
                initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }}>

                <p className="step-hint">Tasks belong to an internship. Pick one or create a new folder.</p>

                {internshipsLoading && (
                  <div className="internship-list">
                    {[1, 2].map(i => <div key={i} className="internship-skeleton" />)}
                  </div>
                )}

                {!internshipsLoading && internships.length > 0 && (
                  <div className="internship-list">
                    {internships.map(int => (
                      <button key={int.id}
                        className={`internship-item ${selectedInternship?.id === int.id ? "internship-item--selected" : ""}`}
                        onClick={() => setSelectedInternship(int)}>
                        <span className="internship-item-icon">📁</span>
                        <div className="internship-item-text">
                          <span className="internship-item-title">{int.title}</span>
                          <span className="internship-item-company">{int.company}</span>
                        </div>
                        {selectedInternship?.id === int.id && <span className="internship-item-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}

                {!internshipsLoading && internships.length === 0 && (
                  <p className="step-hint" style={{ textAlign: "center", padding: "1rem 0" }}>
                    No internships yet. Create your first one below.
                  </p>
                )}

                <div className="or-divider">
                  <span className="or-line" /><span className="or-text">or</span><span className="or-line" />
                </div>
                <button className="btn-new-internship" onClick={() => setStep("new")}>
                  + Create New Internship
                </button>
              </motion.div>
            )}

            {/* Step 2 — New internship form */}
            {step === "new" && (
              <motion.div key="new" className="modal-step"
                initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }}>

                <Field label="Internship Title *">
                  <input autoFocus className="form-input" type="text" value={intTitle}
                    onChange={e => setIntTitle(e.target.value)} placeholder="e.g. Frontend Developer Intern" />
                </Field>
                <Field label="Company *">
                  <input className="form-input" type="text" value={intCompany}
                    onChange={e => setIntCompany(e.target.value)} placeholder="e.g. Acme Corp" />
                </Field>
                <div className="form-grid-2">
                  <Field label="Start Date">
                    <input className="form-input" type="date" value={intStartDate}
                      onChange={e => setIntStartDate(e.target.value)} />
                  </Field>
                  <Field label="End Date">
                    <input className="form-input" type="date" value={intEndDate}
                      onChange={e => setIntEndDate(e.target.value)} />
                  </Field>
                </div>
                {error && <p className="form-error">{error}</p>}
              </motion.div>
            )}

            {/* Step 3 — Task details */}
            {step === "task" && (
              <motion.div key="task" className="modal-step"
                initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }}>

                {selectedInternship && (
                  <div className="selected-internship-tag">
                    <span>📁</span>
                    <span>{selectedInternship.title} — {selectedInternship.company}</span>
                  </div>
                )}

                <Field label="Task Title *">
                  <input autoFocus className="form-input" type="text" value={title}
                    onChange={e => setTitle(e.target.value)} placeholder="e.g. Built auth flow with Supabase" />
                </Field>

                <Field label="Description">
                  <textarea className="form-input form-textarea" value={desc}
                    onChange={e => setDesc(e.target.value)} placeholder="What did you actually do?" rows={3} />
                </Field>

                <div className="form-grid-2">
                  <Field label="Date *">
                    <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                  </Field>
                  <Field label="Hours Spent *">
                    <input className="form-input" type="number" value={hours}
                      onChange={e => setHours(e.target.value)} placeholder="2.5" min="0.5" step="0.5" />
                  </Field>
                </div>

                {/* ── Skills ── */}
                <Field label="Skills Used">
                  <SkillInput tags={skills} onChange={setSkills} />
                </Field>

                <Field label="Difficulty">
                  <div className="toggle-group">
                    {DIFFICULTIES.map(d => (
                      <button key={d.value}
                        className={`toggle-btn ${diff === d.value ? "toggle-btn--active" : ""}`}
                        style={diff === d.value ? { color: d.color, background: `${d.color}12`, borderColor: `${d.color}35` } : {}}
                        onClick={() => setDiff(d.value)}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Status">
                  <div className="toggle-group">
                    {STATUSES.map(s => (
                      <button key={s.value}
                        className={`toggle-btn ${status === s.value ? "toggle-btn--active" : ""}`}
                        style={status === s.value ? { color: s.color, background: `${s.color}10`, borderColor: `${s.color}30` } : {}}
                        onClick={() => setStatus(s.value)}>
                        <span className="toggle-dot" style={{ background: s.color, opacity: status === s.value ? 1 : 0.3 }} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </Field>

                {error && <p className="form-error">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary"
            onClick={() => {
              if (step === "pick") onClose();
              if (step === "new")  setStep("pick");
              if (step === "task") setStep("pick");
            }}>
            {step === "pick" ? "Cancel" : "← Back"}
          </button>
          <motion.button
            className={`btn-primary ${
              (step === "pick" && !selectedInternship) ||
              (step === "new"  && (!intTitle.trim() || !intCompany.trim())) ||
              (step === "task" && !canSave)
                ? "btn-primary--disabled" : ""
            }`}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            disabled={saving}
            onClick={() => {
              if (step === "pick" && selectedInternship) setStep("task");
              if (step === "new")  createInternship();
              if (step === "task") saveTask();
            }}>
            {saving ? "Saving…" : step === "pick" ? "Continue →" : step === "new" ? "Create & Continue →" : "Save Task ✓"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── EditModal ─────────────────────────────────────────────────────
function EditModal({ task, onClose, onSaved }) {
  const [title,  setTitle]  = useState(task.title);
  const [desc,   setDesc]   = useState(task.description ?? "");
  const [hours,  setHours]  = useState(task.hours_spent);
  const [diff,   setDiff]   = useState(task.difficulty ?? "medium");
  const [status, setStatus] = useState(task.status ?? "in_progress");
  const [skills, setSkills] = useState(task.skills ?? []);  // ← pre-fill existing skills
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  async function handleUpdate() {
    setSaving(true);
    setError("");
    const { error: err } = await supabase
      .from("tasks")
      .update({ title: title.trim(), description: desc.trim(), hours_spent: Number(hours), difficulty: diff, status, skills })
      .eq("id", task.id);
    setSaving(false);
    if (err) { setError("Couldn't update. Try again."); return; }
    onSaved();
    onClose();
  }

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="modal"
        initial={{ scale: 0.93, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="modal-step-label">Editing Task</p>
            <h2 className="modal-title">Update Task</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-progress-track">
          <div className="modal-progress-fill" style={{ width: "100%" }} />
        </div>

        <div className="modal-body">
          <div className="modal-step">

            <Field label="Task Title *">
              <input autoFocus className="form-input" type="text"
                value={title} onChange={e => setTitle(e.target.value)} />
            </Field>

            <Field label="Description">
              <textarea className="form-input form-textarea" rows={3}
                value={desc} onChange={e => setDesc(e.target.value)} />
            </Field>

            <Field label="Hours Spent">
              <input className="form-input" type="number"
                value={hours} onChange={e => setHours(e.target.value)} min="0.5" step="0.5" />
            </Field>

            {/* ── Skills — pre-filled from existing task data ── */}
            <Field label="Skills Used">
              <SkillInput tags={skills} onChange={setSkills} />
            </Field>

            <Field label="Difficulty">
              <div className="toggle-group">
                {DIFFICULTIES.map(d => (
                  <button key={d.value}
                    className={`toggle-btn ${diff === d.value ? "toggle-btn--active" : ""}`}
                    style={diff === d.value ? { color: d.color, background: `${d.color}12`, borderColor: `${d.color}35` } : {}}
                    onClick={() => setDiff(d.value)}>
                    {d.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Status">
              <div className="toggle-group">
                {STATUSES.map(s => (
                  <button key={s.value}
                    className={`toggle-btn ${status === s.value ? "toggle-btn--active" : ""}`}
                    style={status === s.value ? { color: s.color, background: `${s.color}10`, borderColor: `${s.color}30` } : {}}
                    onClick={() => setStatus(s.value)}>
                    <span className="toggle-dot" style={{ background: s.color, opacity: status === s.value ? 1 : 0.3 }} />
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>

            {error && <p className="form-error">{error}</p>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <motion.button
            className="btn-primary"
            onClick={handleUpdate}
            disabled={saving || !title.trim()}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            {saving ? "Saving…" : "Save Changes ✓"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Tasks() {
  const [tasks,    setTasks]    = useState([]);
  const [open,     setOpen]     = useState(false);
  const [filter,   setFilter]   = useState("all");
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(false);
  const [editTask, setEditTask] = useState(null);

  function showToast() {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  async function fetchTasks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("tasks")
      .select("*, internships(title, company)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTasks(data ?? []);
    setLoading(false);
  }

  async function handleDelete(id) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  useEffect(() => { fetchTasks(); }, []);

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="tasks-page">

      <motion.div className="page-header" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="page-breadcrumb">InternSync / Tasks</p>
        <h1 className="page-title">Task Tracker</h1>
        <p className="page-subtitle">Log what you built. Track how you grew.</p>
      </motion.div>

      <motion.div className="filter-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        {FILTERS.map(f => (
          <button key={f.value}
            className={`filter-btn ${filter === f.value ? "filter-btn--active" : ""}`}
            onClick={() => setFilter(f.value)}>
            {f.label}
          </button>
        ))}
        <span className="task-count">{filtered.length} task{filtered.length !== 1 ? "s" : ""}</span>
      </motion.div>

      {loading && (
        <div className="task-grid">
          {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <span className="empty-icon">📋</span>
          <p className="empty-title">No tasks yet</p>
          <p className="empty-sub">Hit the button below to log your first task →</p>
        </motion.div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="task-grid">
          {filtered.map((task, i) => (
            <TaskCard key={task.id} task={task} index={i}
              onDelete={handleDelete}
              onEdit={task => setEditTask(task)}
              internshipTitle={task.internships?.title} />
          ))}
        </div>
      )}

      <motion.button className="fab" onClick={() => setOpen(true)}
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.3 }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <span className="fab-plus">+</span> Log Task
      </motion.button>

      <AnimatePresence>
        {open && (
          <Modal onClose={() => setOpen(false)}
            onSaved={() => { fetchTasks(); showToast(); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editTask && (
          <EditModal task={editTask}
            onClose={() => setEditTask(null)}
            onSaved={() => { fetchTasks(); showToast(); setEditTask(null); }} />
        )}
      </AnimatePresence>

      <Toast message="Task saved successfully! 🎉" visible={toast} />
    </div>
  );
}