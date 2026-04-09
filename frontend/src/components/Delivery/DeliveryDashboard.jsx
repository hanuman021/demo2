import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import styles from './Delivery.module.css';

const STATUS_COLORS = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  'in-transit': '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [loadingMine, setLoadingMine] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchAvailable = useCallback(async () => {
    setLoadingAvailable(true);
    try {
      const { data } = await axiosInstance.get('/orders/available');
      setAvailable(Array.isArray(data) ? data : data.orders || []);
    } catch {
      /* silently ignore */
    } finally {
      setLoadingAvailable(false);
    }
  }, []);

  const fetchMyDeliveries = useCallback(async () => {
    setLoadingMine(true);
    try {
      const { data } = await axiosInstance.get('/orders/my-deliveries');
      const list = Array.isArray(data) ? data : data.orders || [];
      setMyDeliveries(list);
      const total = list
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.deliveryFee || o.price || 0), 0);
      setEarnings(total);
    } catch {
      /* silently ignore */
    } finally {
      setLoadingMine(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailable();
    fetchMyDeliveries();
  }, [fetchAvailable, fetchMyDeliveries]);

  const acceptOrder = async (orderId) => {
    setActionError('');
    setActionSuccess('');
    try {
      await axiosInstance.put(`/orders/${orderId}/accept`);
      setActionSuccess('Order accepted! 🎉');
      fetchAvailable();
      fetchMyDeliveries();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to accept order.');
    }
  };

  const updateStatus = async (orderId, status) => {
    setActionError('');
    setActionSuccess('');
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status });
      setActionSuccess(`Status updated to "${status}".`);
      fetchMyDeliveries();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2>Delivery Dashboard 🚴</h2>
        <p>Hello, {user?.name}. Manage your deliveries and track your earnings.</p>
      </div>

      {/* Earnings summary */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>₹{earnings.toFixed(2)}</div>
          <div className={styles.statLabel}>Total Earnings</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{myDeliveries.filter((o) => o.status === 'delivered').length}</div>
          <div className={styles.statLabel}>Completed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {myDeliveries.filter((o) => ['accepted', 'in-transit'].includes(o.status)).length}
          </div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
      </div>

      {actionError && <p className={styles.error}>{actionError}</p>}
      {actionSuccess && <p className={styles.success}>{actionSuccess}</p>}

      {/* Available Orders */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>📦 Available Orders</h3>
          <button className={styles.refreshBtn} onClick={fetchAvailable} disabled={loadingAvailable}>
            {loadingAvailable ? '⟳ Loading…' : '⟳ Refresh'}
          </button>
        </div>
        {!loadingAvailable && available.length === 0 && (
          <p className={styles.empty}>No available orders at the moment.</p>
        )}
        <div className={styles.ordersGrid}>
          {available.map((order) => (
            <div key={order._id || order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>#{(order._id || order.id || '').slice(-6)}</span>
                <span className={styles.status} style={{ background: STATUS_COLORS[order.status] || '#6b7280' }}>
                  {order.status}
                </span>
              </div>
              <div className={styles.orderBody}>
                <p><strong>From:</strong> {order.pickupAddress}</p>
                <p><strong>To:</strong> {order.deliveryAddress}</p>
                <p><strong>Package:</strong> {order.packageDetails}</p>
                <p><strong>Weight:</strong> {order.weight} kg</p>
                {order.price !== undefined && <p><strong>Fee:</strong> ₹{order.price}</p>}
              </div>
              <button
                className={styles.acceptBtn}
                onClick={() => acceptOrder(order._id || order.id)}
              >
                Accept Order
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* My Active Deliveries */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>🛵 My Deliveries</h3>
          <button className={styles.refreshBtn} onClick={fetchMyDeliveries} disabled={loadingMine}>
            {loadingMine ? '⟳ Loading…' : '⟳ Refresh'}
          </button>
        </div>
        {!loadingMine && myDeliveries.length === 0 && (
          <p className={styles.empty}>You have not accepted any orders yet.</p>
        )}
        <div className={styles.ordersGrid}>
          {myDeliveries.map((order) => (
            <div key={order._id || order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>#{(order._id || order.id || '').slice(-6)}</span>
                <span className={styles.status} style={{ background: STATUS_COLORS[order.status] || '#6b7280' }}>
                  {order.status}
                </span>
              </div>
              <div className={styles.orderBody}>
                <p><strong>From:</strong> {order.pickupAddress}</p>
                <p><strong>To:</strong> {order.deliveryAddress}</p>
                <p><strong>Package:</strong> {order.packageDetails}</p>
                {order.deliveryFee !== undefined && <p><strong>Fee:</strong> ₹{order.deliveryFee}</p>}
              </div>
              {order.status === 'accepted' && (
                <button
                  className={styles.actionBtn}
                  onClick={() => updateStatus(order._id || order.id, 'in-transit')}
                >
                  Mark In-Transit
                </button>
              )}
              {order.status === 'in-transit' && (
                <button
                  className={`${styles.actionBtn} ${styles.deliveredBtn}`}
                  onClick={() => updateStatus(order._id || order.id, 'delivered')}
                >
                  Mark Delivered
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
