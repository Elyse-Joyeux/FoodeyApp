import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout.js';
import { MailIcon, LockIcon, EyeOffIcon } from '../components/icons.js';
import card from '../components/auth-card.module.css';

/** Registration screen for new restaurant accounts. */
export function SignupPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <AuthLayout
      welcomeTop="Welcome to"
      welcomeBottom="Foodey!"
      blurb="Sign up and register your restaurant."
    >
      <form className={card.card} onSubmit={submit}>
        <h2 className={card.title}>Sign Up</h2>
        <p className={card.sub}>Please enter relevant information below to continue</p>

        <label className={card.label}>Email</label>
        <div className={card.inputWrap}>
          <MailIcon size={20} />
          <input type="email" placeholder="Enter your email address" />
        </div>

        <label className={card.label}>Password</label>
        <div className={card.inputWrap}>
          <LockIcon size={20} />
          <input type={show ? 'text' : 'password'} placeholder="Enter your password" />
          <button type="button" className={card.eye} onClick={() => setShow((s) => !s)}><EyeOffIcon size={20} /></button>
        </div>

        <label className={card.label}>Confirm Password</label>
        <div className={card.inputWrap}>
          <LockIcon size={20} />
          <input type="password" placeholder="Enter your password" />
          <button type="button" className={card.eye}><EyeOffIcon size={20} /></button>
        </div>

        <label className={card.terms}>
          <input type="checkbox" /> I agree to the <span className={card.link}>Terms &amp; Conditions</span>
        </label>

        <button type="submit" className={card.primary}>Submit</button>

        <p className={card.footer}>
          Already have an account? <Link to="/login" className={card.link}>Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
