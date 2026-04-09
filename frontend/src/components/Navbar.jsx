import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return { to: '/admin', label: 'Admin Dashboard' };
    if (user.role === 'delivery') return { to: '/delivery', label: 'Delivery Dashboard' };
    return { to: '/customer', label: 'My Orders' };
  };

  const rl = roleLink();

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        🚚 LogiTrack
      </Link>
      <div className={styles.menu}>
        {rl && (
          <Link className={styles.navLink} to={rl.to}>
            {rl.label}
          </Link>
        )}
        {user ? (
          <>
            <span className={styles.userBadge}>
              {user.name} <em>({user.role})</em>
            </span>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className={styles.navLink} to="/login">
              Login
            </Link>
            <Link className={styles.navLink} to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
