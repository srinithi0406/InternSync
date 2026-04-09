import { useState, useEffect } from "react";
import { motion } from "framer-motion";


export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="logo-text" style={{ opacity: 0.5 }}>InternSync</span>
        <span className="footer-copy">Built as a portfolio project. Open source.</span>
        <div className="footer-links">
          <a href="#" className="footer-link">GitHub</a>
          <a href="#" className="footer-link">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}