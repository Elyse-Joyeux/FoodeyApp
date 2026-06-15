import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth-layout.js';
import { MailIcon, LockIcon, EyeOffIcon, BackIcon } from '../components/icons.js';
import { useUser } from '../context/user-context.js';
import card from '../components/auth-card.module.css';

const routeForUser = (user: Awaited<ReturnType<ReturnType<typeof useUser>['signup']>>) => {
  if (!user) return '/login';
  if (user.permissions.Dashboard) return '/dashboard';
  if (user.permissions.Inventory) return '/inventory';
  if (user.permissions.Orders) return '/orders';
  if (user.permissions.Reports) return '/reports';
  if (user.permissions.Settings) return '/profile';
  return '/profile';
};

/** Registration screen for new restaurant accounts. */
export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useUser();
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    restaurantName: '',
    email: '',
    restaurantType: 'Casual Dining',
    employeeCount: '12',
    chefCount: '3',
    serviceStyle: 'Dine-in and delivery',
    managerName: '',
    managerEmail: '',
    chefName: '',
    chefEmail: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    const checked = e.target instanceof HTMLInputElement ? e.target.checked : false;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const passwordChecks = [
    { label: 'At least 8 characters', ok: formData.password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', ok: /[a-z]/.test(formData.password) },
    { label: 'One number', ok: /\d/.test(formData.password) },
    { label: 'One symbol', ok: /[^A-Za-z0-9]/.test(formData.password) },
  ];
  const strongPassword = passwordChecks.every((item) => item.ok);

  const validateStep = () => {
    if (step === 0 && (!formData.fullName || !formData.email)) return 'Please enter your name and email.';
    if (step === 1 && (!formData.restaurantName || !formData.restaurantType || !formData.employeeCount || !formData.chefCount)) return 'Please complete your restaurant setup.';
    if (step === 2 && !strongPassword) return 'Please choose a stronger password.';
    if (step === 2 && formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    if (step === 2 && !formData.agreeTerms) return 'You must agree to the terms and conditions.';
    return '';
  };

  const nextStep = () => {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setStep((s) => Math.min(2, s + 1));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }

    setLoading(true);
    try {
      const user = await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        restaurantName: formData.restaurantName,
        restaurantType: formData.restaurantType,
        employeeCount: Number(formData.employeeCount),
        chefCount: Number(formData.chefCount),
        serviceStyle: formData.serviceStyle,
        managerName: formData.managerName,
        managerEmail: formData.managerEmail,
        chefName: formData.chefName,
        chefEmail: formData.chefEmail,
      });
      if (user) {
        navigate(routeForUser(user));
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
        <h2 className={card.title}>Create Your Foodey Workspace</h2>
        <p className={card.sub}>Step {step + 1} of 3: {['Owner profile', 'Restaurant setup', 'Secure access'][step]}</p>

        <div className={card.steps} aria-label="Signup progress">
          {[0, 1, 2].map((item) => <span key={item} className={`${card.stepDot} ${step >= item ? card.stepDotActive : ''}`} />)}
        </div>

        {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}

        {step === 0 && (
          <>
            <label className={card.label}>Full Name</label>
            <div className={card.inputWrap}>
              <input type="text" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} disabled={loading} />
            </div>

            <label className={card.label}>Email</label>
            <div className={card.inputWrap}>
              <MailIcon size={20} />
              <input type="email" name="email" placeholder="Enter your email address" value={formData.email} onChange={handleChange} disabled={loading} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <label className={card.label}>Restaurant Name</label>
            <div className={card.inputWrap}>
              <input type="text" name="restaurantName" placeholder="Enter your restaurant name" value={formData.restaurantName} onChange={handleChange} disabled={loading} />
            </div>

            <label className={card.label}>Restaurant Type</label>
            <div className={card.inputWrap}>
              <select name="restaurantType" value={formData.restaurantType} onChange={handleChange} disabled={loading}>
                <option>Casual Dining</option>
                <option>Fine Dining</option>
                <option>Cafe and Bakery</option>
                <option>Fast Casual</option>
                <option>Food Truck</option>
              </select>
            </div>

            <div className={card.twoCols}>
              <div>
                <label className={card.label}>Employees</label>
                <div className={card.inputWrap}><input type="number" min="1" name="employeeCount" value={formData.employeeCount} onChange={handleChange} disabled={loading} /></div>
              </div>
              <div>
                <label className={card.label}>Chefs</label>
                <div className={card.inputWrap}><input type="number" min="1" name="chefCount" value={formData.chefCount} onChange={handleChange} disabled={loading} /></div>
              </div>
            </div>

            <label className={card.label}>Service Style</label>
            <div className={card.inputWrap}>
              <select name="serviceStyle" value={formData.serviceStyle} onChange={handleChange} disabled={loading}>
                <option>Dine-in and delivery</option>
                <option>Dine-in only</option>
                <option>Delivery first</option>
                <option>Reservations focused</option>
              </select>
            </div>

            <p className={card.sectionNote}>Optional team setup</p>
            <div className={card.twoCols}>
              <div>
                <label className={card.label}>Manager Name</label>
                <div className={card.inputWrap}><input name="managerName" placeholder="e.g. Aline Uwase" value={formData.managerName} onChange={handleChange} disabled={loading} /></div>
              </div>
              <div>
                <label className={card.label}>Manager Email</label>
                <div className={card.inputWrap}><input type="email" name="managerEmail" placeholder="manager@restaurant.com" value={formData.managerEmail} onChange={handleChange} disabled={loading} /></div>
              </div>
            </div>
            <div className={card.twoCols}>
              <div>
                <label className={card.label}>Head Chef Name</label>
                <div className={card.inputWrap}><input name="chefName" placeholder="e.g. Claude Ndayisaba" value={formData.chefName} onChange={handleChange} disabled={loading} /></div>
              </div>
              <div>
                <label className={card.label}>Chef Email</label>
                <div className={card.inputWrap}><input type="email" name="chefEmail" placeholder="chef@restaurant.com" value={formData.chefEmail} onChange={handleChange} disabled={loading} /></div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <label className={card.label}>Password</label>
            <div className={card.inputWrap}>
              <LockIcon size={20} />
              <input type={show ? 'text' : 'password'} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} disabled={loading} />
              <button type="button" className={card.eye} onClick={() => setShow((s) => !s)}><EyeOffIcon size={20} /></button>
            </div>
            <div className={card.passwordRules}>
              {passwordChecks.map((rule) => <span key={rule.label} className={rule.ok ? card.ruleOk : card.rule}>{rule.label}</span>)}
            </div>

            <label className={card.label}>Confirm Password</label>
            <div className={card.inputWrap}>
              <LockIcon size={20} />
              <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} disabled={loading} />
              <button type="button" className={card.eye} onClick={() => setShowConfirm((s) => !s)}><EyeOffIcon size={20} /></button>
            </div>

            <label className={card.terms}>
              <input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} disabled={loading} /> I agree to the <span className={card.link}>Terms &amp; Conditions</span>
            </label>
          </>
        )}

        <div className={card.stepActions}>
          {step > 0 && <button type="button" className={card.secondary} onClick={() => setStep((s) => s - 1)} disabled={loading}>Back</button>}
          {step < 2 ? (
            <button type="button" className={card.primary} onClick={nextStep} disabled={loading}>Continue</button>
          ) : (
            <button type="submit" className={card.primary} disabled={loading}>{loading ? 'Creating workspace...' : 'Create Workspace'}</button>
          )}
        </div>

        <p className={card.footer}>
          Already have an account? <Link to="/login" className={card.link}>Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
