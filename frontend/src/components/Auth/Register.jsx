import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

const ROLES = [
  { value: 'customer', label: 'Customer' },
  { value: 'delivery', label: 'Delivery Agent' },
  { value: 'admin', label: 'Admin' },
];

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'delivery') navigate('/delivery');
      else navigate('/customer');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.logo}>🚚 LogiTrack</h1>
        <h2 className={styles.title}>Create Account</h2>
        {error && <p className={styles.errorMsg}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Full Name</label>
          <input
            className={styles.input}
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            required
          />
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />
          <label className={styles.label}>Role</label>
          <select className={styles.input} name="role" value={form.role} onChange={handleChange}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link className={styles.link} to="/login">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
