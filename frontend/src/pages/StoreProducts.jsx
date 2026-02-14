import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { fetcher } from '../api/fetcher';
import api from '../api/axios';

function StoreProducts() {
  const { storeId } = useParams();
  const { data: auth } = useSWR('/auth/me', fetcher);
  const { data: products, error, isLoading, mutate } = useSWR(
    storeId ? `/products/${storeId}/products` : null,
    fetcher
  );

  const [form, setForm] = useState({ name: '', price: '', stock: '', imageUrl: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isStoreOwner = auth?.user?.role === 'STORE_OWNER';

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await api.post(`/products/${storeId}/add-product`, {
        name: form.name,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        imageUrl: form.imageUrl || undefined,
      });
      setForm({ name: '', price: '', stock: '', imageUrl: '' });
      mutate();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="alert alert-danger">Failed to load products.</div>;

  const productList = Array.isArray(products) ? products : products?.products ?? [];

  return (
    <div>
      <nav className="mb-3">
        <Link to="/stores">← Stores</Link>
      </nav>
      <h4 className="mb-4">Products</h4>

      {isStoreOwner && (
        <div className="card mb-4">
          <div className="card-body">
            <h6 className="card-title">Add Product</h6>
            {submitError && <div className="alert alert-danger py-2">{submitError}</div>}
            <form onSubmit={handleAddProduct}>
              <div className="row g-2">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    step="0.01"
                    className="form-control form-control-sm"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Stock"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    type="url"
                    className="form-control form-control-sm"
                    placeholder="Image URL"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary btn-sm w-100" disabled={submitting}>
                    {submitting ? '...' : 'Add'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row g-3">
        {productList.length === 0 ? (
          <p className="text-muted">No products in this store.</p>
        ) : (
          productList.map((product) => (
            <div key={product.id} className="col-md-6 col-lg-4">
              <div className="card h-100">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: 160, objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <h6 className="card-title">{product.name}</h6>
                  <p className="card-text small mb-2">₹ {Number(product.price).toFixed(2)} · Stock: {product.stock}</p>
                  <Link to={`/products/${product.id}`} className="btn btn-sm btn-primary">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StoreProducts;
