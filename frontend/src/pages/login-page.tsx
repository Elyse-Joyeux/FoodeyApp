import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout.js';
import { UserIcon, LockIcon, EyeOffIcon, ShieldIcon } from '../components/icons.js';
import card from '../components/auth-card.module.css';

/** Login screen with username/password, OTP option and links to sign up / forgot password. */
export function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      welcomeTop="Welcome"
      welcomeBottom="Back!"
      blurb="Sign in to continue to manage your restaurant like a pro."
    >
      <form className={card.card} onSubmit={submit}>
        <h2 className={card.title}>Login<span className={card.bang}>!</span></h2>
        <p className={card.sub}>Please enter your credentials below to continue</p>

        <label className={card.label}>Username</label>
        <div className={card.inputWrap}>
          <UserIcon size={20} />
          <input placeholder="Enter your username" defaultValue="admin" />
        </div>

        <label className={card.label}>Password</label>
        <div className={card.inputWrap}>
          <LockIcon size={20} />
          <input type={show ? 'text' : 'password'} placeholder="Enter your password" defaultValue="admin123" />
          <button type="button" className={card.eye} onClick={() => setShow((s) => !s)}><EyeOffIcon size={20} /></button>
        </div>

        <div className={card.row}>
          <label className={card.remember}><input type="checkbox" /> Remember me</label>
          <Link to="/forgot-password" className={card.link}>Forgot Password?</Link>
        </div>

        <button type="submit" className={card.primary}>Login</button>

        <div className={card.divider}>Or</div>

        <button type="button" className={card.outline}><ShieldIcon size={20} /> Login with OTP</button>

        <p className={card.footer}>
          Don't have an account? <Link to="/signup" className={card.link}>Sign Up</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
