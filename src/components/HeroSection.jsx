import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { STATS } from "../data/homeData";
import { Link } from "react-router-dom";

function StatPill({ stat }) {
  return (
    <motion.div
      className="stat-pill"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <span
        className="stat-value"
        style={{ fontFamily: stat.mono ? "'JetBrains Mono', monospace" : "Syne, sans-serif" }}
      >
        {stat.value}
      </span>
      <span className="stat-label">{stat.label}</span>
    </motion.div>
  );
}


// ─── Aurora Background Component ─────────────────────────────────────────────
function AuroraBackground() {
  return (
    <div className="aurora-container" aria-hidden="true">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="grid-overlay" />
    </div>
  );
}


// ─── Hero Section ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  const ROLES = ["your tasks.", "your skills.", "your growth.", "your career."];
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);

  // IntersectionObserver: restart the typewriter every time the hero scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nowVisible = entry.isIntersecting;
        setIsVisible(nowVisible);

        // When the section becomes visible again, reset the typewriter
        if (nowVisible) {
          setRoleIndex(0);
          setDisplayed("");
          setDeleting(false);
        }
      },
      { threshold: 0.3 } // trigger when 30% of the hero is visible
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Typewriter effect — only runs when the hero is visible
  useEffect(() => {
    if (!isVisible) return;

    const currentRole = ROLES[roleIndex];

    const timer = setTimeout(() => {
      if (!deleting) {
        setDisplayed(currentRole.slice(0, displayed.length + 1));
        if (displayed.length + 1 === currentRole.length) {
          setTimeout(() => setDeleting(true), 1800);
        }
      } else {
        setDisplayed(currentRole.slice(0, displayed.length - 1));
        if (displayed.length === 0) {
          setDeleting(false);
          setRoleIndex((prev) => (prev + 1) % ROLES.length);
        }
      }
    }, deleting ? 40 : 80);

    return () => clearTimeout(timer);
  }, [displayed, deleting, roleIndex, isVisible]);

  return (
    <section className="hero-section" id="hero" ref={heroRef}>
      <AuroraBackground />

      {/* Floating badge */}
      <motion.div
        className="hero-badge"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="badge-dot" />
        Track. Reflect. Grow.
      </motion.div>

      {/* Main heading */}
      <motion.h1
        className="hero-title"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        Track
        <br />
        <span className="gradient-text">
          {displayed}
          <span className="cursor-blink">|</span>
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        className="hero-sub"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        InternSync is your internship OS — log tasks, visualise skill growth,
        write reflections, and generate a full report in one click.
      </motion.p>

      {/* CTA row */}
      <motion.div
        className="hero-cta-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <motion.div
  whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(0,212,255,0.5)" }}
  whileTap={{ scale: 0.97 }}
>
  <Link to="/tasks" className="btn-primary">
    Start Tracking Free
    <span className="btn-arrow">→</span>
  </Link>
</motion.div>

        <motion.a
          href="#features"
          className="btn-ghost"
          whileHover={{ scale: 1.03 }}
        >
          See Features
        </motion.a>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="hero-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {STATS.map((s) => <StatPill key={s.label} stat={s} />)}
      </motion.div>

      {/* Animated dashboard preview mockup */}
      <motion.div
        className="hero-mockup"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mockup-bar">
          <span className="dot dot-red" /><span className="dot dot-yellow" /><span className="dot dot-green" />
          <span className="mockup-url">internsync.app/dashboard</span>
        </div>
        <div className="mockup-content">
          {/* Fake task cards inside mockup */}
          {[
            { title: "Built auth flow", skill: "React", time: "3h", status: "Done", color: "#00FF87" },
            { title: "API integration", skill: "REST API", time: "2h", status: "Done", color: "#00D4FF" },
            { title: "Radar chart", skill: "D3.js", time: "1.5h", status: "In Progress", color: "#F59E0B" },
          ].map((task, i) => (
            <motion.div
              key={i}
              className="mockup-task"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + i * 0.15 }}
              style={{ borderLeftColor: task.color }}
            >
              <div className="mockup-task-top">
                <span className="mockup-task-title">{task.title}</span>
                <span className="mockup-task-status" style={{ color: task.color }}>{task.status}</span>
              </div>
              <div className="mockup-task-bottom">
                <span className="mockup-skill">{task.skill}</span>
                <span className="mockup-time">⏱ {task.time}</span>
              </div>
            </motion.div>
          ))}

          {/* Fake skill bars */}
          <div className="mockup-skills-row">
            {[
              { name: "React", pct: 80, color: "#00D4FF" },
              { name: "Git", pct: 65, color: "#00FF87" },
              { name: "API", pct: 72, color: "#8B5CF6" },
            ].map((skill, i) => (
              <div key={i} className="mockup-skill-bar-wrap">
                <span className="mockup-skill-name">{skill.name}</span>
                <div className="mockup-bar-track">
                  <motion.div
                    className="mockup-bar-fill"
                    style={{ background: skill.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.pct}%` }}
                    transition={{ delay: 1.6 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="scroll-line" />
        <span>scroll</span>
      </motion.div>
    </section>
  );
}
