import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  // Non-blocking session check: if already authenticated, redirect to /home.
  // Also serves as an asynchronous pre-warm ping for backend cold starts.
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        withCredentials: true,
      })
      .then(() => {
        navigate("/home", { replace: true });
      })
      .catch(() => {
        // Not logged in — user stays on landing page with zero delay
      });
  }, [navigate]);

  return (
    <div className="landing-page">
      <header className="top-nav">
        <div
          className="nav-left"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <span className="brand-icon" aria-hidden="true">
            <i className="robot ri-robot-2-fill"></i>
          </span>
          <span className="brand-text">Prompt Hub</span>
        </div>
        <div className="nav-right">
          <button className="secondary-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button
            className="primary-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </header>

      <div className="landing-wrapper">
        <div className="landing-card">
          <div className="chip">
            <h2>Use in Dark Theme</h2>
          </div>
          <h1>Prompt Hub</h1>
          <h3>
            Ask anything. Paste text, brainstorm ideas, or get quick
            explanations. Your chats stay in the sidebar so you can pick up
            where you left off.
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Landing;
