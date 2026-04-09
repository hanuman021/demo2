import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
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
        <h2 className={styles.title}>Sign In</h2>
        {error && <p className={styles.errorMsg}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className={styles.label}>Password</label>
          <input
            className={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className={styles.switchText}>
          Don&apos;t have an account?{' '}
          <Link className={styles.link} to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
