import { useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Auth() {
  const [isLogin,  setIsLogin]  = useState(true);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const navigate = useNavigate();

  async function handleAuth() {
    setError("");
    setLoading(true);

    const cleanEmail    = email.trim();
    const cleanPassword = password.trim();

    const res = isLogin
      ? await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword })
      : await supabase.auth.signUp({ email: cleanEmail, password: cleanPassword });

    setLoading(false);

    if (res.error) {
      setError(res.error.message);
    } else {
      navigate("/dashboard");
    }
  }

  // Allow submitting with Enter key
  function handleKeyDown(e) {
    if (e.key === "Enter") handleAuth();
  }

  return (
    <div className="auth-page">

      {/* Background aurora — reuses same blobs from home page */}
      <div className="aurora-container" aria-hidden="true">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="grid-overlay" />
      </div>

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="auth-logo">
          <span className="logo-icon">⟨IS⟩</span>
          <span className="logo-text">InternSync</span>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1 className="auth-title">
            {isLogin ? "Welcome back" : "Get started"}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Log in to continue tracking your internship."
              : "Create an account and start logging your journey."}
          </p>
        </div>

        {/* Form */}
        <div className="auth-form">

          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Error message — reuses existing form-error class */}
          {error && <p className="form-error">{error}</p>}

          {/* Submit — reuses existing btn-primary class */}
          <motion.button
            className="btn-primary auth-submit"
            onClick={handleAuth}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading
              ? <span className="auth-spinner" />
              : isLogin ? "Log In" : "Create Account"}
          </motion.button>
        </div>

        {/* Toggle login / signup */}
        <p className="auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            className="auth-toggle-btn"
            onClick={() => { setIsLogin(v => !v); setError(""); }}
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}