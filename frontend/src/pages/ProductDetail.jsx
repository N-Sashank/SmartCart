import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { fetcher } from '../api/fetcher';
import api from '../api/axios';

function ProductDetail() {
  const { productId } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [adding, setAdding] = useState(false);

  const { data, error, isLoading } = useSWR(
    productId ? `/products/${productId}` : null,
    fetcher
  );

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setAdding(true);
    try {
      await api.post('/cart/add-item', { productId, quantity: quantity || 1 });
      setMessage({ type: 'success', text: 'Added to cart' });
    } catch (err) {
      const data = err.response?.data;
      const status = err.response?.status;
      let text = data?.error || data?.message || 'Failed to add to cart';
      if (status === 401) text = 'Please log in to add to cart.';
      setMessage({ type: 'danger', text });
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading...</div>;

  const product = data?.product ?? data;

  if (error || !product) return <div className="alert alert-danger">Product not found.</div>;

  return (
    <div>
      <nav className="mb-3">
        <Link to="/stores">← Back to stores</Link>
      </nav>

      <div className="card shadow-sm">
        <div className="row g-0">
          <div className="col-md-5">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="img-fluid rounded-start"
                style={{ height: '100%', objectFit: 'cover', minHeight: 220 }}
              />
            ) : (
              <div
                className="bg-light rounded-start d-flex align-items-center justify-content-center"
                style={{ minHeight: 220 }}
              >
                No image available
              </div>
            )}
          </div>
          <div className="col-md-7">
            <div className="card-body">
              <h4 className="card-title">{product.name}</h4>
              <p className="text-muted mb-1">
                Rs.{Number(product.price).toFixed(2)}
              </p>
              <p className="small mb-3">Stock: {product.stock}</p>
              <p className="card-text small">
                {product.description || 'This product does not have a description yet.'}
              </p>

              {message.text && (
                <div className={`alert alert-${message.type} py-2`}>{message.text}</div>
              )}

              <form onSubmit={handleAddToCart} className="d-flex align-items-center gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  className="form-control"
                  style={{ width: 90 }}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                />
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? 'Adding...' : 'Add to cart'}
                </button>
              </form>

              <div className="mt-3">
                <Link to="/cart" className="btn btn-outline-primary btn-sm">
                  View cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
