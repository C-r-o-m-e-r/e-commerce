// /src/App.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth, AuthProvider } from './context/AuthContext.jsx';
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
import AdminUserDetailsPage from './pages/AdminUserDetailsPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminOrderDetailPage from './pages/AdminOrderDetailPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import AdminCouponsPage from './pages/AdminCouponsPage'; // <-- ADDED: Import the new coupons page

import './App.css';

// --- ProtectedRoute Component ---
const ProtectedRoute = ({ children, roles }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null; // Or a loading spinner
    }

    if (!user || !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

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
                        <Route path="/seller/dashboard" element={<ProtectedRoute roles={['SELLER']}><DashboardPage /></ProtectedRoute>} />
                        <Route path="/seller/orders" element={<ProtectedRoute roles={['SELLER']}><SellerOrdersPage /></ProtectedRoute>} />
                        <Route path="/seller/orders/:id" element={<ProtectedRoute roles={['SELLER']}><SellerOrderDetailPage /></ProtectedRoute>} />
                        <Route path="/products/add" element={<ProtectedRoute roles={['SELLER']}><AddProductPage /></ProtectedRoute>} />
                        <Route path="/my-products" element={<ProtectedRoute roles={['SELLER']}><MyProductsPage /></ProtectedRoute>} />
                        <Route path="/my-coupons" element={<ProtectedRoute roles={['SELLER']}><MyCouponsPage /></ProtectedRoute>} />
                        
                        {/* Shared Edit Route */}
                        <Route path="/products/edit/:id" element={
                            <ProtectedRoute roles={['SELLER', 'ADMIN']}>
                                <EditProductPage />
                            </ProtectedRoute>
                        } />
                        
                        {/* --- Admin Routes (Protected) --- */}
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <DashboardPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminUsersPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/users/:userId" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminUserDetailsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/products" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminProductsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/orders" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminOrdersPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/orders/:orderId" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminOrderDetailPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/categories" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminCategoriesPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/reviews" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminReviewsPage />
                            </ProtectedRoute>
                        } />
                        {/* <-- ADDED: New route for the coupon management page --> */}
                        <Route path="/admin/coupons" element={
                            <ProtectedRoute roles={['ADMIN']}>
                                <AdminCouponsPage />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
                <ScrollToTopButton />
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;