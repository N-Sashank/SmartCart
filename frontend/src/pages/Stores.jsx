import { useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { fetcher } from '../api/fetcher';
import api from '../api/axios';

function Stores() {
  const { data: auth } = useSWR('/auth/me', fetcher);
  const { data: stores, error, isLoading, mutate } = useSWR('/stores/get-stores', fetcher);

  const [name, setName] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isStoreOwner = auth?.user?.role === 'STORE_OWNER';

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await api.post('/stores/create-store', { name });
      setName('');
      mutate();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create store');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="alert alert-danger">Failed to load stores.</div>;

  const storeList = Array.isArray(stores) ? stores : stores?.stores ?? [];

  return (
    <div>
      <section className="mb-4">
        <div className="row align-items-center g-4">
          <div className="col-md-7">
            <h2 className="mb-2" style={{ color: 'var(--accent-brown)' }}>
              Welcome to SmartCart
            </h2>
            <p className="text-muted mb-2">
              A simple multi-store marketplace where local brands meet modern shoppers.
            </p>
            <ul className="text-muted small mb-0">
              <li>Discover curated stores managed by real store owners.</li>
              <li>Browse products, manage your cart, and track orders in one place.</li>
              <li>Store owners get a lightweight dashboard to manage their catalog.</li>
            </ul>
          </div>
          <div className="col-md-5">
            <div className="card border-0 shadow-sm">
            <img
  src="/smartcart-hero.png"
  alt="SmartCart shopping illustration"
  className="img-fluid rounded"
  style={{ width: '100%', height: 'auto' }}
/>
              <div className="card-body">
                <p className="card-text small text-muted mb-1">
                  SmartCart keeps things minimal and focused on what matters: products and orders.
                </p>
                <p className="card-text small mb-0">
                  Whether you are a <strong>customer</strong> or a <strong>store owner</strong>, this
                  dashboard gives you just enough to get things done.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title">Multi-store catalog</h6>
                <p className="card-text small text-muted mb-0">
                  Browse products across independent stores, each with their own inventory and style.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title">Simple cart & checkout</h6>
                <p className="card-text small text-muted mb-0">
                  Add items to your cart, review them in a clean list, and create orders with one click.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title">Owner tools</h6>
                <p className="card-text small text-muted mb-0">
                  Store owners can create stores, add products with images, and keep stock levels in sync.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Stores</h4>
          {isStoreOwner && (
            <span className="badge bg-light text-muted small">
              You are logged in as a <strong>STORE OWNER</strong>
            </span>
          )}
        </div>

        {isStoreOwner && (
          <div className="card mb-4">
            <div className="card-body">
              <h6 className="card-title">Create a new store</h6>
              {submitError && <div className="alert alert-danger py-2">{submitError}</div>}
              <form onSubmit={handleCreateStore} className="d-flex gap-2 flex-wrap">
                <input
                  type="text"
                  className="form-control"
                  style={{ maxWidth: 280 }}
                  placeholder="Store name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Add store'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="row g-3">
          {storeList.length === 0 ? (
            <p className="text-muted">No stores yet.</p>
          ) : (
            storeList.map((store) => (
              <div key={store.id} className="col-md-6 col-lg-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title">{store.name}</h6>
                    {store.description && (
                      <p className="card-text small text-muted">{store.description}</p>
                    )}
                    <Link to={`/stores/${store.id}`} className="btn btn-sm btn-primary">
                      View products
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="border-top pt-3 mt-4 small text-muted">
        <div className="row g-3">
          <div className="col-md-6">
            <p className="mb-1 fw-semibold">SmartCart</p>
            <p className="mb-0">
              A minimal multi-store demo built with React, SWR, and a Node.js backend.
            </p>
          </div>
          <div className="col-md-3">
            <p className="mb-1 fw-semibold">For customers</p>
            <ul className="list-unstyled mb-0">
              <li>Browse stores</li>
              <li>Manage your cart</li>
              <li>Track orders</li>
            </ul>
          </div>
          <div className="col-md-3">
            <p className="mb-1 fw-semibold">For store owners</p>
            <ul className="list-unstyled mb-0">
              <li>Create your store</li>
              <li>Add products with images</li>
              <li>Control stock levels</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Stores;
