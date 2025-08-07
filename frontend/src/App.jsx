// src/App.jsx

import { Routes, Route } from 'react-router-dom';
// --- START: Added imports for react-toastify ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// --- END: Added imports ---

import Header from './components/Header';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddProductPage from './pages/AddProductPage';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import MyProductsPage from './pages/MyProductsPage.jsx';
import EditProductPage from './pages/EditProductPage.jsx';
import CartPage from './pages/CartPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import WishlistsPage from './pages/WishlistsPage.jsx';
import WishlistDetailPage from './pages/WishlistDetailPage.jsx';

import './App.css';

function App() {
    return (
        <>
            <Header />
            {/* --- START: Added ToastContainer component --- */}
            {/* This component will render all our notifications */}
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark" // Set the theme to dark to match your site
            />
            {/* --- END: Added ToastContainer component --- */}
            <main className="container">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<ProductsPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* User Routes (Logged In) */}
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/wishlists" element={<WishlistsPage />} />
                    <Route path="/wishlists/:id" element={<WishlistDetailPage />} />

                    {/* Seller Routes */}
                    <Route path="/products/add" element={<AddProductPage />} />
                    <Route path="/my-products" element={<MyProductsPage />} />
                    <Route path="/products/edit/:id" element={<EditProductPage />} />
                </Routes>
            </main>
        </>
    );
}

export default App;