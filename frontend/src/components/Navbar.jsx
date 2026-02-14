import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/stores">
          <span
            className="me-2 rounded-circle d-inline-flex align-items-center justify-content-center"
            style={{
              width: 28,
              height: 28,
              backgroundColor: 'var(--accent-brown)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            S
          </span>
          <span className="fw-bold" style={{ color: 'var(--accent-brown)' }}>
            Smart<span style={{ color: '#a86b3a' }}>Cart</span>
          </span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          {token ? (
            <>
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/stores">
                    Stores
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/cart">
                    Cart
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/orders">
                    Orders
                  </Link>
                </li>
              </ul>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="ms-auto d-flex gap-2">
              <Link className="btn btn-outline-secondary btn-sm" to="/login">
                Login
              </Link>
              <Link className="btn btn-primary btn-sm" to="/register">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
