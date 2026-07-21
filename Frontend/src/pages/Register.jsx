import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    firstname: "",
    lastname: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    axios
      .post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          email: form.email,
          fullname: {
            firstname: form.firstname,
            lastname: form.lastname,
          },
          password: form.password,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        navigate("/home");
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Registration failed. Please try again.");
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <div className="center-min-h-screen">
      <div className="auth-card" role="main" aria-labelledby="register-heading">
        <header className="auth-header">
          <h1 id="register-heading">Create account</h1>
          <p className="auth-sub">Join us and start exploring.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid-2">
            <div className="field-group">
              <label htmlFor="firstname">First name</label>
              <input
                id="firstname"
                name="firstname"
                placeholder="Jane"
                value={form.firstname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="lastname">Last name</label>
              <input
                id="lastname"
                name="lastname"
                placeholder="Doe"
                value={form.lastname}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="primary-btn" disabled={submitting}>
            {submitting ? "Creating..." : "Create Account"}
          </button>
        </form>
        <p className="auth-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
