// src/App.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth, AuthProvider } from './context/AuthContext.jsx'; // 1. Import useAuth
import { ThemeProvider } from './context/ThemeContext.jsx';

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
import MyCouponsPage from './pages/MyCouponsPage.jsx';
import AdminUsersPage from './pages/AdminUsersPage';

import './App.css';

// --- Admin Route Protection ---
// This component checks if a user is an admin.
// If so, it shows the page. If not, it redirects them to the homepage.
const AdminRoute = ({ children }) => {
    const { user, isLoading } = useAuth();

    // While authentication is loading, show nothing to prevent a flash redirect
    if (isLoading) {
        return null; 
    }

    // If there's no user or the user is not an ADMIN, redirect
    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    // If the user is an admin, show the requested page
    return children;
};


function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Header />
                <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
                <main className="container">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<ProductsPage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:id" element={<ProductDetailPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Nested Account Routes */}
                        <Route path="/account" element={<AccountLayout />}>
                            <Route index element={<Navigate to="profile" replace />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="orders" element={<OrdersPage />} />
                            <Route path="wishlists" element={<WishlistsPage />} />
                        </Route>

                        {/* Standalone User Routes */}
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/wishlists/:id" element={<WishlistDetailPage />} />
                        <Route path="/orders/:id" element={<OrderDetailPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />

                        {/* Seller Routes */}
                        <Route path="/seller/dashboard" element={<DashboardPage />} />
                        <Route path="/seller/orders" element={<SellerOrdersPage />} />
                        <Route path="/seller/orders/:id" element={<SellerOrderDetailPage />} />
                        <Route path="/products/add" element={<AddProductPage />} />
                        <Route path="/my-products" element={<MyProductsPage />} />
                        <Route path="/products/edit/:id"element={<EditProductPage />} />
                        <Route path="/my-coupons" element={<MyCouponsPage />} />
                        
                        {/* --- Admin Routes (Protected) --- */}
                        <Route path="/admin/dashboard" element={
                            <AdminRoute>
                                <DashboardPage />
                            </AdminRoute>
                        } />
                        <Route path="/admin/users" element={
                            <AdminRoute>
                                <AdminUsersPage />
                            </AdminRoute>
                        } />
                    </Routes>
                </main>
                <ScrollToTopButton />
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;