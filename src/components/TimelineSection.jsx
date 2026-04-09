import { useState } from "react";
import { motion } from "framer-motion";


export default function TimelineSection() {
  return (
    <section className="section timeline-section" id="timeline">
      <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        — Learning Journey
      </motion.div>
      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Watch yourself
        <br />
        <span className="gradient-text">grow, week by week.</span>
      </motion.h2>
 
      <div className="timeline-wrap">
        {/* The vertical gradient line */}
        <div className="timeline-line" />
 
        {TIMELINE.map((item, i) => (
          <motion.div
            key={i}
            className={`timeline-item ${i % 2 === 0 ? "timeline-left" : "timeline-right"}`}
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            {/* Dot on the line */}
            <div className="timeline-dot" />
 
            <div className="timeline-card glass-card">
              <span className="timeline-week">{item.week}</span>
              <p className="timeline-title">{item.title}</p>
              <span className="timeline-skill">{item.skill}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
 