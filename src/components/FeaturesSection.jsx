import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";
import { FEATURES } from "../data/homeData";

export default function FeaturesSection() {
  return (
    <section className="section features-section" id="features">
      <motion.div
        className="section-label"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        — What's Inside
      </motion.div>

      <motion.h2
        className="section-title"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Everything an intern
        <br />
        <span className="gradient-text-green">actually needs.</span>
      </motion.h2>

      {/* 📚 .map() over FEATURES array to render a FeatureCard for each item */}
      <div className="features-grid">
        {FEATURES.map((feature, index) => (
          <FeatureCard key={feature.title} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
}
