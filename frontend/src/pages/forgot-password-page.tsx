import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout.js';
import { MailIcon, LockIcon } from '../components/icons.js';
import { BASE } from '../data/use-api.js';
import card from '../components/auth-card.module.css';

/** Password recovery screen. */
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (token && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE}/auth/${token ? 'reset-password' : 'forgot-password'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(token ? { token, password } : { email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');

      if (token) {
        navigate('/login');
      } else {
        setMessage(data.message || 'If the account exists, a reset link was generated.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      welcomeTop=""
      welcomeBottom=""
      blurb=""
      showFeatures={false}
    >
      <form className={card.card} onSubmit={submit}>
        <h2 className={card.title}>{token ? 'Reset Password' : 'Forgot Password'}</h2>
        <p className={card.sub}>
          {token ? 'Choose a new password for your Foodey account.' : 'Enter your email and we will generate a secure reset link.'}
        </p>

        {error && <div style={{ color: 'red', marginBottom: 10, fontSize: 14 }}>{error}</div>}
        {message && <div style={{ color: 'var(--foodey-orange)', marginBottom: 10, fontSize: 14 }}>{message}</div>}

        {token ? (
          <>
            <label className={card.label} htmlFor="reset-password">New Password</label>
            <div className={card.inputWrap}>
              <LockIcon size={20} />
              <input id="reset-password" name="password" type="password" autoComplete="new-password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            </div>

            <label className={card.label} htmlFor="reset-confirm-password">Confirm Password</label>
            <div className={card.inputWrap}>
              <LockIcon size={20} />
              <input id="reset-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
            </div>
          </>
        ) : (
          <>
            <label className={card.label} htmlFor="forgot-email">Email</label>
            <div className={card.inputWrap}>
              <MailIcon size={20} />
              <input id="forgot-email" name="email" type="email" autoComplete="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </>
        )}

        <div style={{ height: 16 }} />
        <button type="submit" className={card.primary} disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>

        <p className={card.footer}>
          Back to <Link to="/login" className={card.link}>Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
