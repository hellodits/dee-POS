import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Menu from './pages/Menu';
import Reservation from './pages/Reservation';
import Checkout from './pages/Checkout';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { CartProvider } from './context/CartContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccessPage orderData={{ orderId: "#ORD-2894", tableNumber: "Meja 5" }} />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);
