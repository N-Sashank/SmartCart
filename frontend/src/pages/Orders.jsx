import useSWR from 'swr';
import { fetcher } from '../api/fetcher';

function Orders() {
  const { data: orders, error, isLoading } = useSWR('/orders', fetcher);

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="alert alert-danger">Failed to load orders.</div>;

  const orderList = Array.isArray(orders) ? orders : orders?.orders ?? [];

  return (
    <div>
      <h4 className="mb-4">Orders</h4>

      {orderList.length === 0 ? (
        <p className="text-muted">No orders yet.</p>
      ) : (
        <div className="row g-3">
          {orderList.map((order) => {
            const createdAt = order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : '';
            const total = order.totalAmount != null ? Number(order.totalAmount).toFixed(2) : (order.total != null ? Number(order.total).toFixed(2) : null);
            const status = order.paymentStatus ?? order.status ?? 'COMPLETED';

            return (
              <div key={order.id} className="col-md-6">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="small text-muted">Order ID</div>
                        <div className="fw-semibold">{order.id}</div>
                      </div>
                      <span className="badge bg-light text-muted text-uppercase">
                        {status}
                      </span>
                    </div>
                    {createdAt && (
                      <div className="small text-muted mb-2">{createdAt}</div>
                    )}
                    {total && (
                      <div className="mb-2">
                        <span className="small text-muted me-1">Total:</span>
                        <span className="fw-semibold">${total}</span>
                      </div>
                    )}
                    {order.items?.length > 0 && (
                      <ul className="small mb-0 ps-3">
                        {order.items.map((oi, i) => (
                          <li key={i}>
                            {oi.product?.name ?? oi.name} × {oi.quantity}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
