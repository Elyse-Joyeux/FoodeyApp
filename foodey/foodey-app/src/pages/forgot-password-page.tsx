import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout.js';
import { UserIcon, MailIcon } from '../components/icons.js';
import card from '../components/auth-card.module.css';

/** Password recovery screen. */
export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <AuthLayout
      welcomeTop=""
      welcomeBottom=""
      blurb=""
      showFeatures={false}
    >
      <form className={card.card} onSubmit={submit}>
        <h2 className={card.title}>Forgot Password</h2>
        <p className={card.sub}>Please enter relevant information below to continue</p>

        <label className={card.label}>Username</label>
        <div className={card.inputWrap}>
          <UserIcon size={20} />
          <input placeholder="Enter your username" />
        </div>

        <label className={card.label}>Email</label>
        <div className={card.inputWrap}>
          <MailIcon size={20} />
          <input type="email" placeholder="Enter your email address" />
        </div>

        <div style={{ height: 16 }} />
        <button type="submit" className={card.primary}>Submit</button>

        <p className={card.footer}>
          Back to <Link to="/login" className={card.link}>Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
