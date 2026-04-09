import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../services/supabase";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <span className="logo-icon">⟨IS⟩</span>
        <span className="logo-text">InternSync</span>
      </Link>

      {/* Nav links */}
      <div className="navbar-links">
        <Link to="/tasks" className="nav-link">Tasks</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/reflections" className="nav-link">Reflections</Link>
        <Link to="/reports" className="nav-link">Reports</Link>
      </div>

      {/* Auth section */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {user ? (
          <>
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              {user.email}
            </span>

            <motion.button
              onClick={handleLogout}
              className="navbar-cta"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Logout
            </motion.button>
          </>
        ) : (
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link to="/auth" className="navbar-cta">
              Login / Signup
            </Link>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}