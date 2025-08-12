// src/App.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx'; // 1. Ensure ThemeProvider is imported

import Header from './components/Header';
import ScrollToTopButton from './components/ScrollToTopButton.jsx';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddProductPage from './pages/AddProductPage';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import MyProductsPage from './pages/MyProductsPage.jsx';
import EditProductPage from './pages/EditProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import WishlistsPage from './pages/WishlistsPage.jsx';
import WishlistDetailPage from './pages/WishlistDetailPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import AccountLayout from './pages/AccountLayout.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import SellerOrdersPage from './pages/SellerOrdersPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SellerOrderDetailPage from './pages/SellerOrderDetailPage.jsx';

import './App.css';

function App() {
    return (
        <AuthProvider>
            {/* 2. Wrap the app in ThemeProvider so all children (like Header) can use the theme */}
            <ThemeProvider>
                <Header />
                <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
                <main className="container">
                    <Routes>
                        {/* All your routes go here... */}
                        <Route path="/" element={<ProductsPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/account" element={<AccountLayout />}>
                            <Route index element={<Navigate to="profile" replace />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="wishlists" element={<WishlistsPage />} />
                        </Route>
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/wishlists/:id" element={<WishlistDetailPage />} />
                        <Route path="/orders/:id" element={<OrderDetailPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/seller/dashboard" element={<DashboardPage />} />
                        <Route path="/seller/orders" element={<SellerOrdersPage />} />
                        <Route path="/seller/orders/:id" element={<SellerOrderDetailPage />} />
                        <Route path="/products/add" element={<AddProductPage />} />
                        <Route path="/my-products" element={<MyProductsPage />} />
                        <Route path="/products/edit/:id" element={<EditProductPage />} />
                    </Routes>
                </main>
                <ScrollToTopButton />
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;