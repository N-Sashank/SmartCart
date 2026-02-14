import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Stores from './pages/Stores';
import StoreProducts from './pages/StoreProducts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/stores"
            element={
              <ProtectedRoute>
                <Stores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores/:storeId"
            element={
              <ProtectedRoute>
                <StoreProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:productId"
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/stores" replace />} />
          <Route path="*" element={<Navigate to="/stores" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
