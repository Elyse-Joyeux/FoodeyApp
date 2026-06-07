import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout.js';
import { UserIcon, LockIcon, EyeOffIcon, ShieldIcon, BackIcon } from '../components/icons.js';
import { useUser } from '../context/user-context.js';
import card from '../components/auth-card.module.css';

/** Login screen with username/password, OTP option and links to sign up / forgot password. */
export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: 'admin@foodey.com',
    password: 'admin123',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      if (user) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      welcomeTop="Welcome"
      welcomeBottom="Back!"
      blurb="Sign in to continue to manage your restaurant like a pro."
    >
      <form className={card.card} onSubmit={submit}>
        <button type="button" className={card.backBtn} onClick={() => navigate('/')} aria-label="Back"><BackIcon size={18} /></button>
        <h2 className={card.title}>Login<span className={card.bang}>!</span></h2>
        <p className={card.sub}>Please enter your credentials below to continue</p>

        {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}

        <label className={card.label}>Email</label>
        <div className={card.inputWrap}>
          <UserIcon size={20} />
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <label className={card.label}>Password</label>
        <div className={card.inputWrap}>
          <LockIcon size={20} />
          <input
            type={show ? 'text' : 'password'}
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          <button type="button" className={card.eye} onClick={() => setShow((s) => !s)}><EyeOffIcon size={20} /></button>
        </div>

        <div className={card.row}>
          <label className={card.remember}><input type="checkbox" /> Remember me</label>
          <Link to="/forgot-password" className={card.link}>Forgot Password?</Link>
        </div>

        <button type="submit" className={card.primary} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className={card.divider}>Or</div>

        <button type="button" className={card.outline} disabled><ShieldIcon size={20} /> Login with OTP</button>

        <p className={card.footer}>
          Don't have an account? <Link to="/signup" className={card.link}>Sign Up</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
