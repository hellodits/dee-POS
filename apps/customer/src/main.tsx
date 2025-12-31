import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import HomePage from './pages/HomePage';
import Menu from './pages/Menu';
import Reservation from './pages/Reservation';
import ReservationSuccess from './pages/ReservationSuccess';
import Checkout from './pages/Checkout';
import OrderSuccessPage from './pages/OrderSuccessPage';
import { CartProvider } from './context/CartContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/reservation/success" element={<ReservationSuccess />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccessPage orderData={{ orderId: "#ORD-2894", tableNumber: "Meja 5" }} />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  </StrictMode>
);
