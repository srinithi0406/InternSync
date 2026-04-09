import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AuthGuard({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  // Loading state
  if (user === undefined) {
    return (
      <div className="auth-guard-loading">
        <div className="auth-guard-spinner" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="auth-guard-wall">
        <motion.div
          className="auth-guard-card"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="auth-guard-icon">🔒</div>
          <h2 className="auth-guard-title">Sign in to continue</h2>
          <p className="auth-guard-sub">
            Please sign up or log in to access this page.
          </p>
          <div className="auth-guard-actions">
            <Link to="/auth" className="btn-primary auth-guard-btn">
              Sign Up / Log In
            </Link>
            <Link to="/" className="btn-secondary auth-guard-btn">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Authenticated — render page with back button
  return (
    <>
      <div className="back-to-home-bar">
        <Link to="/" className="back-to-home-link">
          <span className="back-to-home-arrow">←</span>
          Back to Home
        </Link>
      </div>
      {children}
    </>
  );
}
