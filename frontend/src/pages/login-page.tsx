import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout.js';
import { UserIcon, LockIcon, EyeOffIcon, ShieldIcon, BackIcon } from '../components/icons.js';
import { useUser } from '../context/user-context.js';
import card from '../components/auth-card.module.css';

/** Login screen with username/password, OTP option and links to sign up / forgot password. */
export function LoginPage() {
  const navigate = useNavigate();
  const { login, requestOtp, verifyOtp } = useUser();
  const [show, setShow] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
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
    setMessage('');

    if (!formData.email) {
      setError('Please enter your email');
      return;
    }

    if (otpMode) {
      if (!otpSent) {
        setLoading(true);
        try {
          setMessage(await requestOtp(formData.email));
          setOtpSent(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not send OTP');
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!formData.otp) {
        setError('Please enter your OTP code');
        return;
      }

      setLoading(true);
      try {
        const user = await verifyOtp(formData.email, formData.otp);
        if (user) navigate('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid OTP code');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
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
        {message && <div style={{ color: 'var(--foodey-orange)', marginBottom: '10px', fontSize: '14px' }}>{message}</div>}

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

        {otpMode ? (
          <>
            <label className={card.label}>OTP Code</label>
            <div className={card.inputWrap}>
              <ShieldIcon size={20} />
              <input
                name="otp"
                placeholder={otpSent ? 'Enter the 6-digit code' : 'Request a code first'}
                value={formData.otp}
                onChange={handleChange}
                disabled={loading || !otpSent}
                inputMode="numeric"
              />
            </div>
          </>
        ) : (
          <>
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
          </>
        )}

        <div className={card.row}>
          <label className={card.remember}><input type="checkbox" /> Remember me</label>
          <Link to="/forgot-password" className={card.link}>Forgot Password?</Link>
        </div>

        <button type="submit" className={card.primary} disabled={loading}>
          {loading ? 'Please wait...' : otpMode ? (otpSent ? 'Verify OTP' : 'Send OTP') : 'Login'}
        </button>

        <div className={card.divider}>Or</div>

        <button
          type="button"
          className={card.outline}
          onClick={() => {
            setOtpMode((mode) => !mode);
            setOtpSent(false);
            setError('');
            setMessage('');
          }}
        >
          <ShieldIcon size={20} /> {otpMode ? 'Use Password Login' : 'Login with OTP'}
        </button>

        <p className={card.footer}>
          Don't have an account? <Link to="/signup" className={card.link}>Sign Up</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
