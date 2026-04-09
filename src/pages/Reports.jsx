import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { supabase } from "../services/supabase";

export default function Reports() {
  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState("");
  const [selectedInternship, setSelectedInternship] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [reflections, setReflections] = useState([]);

  const [loadingInternships, setLoadingInternships] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const [report, setReport] = useState({
    overall_summary: "",
    achievements: [],
    challenges: [],
    skills_gained: [],
    reflection_summary: "",
    final_report: "",
  });

  useEffect(() => {
    fetchInternships();
  }, []);

  async function fetchInternships() {
    setLoadingInternships(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("User not logged in.");
      setLoadingInternships(false);
      return;
    }

    const { data, error } = await supabase
      .from("internships")
      .select("id, title, company, start_date, end_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch internships error:", error);
      setError("Could not load internships.");
      setLoadingInternships(false);
      return;
    }

    setInternships(data || []);
    setLoadingInternships(false);
  }

  async function fetchInternshipData(internshipId) {
    setLoadingData(true);
    setError("");

    const internshipObj = internships.find((i) => i.id === internshipId);
    setSelectedInternship(internshipObj || null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("User not logged in.");
      setLoadingData(false);
      return;
    }

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .eq("internship_id", internshipId)
      .order("date", { ascending: true });

    const { data: reflectionsData, error: reflectionsError } = await supabase
      .from("reflections")
      .select("*")
      .eq("user_id", user.id)
      .eq("internship_id", internshipId)
      .order("created_at", { ascending: true });

    if (tasksError) {
      console.error("Fetch tasks error:", tasksError);
      setError("Could not load tasks.");
      setLoadingData(false);
      return;
    }

    if (reflectionsError) {
      console.error("Fetch reflections error:", reflectionsError);
      setError("Could not load reflections.");
      setLoadingData(false);
      return;
    }

    setTasks(tasksData || []);
    setReflections(reflectionsData || []);
    setLoadingData(false);
  }

  async function handleGenerateReport() {
    if (!selectedInternshipId) {
      setError("Please select an internship first.");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          internship: selectedInternship,
          tasks,
          reflections,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Generate report backend error:", data);
        setError(data.error || "Failed to generate report.");
        setGenerating(false);
        return;
      }

      setReport({
        overall_summary: data.overall_summary || "",
        achievements: data.achievements || [],
        challenges: data.challenges || [],
        skills_gained: data.skills_gained || [],
        reflection_summary: data.reflection_summary || "",
        final_report: data.final_report || "",
      });
    } catch (err) {
      console.error("Generate report frontend error:", err);
      setError("Something went wrong while generating the report.");
    }

    setGenerating(false);
  }

  function handleExportMarkdown() {
    const markdown = `
# Internship Report

## Internship
- Title: ${selectedInternship?.title || ""}
- Company: ${selectedInternship?.company || ""}
- Start Date: ${selectedInternship?.start_date || ""}
- End Date: ${selectedInternship?.end_date || ""}

## Overall Summary
${report.overall_summary}

## Skills Gained
${report.skills_gained.map((item) => `- ${item}`).join("\n")}

## Final Report
${report.final_report}
`;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "internship-report.md";
    a.click();

    URL.revokeObjectURL(url);
  }

  function splitText(doc, text, maxWidth) {
    return doc.splitTextToSize(text || "", maxWidth);
  }

  function addSection(doc, title, contentLines, yRef) {
    const pageHeight = doc.internal.pageSize.height;
    const left = 15;

    if (yRef.value > pageHeight - 30) {
      doc.addPage();
      yRef.value = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, left, yRef.value);
    yRef.value += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    contentLines.forEach((line) => {
      if (yRef.value > pageHeight - 20) {
        doc.addPage();
        yRef.value = 20;
      }
      doc.text(line, left, yRef.value);
      yRef.value += 6;
    });

    yRef.value += 4;
  }

  function handleExportPDF() {
    const doc = new jsPDF();
    const yRef = { value: 20 };
    const width = 180;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Internship Report", 15, yRef.value);
    yRef.value += 12;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Title: ${selectedInternship?.title || ""}`, 15, yRef.value);
    yRef.value += 7;
    doc.text(`Company: ${selectedInternship?.company || ""}`, 15, yRef.value);
    yRef.value += 7;
    doc.text(`Start Date: ${selectedInternship?.start_date || ""}`, 15, yRef.value);
    yRef.value += 7;
    doc.text(`End Date: ${selectedInternship?.end_date || ""}`, 15, yRef.value);
    yRef.value += 12;

    addSection(doc, "Overall Summary", splitText(doc, report.overall_summary, width), yRef);
    addSection(
      doc,
      "Skills Gained",
      splitText(doc, report.skills_gained.map((s) => `• ${s}`).join("\n"), width),
      yRef
    );
    addSection(doc, "Final Report", splitText(doc, report.final_report, width), yRef);

    doc.save("internship-report.pdf");
  }

  function updateArrayField(field, index, value) {
    setReport((prev) => {
      const updated = [...prev[field]];
      updated[index] = value;
      return { ...prev, [field]: updated };
    });
  }

  return (
    <div className="tasks-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="page-breadcrumb">InternSync / Reports</p>
        <h1 className="page-title">AI Internship Report Generator</h1>
        <p className="page-subtitle">
          Generate a polished, professional internship report from your logged work.
        </p>
      </motion.div>

      <div className="filter-bar" style={{ gap: "1rem", flexWrap: "wrap" }}>
        <select
          className="form-input"
          value={selectedInternshipId}
          onChange={async (e) => {
            const id = e.target.value;
            setSelectedInternshipId(id);
            setReport({
              overall_summary: "",
              achievements: [],
              challenges: [],
              skills_gained: [],
              reflection_summary: "",
              final_report: "",
            });
            if (id) {
              await fetchInternshipData(id);
            } else {
              setSelectedInternship(null);
              setTasks([]);
              setReflections([]);
            }
          }}
          style={{ minWidth: "280px" }}
        >
          <option value="">Select Internship</option>
          {internships.map((internship) => (
            <option key={internship.id} value={internship.id}>
              {internship.title} — {internship.company}
            </option>
          ))}
        </select>

        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerateReport}
          disabled={generating || !selectedInternshipId || loadingData}
        >
          {generating ? "Generating..." : "Generate AI Report"}
        </motion.button>

        <button
          className="btn-secondary"
          onClick={handleExportMarkdown}
          disabled={!report.final_report}
        >
          Export Markdown
        </button>

        <button
          className="btn-secondary"
          onClick={handleExportPDF}
          disabled={!report.final_report}
        >
          Export PDF
        </button>
      </div>

      {loadingInternships && (
        <div className="empty-state">
          <p className="empty-title">Loading internships...</p>
        </div>
      )}

      {loadingData && (
        <div className="empty-state">
          <p className="empty-title">Loading internship data...</p>
        </div>
      )}

      {error && (
        <div className="form-error" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}

      {selectedInternship && !loadingData && (
        <div className="task-grid" style={{ marginTop: "2rem" }}>
          <div className="task-card">
            <div className="card-header">
              <span className="card-title">Source Data Overview</span>
            </div>
            <p className="card-desc">
              Tasks logged: {tasks.length}
            </p>
            <p className="card-desc">
              Reflections logged: {reflections.length}
            </p>
          </div>
        </div>
      )}

      {report.final_report && (
        <div style={{ marginTop: "2rem", display: "grid", gap: "1.25rem" }}>
          <div className="task-card">
            <h3 className="card-title" style={{ marginBottom: "1rem" }}>
              Overall Summary
            </h3>
            <textarea
              className="form-input form-textarea"
              rows={5}
              value={report.overall_summary}
              onChange={(e) =>
                setReport((prev) => ({ ...prev, overall_summary: e.target.value }))
              }
            />
          </div>

          <div className="task-card">
            <h3 className="card-title" style={{ marginBottom: "1rem" }}>
              Achievements
            </h3>
            {report.achievements.map((item, index) => (
              <textarea
                key={index}
                className="form-input form-textarea"
                rows={2}
                style={{ marginBottom: "0.75rem" }}
                value={item}
                onChange={(e) => updateArrayField("achievements", index, e.target.value)}
              />
            ))}
          </div>

          <div className="task-card">
            <h3 className="card-title" style={{ marginBottom: "1rem" }}>
              Challenges
            </h3>
            {report.challenges.map((item, index) => (
              <textarea
                key={index}
                className="form-input form-textarea"
                rows={2}
                style={{ marginBottom: "0.75rem" }}
                value={item}
                onChange={(e) => updateArrayField("challenges", index, e.target.value)}
              />
            ))}
          </div>

          <div className="task-card">
            <h3 className="card-title" style={{ marginBottom: "1rem" }}>
              Skills Gained
            </h3>
            {report.skills_gained.map((item, index) => (
              <textarea
                key={index}
                className="form-input form-textarea"
                rows={2}
                style={{ marginBottom: "0.75rem" }}
                value={item}
                onChange={(e) => updateArrayField("skills_gained", index, e.target.value)}
              />
            ))}
          </div>

          <div className="task-card">
            <h3 className="card-title" style={{ marginBottom: "1rem" }}>
              Reflection Summary
            </h3>
            <textarea
              className="form-input form-textarea"
              rows={5}
              value={report.reflection_summary}
              onChange={(e) =>
                setReport((prev) => ({ ...prev, reflection_summary: e.target.value }))
              }
            />
          </div>

          <div className="task-card">
            <h3 className="card-title" style={{ marginBottom: "1rem" }}>
              Final Report
            </h3>
            <textarea
              className="form-input form-textarea"
              rows={16}
              value={report.final_report}
              onChange={(e) =>
                setReport((prev) => ({ ...prev, final_report: e.target.value }))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}