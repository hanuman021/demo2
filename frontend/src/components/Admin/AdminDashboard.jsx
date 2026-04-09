import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axios';
import styles from './Admin.module.css';

const STATUS_COLORS = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  'in-transit': '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0, profit: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, ordersRes] = await Promise.all([
        axiosInstance.get('/admin/stats'),
        axiosInstance.get('/admin/orders'),
      ]);
      setStats(statsRes.data);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2>Admin Dashboard 🛠️</h2>
        <p>Overview of all logistics operations.</p>
      </div>

      {/* Stats cards */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statValue}>{loading ? '—' : stats.totalOrders}</div>
          <div className={styles.statLabel}>Total Orders</div>
        </div>
        <div className={`${styles.statCard} ${styles.green}`}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statValue}>{loading ? '—' : `₹${Number(stats.revenue || 0).toFixed(2)}`}</div>
          <div className={styles.statLabel}>Total Revenue</div>
        </div>
        <div className={`${styles.statCard} ${styles.purple}`}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statValue}>{loading ? '—' : `₹${Number(stats.profit || 0).toFixed(2)}`}</div>
          <div className={styles.statLabel}>Net Profit</div>
        </div>
        <div className={`${styles.statCard} ${styles.orange}`}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statValue}>
            {loading ? '—' : orders.filter((o) => o.status === 'delivered').length}
          </div>
          <div className={styles.statLabel}>Delivered</div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Orders Table */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>📋 All Orders</h3>
          <div className={styles.filterRow}>
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in-transit">In-Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
              {loading ? '⟳ Loading…' : '⟳ Refresh'}
            </button>
          </div>
        </div>

        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>No orders found for the selected filter.</p>
        )}

        {filtered.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Weight (kg)</th>
                  <th>Price (₹)</th>
                  <th>Delivery Agent</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id || order.id}>
                    <td className={styles.mono}>#{(order._id || order.id || '').slice(-6)}</td>
                    <td>{order.customer?.name || order.customerName || '—'}</td>
                    <td>{order.pickupAddress}</td>
                    <td>{order.deliveryAddress}</td>
                    <td>{order.weight}</td>
                    <td>{order.price ?? '—'}</td>
                    <td>{order.deliveryAgent?.name || order.agentName || '—'}</td>
                    <td>
                      <span
                        className={styles.badge}
                        style={{ background: STATUS_COLORS[order.status] || '#6b7280' }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
