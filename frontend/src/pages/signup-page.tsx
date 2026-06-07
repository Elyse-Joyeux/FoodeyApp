import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout.js';
import { MailIcon, LockIcon, EyeOffIcon, BackIcon } from '../components/icons.js';
import { useUser } from '../context/user-context.js';
import card from '../components/auth-card.module.css';

/** Registration screen for new restaurant accounts. */
export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useUser();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    restaurantName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.restaurantName || !formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const user = await signup(formData.fullName, formData.email, formData.password, formData.restaurantName);
      if (user) {
        navigate('/dashboard');
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      welcomeTop="Welcome to"
      welcomeBottom="Foodey!"
      blurb="Sign up and register your restaurant."
    >
      <form className={card.card} onSubmit={submit}>
        <button type="button" className={card.backBtn} onClick={() => navigate('/')} aria-label="Back"><BackIcon size={18} /></button>
        <h2 className={card.title}>Sign Up</h2>
        <p className={card.sub}>Please enter relevant information below to continue</p>

        {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}

        <label className={card.label}>Full Name</label>
        <div className={card.inputWrap}>
          <input
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <label className={card.label}>Restaurant Name</label>
        <div className={card.inputWrap}>
          <input
            type="text"
            name="restaurantName"
            placeholder="Enter your restaurant name"
            value={formData.restaurantName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <label className={card.label}>Email</label>
        <div className={card.inputWrap}>
          <MailIcon size={20} />
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
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

        <label className={card.label}>Confirm Password</label>
        <div className={card.inputWrap}>
          <LockIcon size={20} />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <label className={card.terms}>
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            disabled={loading}
          /> I agree to the <span className={card.link}>Terms &amp; Conditions</span>
        </label>

        <button type="submit" className={card.primary} disabled={loading}>
          {loading ? 'Signing up...' : 'Submit'}
        </button>

        <p className={card.footer}>
          Already have an account? <Link to="/login" className={card.link}>Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
