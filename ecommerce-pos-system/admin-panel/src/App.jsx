import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Inventory from './pages/Inventory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
