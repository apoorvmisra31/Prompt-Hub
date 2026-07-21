import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Landing = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  // If user is already logged in, redirect straight to /home
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        withCredentials: true,
      })
      .then(() => {
        navigate("/home", { replace: true });
      })
      .catch(() => {
        // Not logged in — stay on landing page
        setChecking(false);
      });
  }, [navigate]);

  if (checking) return null; // brief flash while verifying auth

  return (
    <div>
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
