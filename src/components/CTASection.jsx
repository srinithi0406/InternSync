import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="section cta-section" id="get-started">
      <div className="cta-glow" />
      <motion.div
        className="cta-inner"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="cta-title">
          Your internship story
          <br />
          <span className="gradient-text">deserves to be tracked.</span>
        </h2>
        <p className="cta-sub">
          Start logging today. By the end, you'll have tasks, skills, reflections,
          and a report ready for your resume.
        </p>
        <motion.a
          href="#"
          className="btn-primary"
          whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(0,212,255,0.6)" }}
          whileTap={{ scale: 0.97 }}
        >
          Open InternSync Free
          <span className="btn-arrow">→</span>
        </motion.a>
      </motion.div>
    </section>
  );
}