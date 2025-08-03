// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddProductPage from './pages/AddProductPage';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import MyProductsPage from './pages/MyProductsPage.jsx';
import EditProductPage from './pages/EditProductPage.jsx';
import CartPage from './pages/CartPage.jsx'; // <== 1. Import the new Cart page

import './App.css';

function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Seller Routes */}
          <Route path="/products/add" element={<AddProductPage />} />
          <Route path="/my-products" element={<MyProductsPage />} />
          <Route path="/products/edit/:id" element={<EditProductPage />} />
          
          {/* Buyer Routes */}
          <Route path="/cart" element={<CartPage />} /> {/* <== 2. Add the route for the Cart page */}
        </Routes>
      </main>
    </>
  );
}

export default App;