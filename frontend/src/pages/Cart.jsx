import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import { fetcher } from '../api/fetcher';
import api from '../api/axios';

function Cart() {
  const navigate = useNavigate();
  const { data: cart, error, isLoading, mutate } = useSWR('/cart', fetcher);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const handleDelete = async (cartItemId) => {
    try {
      await api.delete(`/cart/delete/₹{cartItemId}`);
      mutate();
    } catch (err) {
      // optional: show a toast or inline error
    }
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    setCheckingOut(true);
    try {
      const { data } = await api.post('/checkout/create-razorpay-order');
      const { razorpayOrderId, amount, currency, keyId } = data;

      if (!window.Razorpay) {
        setCheckoutError('Payment script failed to load. Refresh and try again.');
        setCheckingOut(false);
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: 'SmartCart',
        description: 'Order payment',
        handler: async (response) => {
          try {
            await api.post('/checkout/verify-and-create-order', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            mutate();
            navigate('/orders');
          } catch (err) {
            setCheckoutError(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setCheckingOut(false);
          }
        },
        modal: {
          ondismiss: () => {
            setCheckingOut(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setCheckoutError('Payment failed. Please try again.');
        setCheckingOut(false);
      });
      rzp.open();
    } catch (err) {
      setCheckoutError(err.response?.data?.message || 'Checkout failed');
      setCheckingOut(false);
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="alert alert-danger">Failed to load cart.</div>;

  const items = Array.isArray(cart)
    ? cart
    : cart?.cart ?? cart?.items ?? cart?.cartItems ?? [];

  const subtotal = items.reduce((sum, item) => {
    const price = Number(item.product?.price ?? item.price ?? 0);
    const qty = Number(item.quantity ?? 1);
    return sum + price * qty;
  }, 0);

  return (
    <div>
      <h4 className="mb-4">Cart</h4>

      {checkoutError && <div className="alert alert-danger py-2">{checkoutError}</div>}

      {items.length === 0 ? (
        <p className="text-muted">Your cart is empty.</p>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <strong>Your items</strong>
              </div>
              <ul className="list-group list-group-flush">
                {items.map((item) => {
                  const product = item.product ?? item;
                  const linePrice = Number(product.price ?? 0);
                  const qty = Number(item.quantity ?? 1);
                  const lineTotal = linePrice * qty;
                  return (
                    <li
                      key={item.id}
                      className="list-group-item d-flex align-items-center"
                    >
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="rounded"
                          style={{ width: 56, height: 56, objectFit: 'cover' }}
                        />
                      )}
                      <div className="flex-grow-1 ms-3">
                        <div className="fw-semibold">{product.name}</div>
                        <div className="text-muted small">
                          ${linePrice.toFixed(2)} · Qty {qty}
                        </div>
                      </div>
                      <div className="text-end me-3">
                        <div className="fw-semibold">${lineTotal.toFixed(2)}</div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="card-title">Order summary</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-semibold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                >
                  {checkingOut ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

<div className="mt-4  border-red:hover">
  <Link to="/stores"  className="btn  border-black text-black">
    ← Continue shopping
  </Link>
</div>
    </div>
  );
}

export default Cart;
