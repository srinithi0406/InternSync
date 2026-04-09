import { useState } from "react";
import { motion } from "framer-motion";

export default function FeatureCard({ feature, index }) {
  // useState: hovering is either true or false. When it changes, React re-renders the card.
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      // initial/whileInView: animate when card scrolls INTO view (not just on page load)
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} // only animate once, not every time you scroll past
      transition={{ duration: 0.5, delay: index * 0.08 }}

      // Event handlers: these are React's way of responding to user actions
      onMouseEnter={() => setHovered(true)}   // () => ... is an arrow function
      onMouseLeave={() => setHovered(false)}  // setHovered(false) updates state → re-render

      className="feature-card"
      style={{
        // Conditional style: if hovered, show glow border, else show subtle border
        // This is the "ternary operator": condition ? valueIfTrue : valueIfFalse
        borderColor: hovered ? `${feature.color}40` : "rgba(255,255,255,0.07)",
        boxShadow: hovered ? `0 0 30px ${feature.color}18` : "none",
      }}
    >
      {/* The glowing left accent line — changes color per feature */}
      <div className="card-accent-line" style={{ background: feature.color }} />

      {/* Tag badge */}
      <span className="feature-tag" style={{ color: feature.color, borderColor: `${feature.color}30`, background: `${feature.color}10` }}>
        {feature.tag}
      </span>

      {/* Icon with glow background */}
      <div className="feature-icon" style={{ background: `${feature.color}12` }}>
        <feature.icon size={24} color={feature.color} strokeWidth={2} />
      </div>

      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-desc">{feature.desc}</p>
    </motion.div>
  );
}

