import { useState, useEffect, useMemo } from "react";
import { supabase } from "../services/supabase";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell,
} from "recharts";


const C = {
  cyan:    "#00D4FF",
  green:   "#00FF87",
  violet:  "#8B5CF6",
  amber:   "#F59E0B",
  red:     "#FF5F57",
  surface: "#13181F",
  border:  "rgba(255,255,255,0.07)",
  text:    "#8892A4",
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && <p className="chart-tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? C.cyan }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}


function StatCard({ label, value, sub, color = C.cyan, delay = 0 }) {
  return (
    <motion.div
      className="glass-card stat-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{ borderColor: `${color}25` }}
    >
      <p className="page-breadcrumb" style={{ color }}>{label}</p>
      <p className="stat-value" style={{ color }}>{value}</p>
      {sub && <p className="page-subtitle" style={{ marginTop: "0.2rem" }}>{sub}</p>}
    </motion.div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────

function Section({ title, children, delay = 0 }) {
  return (
    <motion.div
      className="glass-card dash-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
    >
      <p className="page-breadcrumb" style={{ marginBottom: "1.25rem" }}>{title}</p>
      {children}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════
//  DASHBOARD PAGE
// ════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all tasks for this user ─────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("tasks")
        .select("title, date, hours_spent, difficulty, status, skills, internship_id, internships(title)")
        .eq("user_id", user.id)
        .order("date", { ascending: true }); // oldest first for timeline chart

      setTasks(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

 
  const stats = useMemo(() => {
    if (!tasks.length) return null;

    const totalHours = tasks.reduce((sum, t) => sum + (t.hours_spent ?? 0), 0);
    const completed  = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in_progress").length;

    // ── Skills frequency count ────────────────────────────────
  
    const skillMap = new Map();
    tasks.forEach(t => {
      (t.skills ?? []).forEach(s => {
        skillMap.set(s, (skillMap.get(s) ?? 0) + 1);
      });
    });
    const skillData = [...skillMap.entries()]
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // top 8 skills

    // ── Hours per week ─────────────────────────────────────────

    function getWeek(dateStr) {
      const d   = new Date(dateStr);
      const jan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d - jan) / 86400000 + jan.getDay() + 1) / 7);
      return `W${String(week).padStart(2, "0")}`;
    }

    const weekMap = new Map();
    tasks.forEach(t => {
      if (!t.date) return;
      const w = getWeek(t.date);
      weekMap.set(w, (weekMap.get(w) ?? 0) + (t.hours_spent ?? 0));
    });
    const weekData = [...weekMap.entries()]
      .map(([week, hours]) => ({ week, hours }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // ── Status distribution for Pie chart ─────────────────────
    const statusData = [
      { name: "Completed",   value: completed,  color: C.green  },
      { name: "In Progress", value: inProgress, color: C.amber  },
      { name: "Blocked",     value: tasks.filter(t => t.status === "blocked").length, color: C.red },
    ].filter(s => s.value > 0); // hide zero slices

    // ── Difficulty breakdown ───────────────────────────────────
    const diffData = [
      { name: "Easy",   value: tasks.filter(t => t.difficulty === "easy").length,   color: C.green  },
      { name: "Medium", value: tasks.filter(t => t.difficulty === "medium").length, color: C.amber  },
      { name: "Hard",   value: tasks.filter(t => t.difficulty === "hard").length,   color: C.red    },
    ];

    // ── Radar: top 6 skills scaled 0–10 ──────────────────────
    const maxCount  = Math.max(...skillData.map(s => s.count), 1);
    const radarData = skillData.slice(0, 6).map(s => ({
      skill: s.skill,
      level: Math.round((s.count / maxCount) * 10),
    }));

    return { totalHours, completed, inProgress, skillData, weekData, statusData, diffData, radarData, total: tasks.length };
  }, [tasks]);

  // ── Loading state ─────────────────────────────────────────────
  if (loading) return (
    <div className="tasks-page">
      <div className="page-header">
        <p className="page-breadcrumb">InternSync / Dashboard</p>
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
        {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 90 }} />)}
      </div>
    </div>
  );

  // ── No data state ─────────────────────────────────────────────
  if (!stats) return (
    <div className="tasks-page">
      <div className="page-header">
        <p className="page-breadcrumb">InternSync / Dashboard</p>
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="empty-state">
        <span className="empty-icon">📊</span>
        <p className="empty-title">No data yet</p>
        <p className="empty-sub">Log some tasks first and your dashboard will fill up.</p>
      </div>
    </div>
  );

  return (
    <div className="tasks-page">

      {/* ── Header ────────────────────────────────────────── */}
      <motion.div className="page-header" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="page-breadcrumb">InternSync / Dashboard</p>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your internship progress at a glance.</p>
      </motion.div>

      {/* ── Stat cards row ────────────────────────────────── */}
      <div className="dash-stats">
        <StatCard label="Total Tasks"   value={stats.total}      color={C.cyan}   delay={0}    />
        <StatCard label="Completed"     value={stats.completed}  color={C.green}  delay={0.07} />
        <StatCard label="In Progress"   value={stats.inProgress} color={C.amber}  delay={0.14} />
        <StatCard label="Hours Logged"  value={`${stats.totalHours}h`} color={C.violet} delay={0.21} />
      </div>

      {/* ── Charts grid ───────────────────────────────────── */}
      <div className="dash-grid">

        {/* Hours per week — Bar chart */}

        <Section title="Hours Logged per Week" delay={0.1}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.weekData} barSize={18}
              margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              {/* 📚 XAxis/YAxis: the axis labels. `tick` styles the text. */}
              <XAxis dataKey="week" tick={{ fill: C.text, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.text, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,212,255,0.05)" }} />
              {/* 📚 Bar: renders bars. `fill` is the bar colour.
                      `radius` rounds the top corners. */}
              <Bar dataKey="hours" name="Hours" fill={C.cyan} radius={[4, 4, 0, 0]}
                background={{ fill: "rgba(255,255,255,0.02)", radius: [4,4,0,0] }} />
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* Task status — Pie chart */}

        <Section title="Task Status Breakdown" delay={0.15}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats.statusData} cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                dataKey="value" nameKey="name"
                paddingAngle={3}
              >
                {/* 📚 Each Pie slice needs its own <Cell> for colour */}
                {stats.statusData.map((s, i) => (
                  <Cell key={i} fill={s.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend — built manually so it matches our design */}
          <div className="dash-legend">
            {stats.statusData.map(s => (
              <span key={s.name} className="dash-legend-item">
                <span className="dash-legend-dot" style={{ background: s.color }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </Section>

        {/* Top skills — horizontal bar */}

        <Section title="Most Used Skills" delay={0.2}>
          {stats.skillData.length === 0
            ? <p className="page-subtitle" style={{ textAlign:"center", padding:"2rem 0" }}>No skills tagged yet.</p>
            : (
              <ResponsiveContainer width="100%" height={Math.max(180, stats.skillData.length * 32)}>
                <BarChart data={stats.skillData} layout="vertical" barSize={12}
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                  <XAxis type="number" tick={{ fill: C.text, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="skill" width={80}
                    tick={{ fill: C.text, fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,212,255,0.05)" }} />
                  <Bar dataKey="count" name="Uses" fill={C.green} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </Section>

        {/* Skill radar */}
        <Section title="Skill Radar" delay={0.25}>
          {stats.radarData.length < 3
            ? <p className="page-subtitle" style={{ textAlign:"center", padding:"2rem 0" }}>Tag at least 3 different skills to see the radar.</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={stats.radarData} cx="50%" cy="50%" outerRadius={80}>
                  <PolarGrid stroke={C.border} />
                  <PolarAngleAxis dataKey="skill"
                    tick={{ fill: C.text, fontSize: 10, fontFamily: "JetBrains Mono" }} />
                  <Radar name="Skill level" dataKey="level"
                    stroke={C.violet} fill={C.violet} fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip content={<ChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            )
          }
        </Section>

        {/* Difficulty breakdown */}
        <Section title="Difficulty Breakdown" delay={0.3}>
          <div className="dash-diff-bars">
            {stats.diffData.map(d => {
              const pct = stats.total ? Math.round((d.value / stats.total) * 100) : 0;
              return (
                <div key={d.name} className="dash-diff-row">
                  <span className="dash-diff-label" style={{ color: d.color }}>{d.name}</span>
                  <div className="dash-diff-track">
                    {/* 📚 motion.div for animated bar fill — width goes from 0 to pct% */}
                    <motion.div
                      className="dash-diff-fill"
                      style={{ background: d.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                    />
                  </div>
                  <span className="dash-diff-count">{d.value} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </Section>

      </div>
    </div>
  );
}