import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [ form, setForm ] = useState({ email: '', password: '' });
    const [ submitting, setSubmitting ] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Asynchronously pre-warm backend while user types credentials
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/health`).catch(() => {});
    }, []);
    
    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);

        axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            email: form.email,
            password: form.password
        },
            {
                withCredentials: true
            }
        ).then(() => {
            navigate("/home");
        }).catch((err) => {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Login failed. Please try again.");
            }
        }).finally(() => {
            setSubmitting(false);
        });

    }

    return (
        <div className="center-min-h-screen">
            <div className="auth-card" role="main" aria-labelledby="login-heading">
                <header className="auth-header">
                    <div className="auth-brand" aria-hidden="true">
                        <i className="ri-robot-2-fill" style={{ fontSize: '2rem', color: 'var(--color-primary)' }}></i>
                        <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: '1.1rem' }}>Prompt Hub</span>
                    </div>
                    <h1 id="login-heading">Sign in</h1>
                    <p className="auth-sub">Welcome back to Prompt Hub.</p>
                </header>
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="field-group">
                        <label htmlFor="login-email">Email</label>
                        <input id="login-email" name="email" type="email" autoComplete="email" placeholder="you@example.com"  onChange={handleChange} required />
                    </div>
                    <div className="field-group">
                        <label htmlFor="login-password">Password</label>
                        <input id="login-password" name="password" type="password" autoComplete="current-password" placeholder="Your password"  onChange={handleChange} required />
                    </div>
                    {error && <p className="error-text" role="alert">{error}</p>}
                    <button type="submit" className="primary-btn" disabled={submitting}>
                        {submitting ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                <p className="auth-alt">Need an account? <Link to="/register">Create one</Link></p>
            </div>
        </div>
    );
};

export default Login;