import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import styles from './Customer.module.css';

const STATUS_COLORS = {
  pending: '#f59e0b',
  accepted: '#3b82f6',
  'in-transit': '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const [form, setForm] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    packageDetails: '',
    weight: '',
  });

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    setFetchError('');
    try {
      const { data } = await axiosInstance.get('/orders/my');
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      await axiosInstance.post('/orders', form);
      setSubmitSuccess('Order placed successfully! 🎉');
      setForm({ pickupAddress: '', deliveryAddress: '', packageDetails: '', weight: '' });
      fetchOrders();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h2>Welcome, {user?.name} 👋</h2>
        <p>Place new orders and track your deliveries below.</p>
      </div>

      {/* Create Order Form */}
      <section className={styles.card}>
        <h3 className={styles.sectionTitle}>📦 Create New Order</h3>
        {submitError && <p className={styles.error}>{submitError}</p>}
        {submitSuccess && <p className={styles.success}>{submitSuccess}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Pickup Address</label>
              <input
                className={styles.input}
                name="pickupAddress"
                placeholder="123 Main St, City"
                value={form.pickupAddress}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Delivery Address</label>
              <input
                className={styles.input}
                name="deliveryAddress"
                placeholder="456 Oak Ave, City"
                value={form.deliveryAddress}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Package Details</label>
              <input
                className={styles.input}
                name="packageDetails"
                placeholder="Fragile electronics, 2 boxes"
                value={form.packageDetails}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Weight (kg)</label>
              <input
                className={styles.input}
                type="number"
                name="weight"
                placeholder="5"
                min="0.1"
                step="0.1"
                value={form.weight}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <button className={styles.btn} type="submit" disabled={submitting}>
            {submitting ? 'Placing Order…' : 'Place Order'}
          </button>
        </form>
      </section>

      {/* Orders List */}
      <section className={styles.card}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>📋 My Orders</h3>
          <button className={styles.refreshBtn} onClick={fetchOrders} disabled={loadingOrders}>
            {loadingOrders ? '⟳ Loading…' : '⟳ Refresh'}
          </button>
        </div>
        {fetchError && <p className={styles.error}>{fetchError}</p>}
        {!loadingOrders && orders.length === 0 && (
          <p className={styles.empty}>No orders yet. Place your first order above!</p>
        )}
        <div className={styles.ordersGrid}>
          {orders.map((order) => (
            <div key={order._id || order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderId}>#{(order._id || order.id || '').slice(-6)}</span>
                <span
                  className={styles.status}
                  style={{ background: STATUS_COLORS[order.status] || '#6b7280' }}
                >
                  {order.status}
                </span>
              </div>
              <div className={styles.orderBody}>
                <p>
                  <strong>From:</strong> {order.pickupAddress}
                </p>
                <p>
                  <strong>To:</strong> {order.deliveryAddress}
                </p>
                <p>
                  <strong>Package:</strong> {order.packageDetails}
                </p>
                <p>
                  <strong>Weight:</strong> {order.weight} kg
                </p>
                {order.price !== undefined && (
                  <p>
                    <strong>Price:</strong> ₹{order.price}
                  </p>
                )}
              </div>
              <div className={styles.orderDate}>
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
